// server/index.js
require('dotenv').config(); // Carga variables del archivo .env
const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose'); // Descomentaremos esto cuando configuremos la DB

const app = express();
// Usa el puerto definido en .env o el 3000 por defecto
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
// Permite que nuestro juego (cliente) en otro puerto hable con este servidor
app.use(cors());
// Permite al servidor entender datos en formato JSON
app.use(express.json());

// --- RUTAS DE PRUEBA (API) ---
// Ruta base para verificar que el servidor está vivo
app.get('/api/status', (req, res) => {
    console.log('--> Petición de estado recibida del cliente');
    res.json({
        estado: 'Online',
        mensaje: 'Bienvenido al backend de unaBomber',
        fecha: new Date().toISOString()
    });
});

// --- INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`\n=================================`);
    console.log(`🚀 Servidor Backend corriendo en: http://localhost:${PORT}`);
    console.log(`   Prueba el estado en: http://localhost:${PORT}/api/status`);
    console.log(`=================================\n`);
});