require('dotenv').config();
const express = require('express');
const path = require('path');

// Importar las rutas de la API
const alimentacionRoutes = require('./routes/alimentacion');
const busquedaRoutes = require('./routes/busqueda');
const rutinasRoutes = require('./routes/rutinas');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
// Parsear JSON en las peticiones
app.use(express.json());
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));


// --- RUTAS DE LAS VISTAS (FRONTEND) ---
// Servir el index.html principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Servir la vista del módulo de alimentación
app.get('/alimentacion', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'alimentacion.html'));
});

// Servir la vista del módulo de búsqueda de ejercicios
app.get('/busqueda', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'busqueda.html'));
});

// Servir la vista del módulo de rutinas de entrenamiento
app.get('/rutinas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'rutinas.html'));
});


// Servir la vista del módulo de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Servir la vista del módulo de registro
app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registro.html'));
});


// --- RUTAS DE LA API (BACKEND) ---
app.use('/api/alimentacion', alimentacionRoutes);
app.use('/api/busqueda', busquedaRoutes);
app.use('/api/rutinas', rutinasRoutes);
app.use('/api/user', userRoutes);


// --- MANEJO DE ERRORES ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal en el servidor!');
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor unificado de NutriFit corriendo en http://localhost:${PORT}`);
});
