const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Importar rutas
const tareasRoutes = require('./routes/tareas');
const authRoutes = require('./routes/auth');

app.use('/tareas', tareasRoutes);
app.use('/auth', authRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de Tareas! 🚀');
});
