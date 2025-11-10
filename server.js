// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // sirve index.html y demás archivos

// --- Base de datos SQLite ---
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
  } else {
    console.log('✅ Base de datos SQLite conectada.');
  }
});

// Crear tabla si no existe (actualizada con los nuevos campos)
db.run(`
  CREATE TABLE IF NOT EXISTS alumnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    dni TEXT NOT NULL,
    curso TEXT NOT NULL,
    email TEXT NOT NULL
  )
`);

// --- Rutas API ---
app.get('/api/alumnos', (req, res) => {
  db.all('SELECT * FROM alumnos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/alumnos', (req, res) => {
  const { nombre, apellido, dni, curso, email } = req.body;
  if (!nombre || !apellido || !dni || !curso || !email)
    return res.status(400).json({ error: 'Datos incompletos' });

  db.run(
    'INSERT INTO alumnos (nombre, apellido, dni, curso, email) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, dni, curso, email],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, nombre, apellido, dni, curso, email });
    }
  );
});

// --- Ruta principal para servir la web ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Iniciar servidor ---
app.listen(PORT, () => console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`));
