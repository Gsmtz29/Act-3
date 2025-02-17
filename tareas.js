const express = require('express');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');

const router = express.Router();
const TAREAS_FILE = './tareas.json';

// Middleware para verificar token
function verificarToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send('Token no proporcionado.');
  
  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) return res.status(401).send('Token inválido.');
    req.usuario = decoded;
    next();
  });
}

// Leer tareas
async function obtenerTareas() {
  try {
    const data = await fs.readFile(TAREAS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Guardar tareas
async function guardarTareas(tareas) {
  await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2));
}

// GET /tareas - Obtener todas las tareas
router.get('/', verificarToken, async (req, res) => {
  const tareas = await obtenerTareas();
  res.json(tareas);
});

// POST /tareas - Agregar una nueva tarea
router.post('/', verificarToken, async (req, res) => {
  const { titulo, descripcion } = req.body;
  const tareas = await obtenerTareas();
  const nuevaTarea = { id: tareas.length + 1, titulo, descripcion };
  tareas.push(nuevaTarea);
  await guardarTareas(tareas);
  res.status(201).json(nuevaTarea);
});

// PUT /tareas/:id - Actualizar una tarea
router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion } = req.body;
  let tareas = await obtenerTareas();
  const index = tareas.findIndex(t => t.id == id);
  if (index === -1) return res.status(404).send('Tarea no encontrada.');

  tareas[index] = { id: Number(id), titulo, descripcion };
  await guardarTareas(tareas);
  res.json(tareas[index]);
});

// DELETE /tareas/:id - Eliminar una tarea
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  let tareas = await obtenerTareas();
  tareas = tareas.filter(t => t.id != id);
  await guardarTareas(tareas);
  res.send('Tarea eliminada.');
});

module.exports = router;
