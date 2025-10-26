const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));

// Crear carpeta temporal
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
  console.log('✅ Carpeta temporal creada');
}

// Conexión a PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '270704',
  database: 'OpenByBan'
});

// Variable para controlar el proceso MCP
let mcpProcess = null;

// FUNCIÓN MEJORADA PARA INICIAR MCP SERVER
function iniciarMCPServer() {
    console.log('🚀 Intentando iniciar MCP Server...');
    
    const mcpServerPath = path.join(__dirname, '../MCP TEST/mcp-server.py');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(mcpServerPath)) {
        console.log('❌ mcp-server.py no encontrado en:', mcpServerPath);
        return false;
    }
    
    try {
        mcpProcess = spawn('python', [mcpServerPath], {
            stdio: 'pipe', // Cambiado a 'pipe' para mejor control
            cwd: __dirname,
            detached: false
        });
        
        // Manejar salida del proceso
        mcpProcess.stdout.on('data', (data) => {
            console.log(`🤖 MCP: ${data.toString().trim()}`);
        });
        
        mcpProcess.stderr.on('data', (data) => {
            console.error(`❌ MCP Error: ${data.toString().trim()}`);
        });
        
        mcpProcess.on('error', (error) => {
            console.error('❌ Error al iniciar MCP Server:', error);
        });
        
        mcpProcess.on('exit', (code) => {
            console.log(`🔧 MCP Server terminó con código: ${code}`);
            mcpProcess = null;
        });
        
        console.log('✅ MCP Server iniciado (puerto 5000)');
        return true;
        
    } catch (error) {
        console.error('❌ Error al ejecutar MCP Server:', error);
        return false;
    }
}

// FUNCIÓN PARA VERIFICAR SI MCP ESTÁ ACTIVO
async function verificarMCPActivo() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('http://localhost:5000/health', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ MCP Server verificado:', data.status);
            return true;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('⏰ Timeout verificando MCP Server');
        } else {
            console.log('🔌 MCP Server no disponible');
        }
    }
    return false;
}

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

// RUTAS
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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
      
      await generateFinancialJSON(idempresa);
      
      return res.json({ 
        success: true, 
        message: 'Login correcto',
        jsonFile: `/temp/datos_financieros_${idempresa}.json`
      });
    } else {
      return res.json({ success: false, message: '❌ ID o contraseña incorrecta' });
    }
  } catch(err){
    console.error('❌ Error en login:', err);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Función para generar JSON (sin cambios)
async function generateFinancialJSON(idempresa) {
  try {
    const query = `
      SELECT 
        t.monto,
        t.fecha,
        t.idtipo,
        tp.descripcion as tipo_descripcion,
        c.descripcion as categoria_descripcion,
        co.descripcion as concepto_descripcion
      FROM transaccion t
      JOIN tipo tp ON t.idtipo = tp.idtipo
      JOIN categorias c ON t.categorias_idcategorias = c.idcategorias
      JOIN concepto co ON t.concepto_idconcepto = co.idconcepto
      WHERE t.idempresa = $1
      ORDER BY t.fecha DESC
    `;

    const result = await pool.query(query, [idempresa]);

    const formattedData = result.rows.map(transaction => ({
      "Monto": transaction.monto,
      "TipoDeMonto": transaction.idtipo === 1 ? "Ingreso" : "Egreso",
      "Categoria": transaction.categoria_descripcion,
      "Concepto": transaction.concepto_descripcion,
      "Fecha": transaction.fecha
    }));

    const jsonData = JSON.stringify(formattedData, null, 2);
    const fileName = `datos_financieros_${idempresa}.json`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, jsonData, 'utf8');
    console.log(`✅ Archivo JSON generado: ${filePath}`);

    return fileName;

  } catch (error) {
    console.error('❌ Error al generar JSON:', error);
    throw error;
  }
}

// Rutas estáticas (sin cambios)
app.use('/temp', express.static(tempDir));
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'), {
    headers: { 'Content-Type': 'text/css' }
  });
});
app.get('/views/finanzas-empresas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'finanzas-empresas.html'));
});
app.get('/views/styles-view.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'styles-view.css'), {
    headers: { 'Content-Type': 'text/css' }
  });
});

// Ruta para verificar estado MCP
app.get('/mcp-status', async (req, res) => {
  const estaActivo = await verificarMCPActivo();
  
  if (estaActivo) {
    res.json({ 
      status: 'active', 
      message: 'MCP Server está funcionando en puerto 5000'
    });
  } else {
    // Intentar reiniciar
    const reinicioExitoso = iniciarMCPServer();
    res.json({ 
      status: 'inactive', 
      message: 'MCP Server no está disponible',
      reiniciando: reinicioExitoso
    });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor principal corriendo en http://localhost:${PORT}`);
  
  // Esperar 3 segundos y luego iniciar MCP Server
  setTimeout(async () => {
    console.log('🔄 Verificando MCP Server...');
    
    const estaActivo = await verificarMCPActivo();
    
    if (!estaActivo) {
      console.log('🔧 MCP Server no está activo, iniciando...');
      iniciarMCPServer();
    } else {
      console.log('✅ MCP Server ya está activo');
    }
  }, 3000);
});