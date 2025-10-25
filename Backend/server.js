// backend/server.js
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos desde la carpeta padre (HACKMTY)
// Ej: index.html, styles.css, assets/, etc.
app.use(express.static(path.join(__dirname, "..")));

// Simple logger para desarrollo
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// --- Session ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "temp-secret-123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Ajusta según necesites (secure: true requiere https)
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  })
);

// --- Usuarios de ejemplo ---
// En producción usa una base de datos (bcrypt para las contraseñas)
const users = [
  { username: "admin", password: "1234", name: "Administrador" },
  { username: "user", password: "abcd", name: "Usuario Ejemplo" },
];

// --- Rutas ---
// Servir el index (asegura que esté en ../index.html respecto a backend/)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Ruta de login (form post desde index.html)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send(`
      <h2>Faltan datos</h2>
      <a href="/">Regresar</a>
    `);
  }

  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).send(`
      <h2>Usuario o contraseña incorrectos</h2>
      <a href="/">Regresar</a>
    `);
  }

  req.session.user = { username: user.username, name: user.name };
  res.redirect("/dashboard");
});

// Middleware para proteger rutas
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

// Dashboard protegido
app.get("/dashboard", requireAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard - Algo.IA</title>
      <link rel="stylesheet" href="/styles.css">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body { background-color: #f5f5f5; font-family: 'Inter', sans-serif; }
        .dashboard-container { max-width: 800px; margin: 80px auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { color: #ec0000; margin-bottom: 16px; }
        a { color: #ec0000; text-decoration: none; font-weight: 600; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="dashboard-container">
        <h1>¡Bienvenido, ${req.session.user.name}!</h1>
        <p>Has iniciado sesión correctamente en tu asistente financiero.</p>
        <p><a href="/logout">Cerrar sesión</a></p>
      </div>
    </body>
    </html>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    // Ignoramos el error al destruir la sesión en este ejemplo
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Ruta ejemplo para obtener info del usuario (JSON)
app.get("/api/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ logged: false });
  res.json({ logged: true, user: req.session.user });
});

// Error handler básico
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).send("Error interno del servidor");
});

// --- Levantar servidor ---
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
