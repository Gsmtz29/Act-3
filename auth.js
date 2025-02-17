const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;

const router = express.Router();
const USERS_FILE = './usuarios.json';

async function leerUsuarios() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function guardarUsuarios(usuarios) {
  await fs.writeFile(USERS_FILE, JSON.stringify(usuarios, null, 2));
}

// Registro de usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const usuarios = await leerUsuarios();
  usuarios.push({ username, password: hashedPassword });
  await guardarUsuarios(usuarios);
  res.status(201).send('Usuario registrado correctamente.');
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const usuarios = await leerUsuarios();
  const usuario = usuarios.find(user => user.username === username);
  if (!usuario) return res.status(404).send('Usuario no encontrado.');

  const match = await bcrypt.compare(password, usuario.password);
  if (!match) return res.status(401).send('Contraseña incorrecta.');

  const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
