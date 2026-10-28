import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";

const app = express();
const port = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);


app.get('/api', (req, res)=>{
    res.status(200).json({
        message: 'API funcionando correctamente'
    });
});

app.use((req, res)=>{
    res.status(404).json({
        error: 'ruta no encontrada'
    });
});

app.use((err, req, res, next) =>{
    if(err instanceof multer.MulterError){
        return res.status(400).json({
            error: err.message
        });
    }
    console.error(err);

    res.status(500).json({
        error: 'Error interno del servicio'
    });
});

app.listen(port,()=>{
    console.log(`Servidor ejecutandose en http://localhost:${port}`);
});