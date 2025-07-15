const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(session({
  secret: 'clave-secreta-super-segura',
  resave: false,
  saveUninitialized: true,
}));

const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS comentarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      mensaje TEXT,
      estrellas INTEGER,
      aprobado INTEGER DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT
    );
  `);

  db.get("SELECT * FROM admin WHERE username = 'admin'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO admin (username, password) VALUES (?, ?)", ['admin', '1234']);
    }
  });
});

function auth(req, res, next) {
  if (req.session.user) return next();
  return res.status(401).json({ message: 'No autorizado' });
}

app.post('/comentario', (req, res) => {
  const { nombre, mensaje, estrellas } = req.body;
  db.run('INSERT INTO comentarios (nombre, mensaje, estrellas) VALUES (?, ?, ?)',
    [nombre, mensaje, estrellas],
    err => {
      if (err) return res.status(500).json({ message: 'Error al guardar comentario.' });
      res.json({ message: '✅ Comentario guardado con éxito.' });
    });
});

app.get('/comentarios', (req, res) => {
  db.all('SELECT * FROM comentarios ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      req.session.user = row.username;
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/admin/comentarios', auth, (req, res) => {
  db.all('SELECT * FROM comentarios ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/admin/comentarios/:id/aprobar', auth, (req, res) => {
  const id = req.params.id;
  db.run('UPDATE comentarios SET aprobado = 1 WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/admin/comentarios/:id', auth, (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM comentarios WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put('/admin/comentarios/:id', auth, (req, res) => {
  const id = req.params.id;
  const { mensaje } = req.body;
  db.run('UPDATE comentarios SET mensaje = ? WHERE id = ?', [mensaje, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
