import multer from "multer";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            path.join(
                __dirname,
                "../../public/img/users"
            )
        );

    },

    filename: function (req, file, cb) {

        const extension = path.extname(file.originalname);

        const random = crypto
            .randomBytes(6)
            .toString("hex");

        const filename =
            `avatar-${Date.now()}-${random}${extension}`;

        cb(null, filename);

    }

});


const petsStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            path.join(
                __dirname,
                "../../public/img/pets"
            )
        );

    },

    filename: function (req, file, cb) {

        const extension = path.extname(file.originalname);

        const random = crypto
            .randomBytes(6)
            .toString("hex");

        const filename =
            `pet-${Date.now()}-${random}${extension}`;

        cb(null, filename);

    }

});



const uploadUser = multer({
    storage: usersStorage
});

const uploadPet = multer({
    storage: petsStorage
});



export {
    uploadUser,
    uploadPet
};