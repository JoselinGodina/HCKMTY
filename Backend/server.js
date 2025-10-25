const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS)
app.use(express.static(path.join(__dirname, '..')));

// Conexión a PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '270704',
  database: 'OpenByBan'
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

// Ruta para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Ruta POST /login
app.post('/login', async (req, res) => {
  const { idempresa, contrasena } = req.body;

  if(!idempresa || !contrasena){
    return res.status(400).json({ success: false, message: '⚠️ Faltan datos' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM empresa WHERE idempresa=$1 AND contrasena=$2',
      [idempresa, contrasena]
    );

    if(result.rows.length > 0){
      console.log(`Usuario ${idempresa} logeado correctamente`);
      return res.json({ success: true, message: 'Login correcto' });
    } else {
      return res.json({ success: false, message: '❌ ID o contraseña incorrecta' });
    }
  } catch(err){
    console.error('❌ Error en login:', err);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
