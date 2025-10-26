# Algo.IA — Plataforma de Gestión Financiera Inteligente

Algo.IA es una página web de gestión financiera inteligente orientada a Banorte. Combina datos financieros reales, modelos de Machine Learning e integración visual con Power BI para entregar insights, predicciones y simulaciones que ayudan a la toma de decisiones. Incluye un asistente virtual (Algo.IA) que resuelve dudas financieras y guía al usuario dentro de la plataforma.

## Características principales

* **Dashboard financiero** personalizado según parámetros definidos por el usuario (periodo, cuentas, categorías).
* **Visualizaciones Power BI** integradas (gráficas de ingresos/egresos, categorías de gasto, flujo de dinero, semáforo de salud financiera).
* **Simulador de inversiones**: proyección de escenarios futuros basados en datos históricos y modelos ML.
* **Análisis predictivo**: predicción de transferencias/montos en función del tiempo.
* **Semáforo de salud financiera**: indicador visual (verde/amarillo/rojo) con alertas y recomendaciones automáticas.
* **Asistente virtual (Algo.IA)**: chat/agent que utiliza IA (Gemini + Google API) para resolver dudas, explicar métricas y proponer acciones.
* **Gestión de usuarios**: login con información empresarial.

## Caso de uso (flujo típico)

1. El usuario se **loguea** y accede al panel.
2. Visualiza un **resumen**: saldo actual, ingresos, egresos, flujo de caja y semáforo de salud financiera.
3. Las **gráficas de Power BI** muestran:
   * Distribución de gastos por categorías (X = categorías, Y = montos).
   * Predicción temporal de transferencias (X = tiempo, Y = monto).
4. El usuario puede correr el **simulador de inversiones** para ver escenarios (optimista/neutral/pesimista).
5. Si tiene dudas, interactúa con **Algo.IA** para obtener explicaciones, recomendaciones y pasos a seguir.

## Arquitectura y componentes

* **Frontend**: HTML, CSS y JavaScript — interfaz responsiva, con integración de Power BI y comunicación con el backend.
* **Backend**: Python (FastAPI) que gestiona los datos, autenticación y llamadas al servidor IA.
* **Base de datos**: PostgreSQL administrado con pgAdmin.
* **Servidor de IA (MCL)**: Python, integrando modelos de Machine Learning y Gemini (Google API) para el asistente inteligente y predicciones.
* **Power BI**: informes embebidos (Power BI Embedded o publish-to-web con control de seguridad).


## Tecnologías utilizadas

* **Frontend**: HTML5, CSS3, JavaScript
* **Backend**: Python (FastAPI / Flask)
* **Base de Datos**: PostgreSQL (pgAdmin)
* **Servidor IA**: Python + Gemini + Google API (MCL Server)
* **Visualización**: Power BI Embedded

## Integración con Power BI

1. Crear informes en Power BI Desktop y publicar en Power BI Service.
2. Usar **Power BI Embedded** (Azure) o el JS SDK `powerbi-client` para embeber reportes en la página HTML.
3. Controlar el acceso mediante tokens embebidos y roles definidos en el backend.

---

## Instalación (desarrollo)

### Requisitos

* Python 3.9+
* PostgreSQL + pgAdmin
* Node.js (para scripts JS si es necesario)
* Power BI (para crear y publicar reportes)

### Backend

```bash
# clonar repo
git clone <repo-url>
cd backend

# instalar dependencias
pip install -r requirements.txt

# definir variables de entorno
DATABASE_URL=postgresql://user:password@localhost:5432/algoia
GEMINI_API_KEY=<tu_api_key>
GOOGLE_API_KEY=<tu_api_key>

# ejecutar servidor


### Frontend

cd frontend
# abrir index.html en el navegador o usar un servidor local
python -m http.server 3000
  

---

## Configuración importante

* `DATABASE_URL` — conexión a PostgreSQL.
* `GEMINI_API_KEY` — clave para usar el modelo de lenguaje Gemini.
* `GOOGLE_API_KEY` — clave para servicios adicionales de Google Cloud.
* `POWERBI_EMBED_URL` — URL del reporte Power BI a mostrar.


