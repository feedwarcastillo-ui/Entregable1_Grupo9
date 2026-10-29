import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
    uploadPet
} from "../middlewares/multer.middleware.js";


const __filename =
    fileURLToPath(
        import.meta.url
    );

const __dirname =
    path.dirname(
        __filename
    );


const router =
    express.Router();


const petsFile =
    path.join(
        __dirname,
        "../data/pets.json"
    );


// =======================================
// FUNCIONES AUXILIARES
// =======================================

async function readPets() {

    const data =
        await fs.readFile(
            petsFile,
            "utf8"
        );


    if (!data.trim()) {
        return [];
    }


    return JSON.parse(
        data
    );
}


async function writePets(pets) {

    await fs.writeFile(
        petsFile,

        JSON.stringify(
            pets,
            null,
            2
        ),

        "utf8"
    );
}


function getPublicFilePath(fileUrl) {

    return path.join(

        __dirname,

        "../../public",

        fileUrl.replace(
            /^\/+/,
            ""
        )
    );
}


async function deleteFileSafe(fileUrl) {

    if (!fileUrl) {
        return;
    }


    try {

        await fs.unlink(
            getPublicFilePath(
                fileUrl
            )
        );

    } catch (error) {

        console.log(
            `No se pudo eliminar el archivo: ${fileUrl}`
        );
    }
}


async function deleteUploadedFiles(
    files = []
) {

    for (
        const file
        of files
    ) {

        try {

            await fs.unlink(
                file.path
            );

        } catch (error) {

            console.log(
                "No se pudo eliminar un archivo temporal"
            );
        }
    }
}


// =======================================
// GET /api/pets
// =======================================

router.get(
    "/",
    async (req, res) => {

        try {

            const pets =
                await readPets();


            res
                .status(200)
                .json(
                    pets
                );

        } catch (error) {

            console.error(
                error
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al leer las mascotas"
                });
        }
    }
);


// =======================================
// GET /api/pets/:id
// =======================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(
                    id
                ) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const pets =
                await readPets();


            const pet =
                pets.find(
                    pet =>
                        pet.id === id
                );


            if (!pet) {

                return res
                    .status(404)
                    .json({
                        error:
                            "Mascota no encontrada"
                    });
            }


            res
                .status(200)
                .json(
                    pet
                );

        } catch (error) {

            console.error(
                error
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al consultar la mascota"
                });
        }
    }
);


// =======================================
// POST /api/pets
// =======================================

router.post(

    "/",

    uploadPet.array(
        "img",
        5
    ),

    async (req, res) => {

        try {

            const {
                especie,
                color,
                edad,
                sexo
            } = req.body ?? {};


            if (
                !especie?.trim() ||
                !color?.trim() ||
                edad === undefined ||
                String(
                    edad
                ).trim() === "" ||
                !sexo?.trim()
            ) {

                await deleteUploadedFiles(
                    req.files
                );


                return res
                    .status(400)
                    .json({
                        error:
                            "Especie, color, edad y sexo son obligatorios"
                    });
            }


            const numericAge =
                Number(
                    edad
                );


            if (
                Number.isNaN(
                    numericAge
                ) ||
                numericAge < 0
            ) {

                await deleteUploadedFiles(
                    req.files
                );


                return res
                    .status(400)
                    .json({
                        error:
                            "La edad debe ser un número válido"
                    });
            }


            const pets =
                await readPets();


            const newId =
                pets.length === 0
                    ? 1
                    : Math.max(
                        ...pets.map(
                            pet =>
                                pet.id
                        )
                    ) + 1;


            const images =
                req.files

                    ? req.files.map(
                        file =>
                            `/img/pets/${file.filename}`
                    )

                    : [];


            const newPet = {

                id:
                    newId,

                especie:
                    especie.trim(),

                color:
                    color.trim(),

                edad:
                    numericAge,

                sexo:
                    sexo.trim(),

                img:
                    images
            };


            pets.push(
                newPet
            );


            await writePets(
                pets
            );


            res
                .status(201)
                .json({

                    message:
                        "Mascota creada correctamente",

                    pet:
                        newPet
                });

        } catch (error) {

            console.error(
                error
            );


            await deleteUploadedFiles(
                req.files || []
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al crear la mascota"
                });
        }
    }
);

// =======================================
// PUT /api/pets/:id
// =======================================

router.put(
    "/:id",

    uploadPet.array(
        "img",
        5
    ),

    async (req, res) => {

        try {

            const body =
                req.body ?? {};

            const id =
                Number(req.params.id);


            // Validar ID
            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                await deleteUploadedFiles(
                    req.files || []
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const pets =
                await readPets();


            const index =
                pets.findIndex(
                    pet =>
                        pet.id === id
                );


            // Mascota no existe
            if (index === -1) {

                await deleteUploadedFiles(
                    req.files || []
                );

                return res
                    .status(404)
                    .json({
                        error:
                            "Mascota no encontrada"
                    });
            }


            const currentPet =
                pets[index];


            // Validar que llegue algo para actualizar
            const hasData =
                body.especie?.trim() ||
                body.color?.trim() ||
                body.edad !== undefined ||
                body.sexo?.trim() ||
                (
                    req.files &&
                    req.files.length > 0
                );


            if (!hasData) {

                return res
                    .status(400)
                    .json({
                        error:
                            "Debes enviar al menos un campo para actualizar"
                    });
            }


            // ===================================
            // EDAD
            // ===================================

            let newAge =
                currentPet.edad;


            if (
                body.edad !== undefined &&
                String(body.edad).trim() !== ""
            ) {

                newAge =
                    Number(
                        body.edad
                    );


                if (
                    Number.isNaN(newAge) ||
                    newAge < 0
                ) {

                    await deleteUploadedFiles(
                        req.files || []
                    );

                    return res
                        .status(400)
                        .json({
                            error:
                                "La edad debe ser válida"
                        });
                }
            }


            // ===================================
            // IMÁGENES NUEVAS
            // ===================================

            const newUploadedImages =
                (
                    req.files || []
                ).map(
                    file =>
                        `/img/pets/${file.filename}`
                );


            const hasNewImages =
                newUploadedImages.length > 0;


            const replaceImages =
                body.replaceImages ===
                "true";


            let newImages =
                Array.isArray(
                    currentPet.img
                )
                    ? [
                        ...currentPet.img
                    ]
                    : [];


            // Si llegan nuevas imágenes:
            // replaceImages = true -> reemplaza
            // replaceImages = false -> agrega
            if (hasNewImages) {

                if (replaceImages) {

                    newImages =
                        newUploadedImages;

                } else {

                    newImages = [
                        ...newImages,
                        ...newUploadedImages
                    ];
                }
            }


            // Máximo 5 imágenes
            if (
                newImages.length > 5
            ) {

                await deleteUploadedFiles(
                    req.files || []
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "Una mascota puede tener máximo 5 imágenes"
                    });
            }


            // ===================================
            // OBJETO ACTUALIZADO
            // ===================================

            const updatedPet = {

                ...currentPet,

                especie:
                    body.especie?.trim() ||
                    currentPet.especie,

                color:
                    body.color?.trim() ||
                    currentPet.color,

                edad:
                    newAge,

                sexo:
                    body.sexo?.trim() ||
                    currentPet.sexo,

                img:
                    newImages
            };


            pets[index] =
                updatedPet;


            await writePets(
                pets
            );


            // Si se reemplazaron imágenes,
            // eliminar las anteriores físicamente
            if (
                hasNewImages &&
                replaceImages
            ) {

                for (
                    const image
                    of currentPet.img || []
                ) {

                    await deleteFileSafe(
                        image
                    );
                }
            }


            return res
                .status(200)
                .json({

                    message:
                        "Mascota actualizada correctamente",

                    pet:
                        updatedPet
                });

        } catch (error) {

            console.error(error);


            await deleteUploadedFiles(
                req.files || []
            );


            return res
                .status(500)
                .json({
                    error:
                        "Error al actualizar la mascota"
                });
        }
    }
);

// =======================================
// DELETE /api/pets/:id
// =======================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(
                    id
                ) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const pets =
                await readPets();


            const index =
                pets.findIndex(
                    pet =>
                        pet.id === id
                );


            if (
                index === -1
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            "Mascota no encontrada"
                    });
            }


            const deletedPet =
                pets[index];


            pets.splice(
                index,
                1
            );


            await writePets(
                pets
            );


            for (
                const image
                of (
                    deletedPet.img ||
                    []
                )
            ) {

                await deleteFileSafe(
                    image
                );
            }


            res
                .status(200)
                .json({
                    message:
                        "Mascota eliminada correctamente"
                });

        } catch (error) {

            console.error(
                error
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al eliminar la mascota"
                });
        }
    }
);


export default router;