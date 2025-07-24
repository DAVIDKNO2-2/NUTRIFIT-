const axios = require('axios');

const API_BASE_URL = 'https://exercisedb.p.rapidapi.com';
const RAPIDAPI_KEY = '1c0a5237b1msh39ee394c73853b8p1a2b6cjsnd5e0840b6583';
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
    console.error("Error: La variable de entorno API_KEY no está definida.");
}

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
    }
});

const getBodyParts = async (req, res) => {
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
};

const getExercises = async (req, res) => {
    if (!RAPIDAPI_KEY) {
        return res.status(500).json({ message: "Error de configuración del servidor: API Key no encontrada." });
    }
    try {
        const response = await axiosInstance.get('/exercises', { params: { limit: 100, offset: 0 } });
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener exercises:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error al contactar la API de ExerciseDB para exercises',
            details: error.response ? error.response.data : error.message
        });
    }
};

module.exports = {
    getBodyParts,
    getExercises,
};
