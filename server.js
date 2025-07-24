// Cargar variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);


// Middleware para parsear JSON (si es necesario para futuras rutas POST/PUT)
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE LA API ---
app.use('/api', apiRoutes);

// --- RUTA PRINCIPAL PARA SERVIR EL FRONTEND ---
app.get('/', (req, res) => {
    res.render('index');
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
