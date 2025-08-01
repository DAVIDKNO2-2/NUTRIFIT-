const axios = require('axios');

const API_BASE_URL = 'https://exercisedb.p.rapidapi.com';
const RAPIDAPI_KEY = '16efbd2c27msh01211558eccae07p1daae7jsn261930235be5';
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';

// Configuración de Axios
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
    }
});

// Obtener lista de partes del cuerpo
const getBodyParts = async (req, res) => {
    try {
        const response = await axiosInstance.get('/exercises/bodyPartList');
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error al obtener bodyParts:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Error al contactar la API de ExerciseDB para bodyParts',
            details: error.response?.data || error.message
        });
    }
};

// Obtener lista de ejercicios
const getExercises = async (req, res) => {
    try {
        const response = await axiosInstance.get('/exercises', {
            params: { limit: 100, offset: 0 }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error al obtener exercises:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Error al contactar la API de ExerciseDB para exercises',
            details: error.response?.data || error.message
        });
    }
};

module.exports = {
    getBodyParts,
    getExercises,
};
