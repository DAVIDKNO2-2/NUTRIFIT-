// Cargar variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const axios = require('axios'); // Necesitaremos axios o node-fetch

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON (si es necesario para futuras rutas POST/PUT)
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE LA API ---
// --- RUTAS DE LA API ---
const API_BASE_URL = 'https://exercisedb.p.rapidapi.com';
const RAPIDAPI_KEY = '1c0a5237b1msh39ee394c73853b8p1a2b6cjsnd5e0840b6583';
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';


if (!RAPIDAPI_KEY) {
    console.error("Error: La variable de entorno API_KEY no está definida.");
    // Considerar salir del proceso si la API Key es crucial y no está
    // process.exit(1);
}

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
    }
});

// Ruta para obtener la lista de partes del cuerpo
app.get('/api/bodyparts', async (req, res) => {
    if (!RAPIDAPI_KEY) {
        return res.status(500).json({ message: "Error de configuración del servidor: API Key no encontrada." });
    }
    try {
        const response = await axiosInstance.get('/exercises/bodyPartList');
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener bodyParts:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error al contactar la API de ExerciseDB para bodyParts',
            details: error.response ? error.response.data : error.message
        });
    }
});

// Ruta para obtener los ejercicios
app.get('/api/exercises', async (req, res) => {
    if (!RAPIDAPI_KEY) {
        return res.status(500).json({ message: "Error de configuración del servidor: API Key no encontrada." });
    }
    try {
        // El frontend pedirá todos y filtrará. Si se quisiera paginación/limit desde el backend, se pasarían query params.
        // Por ahora, replicamos el limit=100 del frontend original.
        const response = await axiosInstance.get('/exercises', { params: { limit: 100, offset: 0 } });
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener exercises:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error al contactar la API de ExerciseDB para exercises',
            details: error.response ? error.response.data : error.message
        });
    }
});

// --- RUTA PRINCIPAL PARA SERVIR EL FRONTEND ---
// Asegurarse que esta ruta no choque con 'api' si se sirve desde la raíz.
// Ya que usamos express.static para 'public', si hay un index.html en public,
// GET '/' podría servirlo automáticamente. Explicitamente definirlo es más claro.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de manejo de errores global (opcional, pero buena práctica)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal en el servidor!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
