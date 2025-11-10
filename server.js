// server.js
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- Base de datos SQLite ---
const db = new Database('./database.db');

// Crear tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS alumnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    dni TEXT NOT NULL,
    curso TEXT NOT NULL,
    email TEXT NOT NULL
  )
`).run();

// --- Rutas API ---
app.get('/api/alumnos', (req, res) => {
  const alumnos = db.prepare('SELECT * FROM alumnos').all();
  res.json(alumnos);
});

app.post('/api/alumnos', (req, res) => {
  const { nombre, apellido, dni, curso, email } = req.body;
  if (!nombre || !apellido || !dni || !curso || !email)
    return res.status(400).json({ error: 'Datos incompletos' });

  const result = db
    .prepare('INSERT INTO alumnos (nombre, apellido, dni, curso, email) VALUES (?, ?, ?, ?, ?)')
    .run(nombre, apellido, dni, curso, email);

  res.json({ id: result.lastInsertRowid, nombre, apellido, dni, curso, email });
});

// --- Ruta principal ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Iniciar servidor ---
app.listen(PORT, () => console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`));