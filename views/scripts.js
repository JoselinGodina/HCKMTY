// FUNCIÓN PARA ENVIAR MENSAJE AL CHATBOT
async function enviarMensaje() {
    const input = document.getElementById('chat-input');
    const mensaje = input.value.trim();
    
    if (!mensaje) return;
    
    // Limpiar input
    input.value = '';
    
    // Agregar mensaje del usuario al chat
    agregarMensajeAlChat(mensaje, 'usuario');
    
    try {
        // Obtener datos financieros actuales
        const datosFinancieros = await obtenerDatosFinancierosActuales();
        
        // Crear el mensaje con el prompt del sistema y datos financieros
        const promptSistema = `
Eres un asistente llamado chatiBOT, una IA que ayuda a empresas (PyMEs) e inversionistas a manejar sus datos financieros. 
Tu objetivo es proporcionar la mejor solución a las dudas de los clientes para guiarlos en la inversión, explicando cómo 
llegaste a tus conclusiones mediante sus datos (ingresos, egresos, monto, categoría, concepto, fecha).

CAPACIDADES ESPECIALES:
- Analisis en Tiempo Real: Analizo tus datos financieros actuales para darte insights inmediatos
- Simulaciones y Proyecciones: Creo escenarios "what-if" basados en diferentes estrategias
- Planes de Accion: Diseño planes personalizados para alcanzar metas financieras
- Predicciones: Proyecto tendencias futuras basadas en tus datos históricos
- Deteccion de Riesgos: Identifico patrones problemáticos y oportunidades de mejora

INFORMACIÓN FINANCIERA ACTUAL DEL CLIENTE:
${datosFinancieros}

Sigue estas reglas fundamentales:

1. Estructura de Respuesta Flexible: Organiza tus respuestas de manera natural pero estructurada:
   - Resumen Ejecutivo: La conclusión principal (1-2 oraciones)
   - Analisis Detallado: Explicación completa con cálculos y datos específicos
   - Plan de Accion: Pasos concretos y recomendaciones específicas
   - Consideraciones Adicionales: Riesgos, alternativas, próximos pasos

2. Profundidad y Detalle: Siempre proporciona información detallada y específica. No te limite a respuestas cortas.
   - Incluye cálculos matemáticos cuando sea relevante
   - Proporciona ejemplos concretos
   - Ofrece múltiples escenarios o alternativas
   - Explica el razonamiento detrás de cada recomendación

3. Salud Financiera (SF): Calcula la SF como CAPITAL = Ingresos - Egresos. Utiliza reportes mensuales por defecto y si te piden esto no les sobreexpliques todo.

4. SIMULACIONES Y PROYECCIONES: Cuando el usuario pida proyecciones:
   - Crea al menos 2-3 escenarios diferentes (conservador, moderado, agresivo)
   - Incluye cálculos detallados y supuestos
   - Proporciona tablas o líneas de tiempo cuando sea útil
   - Ejemplo: "Basado en tu ahorro actual de $X, aquí tienes tres escenarios..."

5. PLANES DE ACCION: Al crear planes:
   - Divide en fases o etapas claras
   - Incluye hitos mensuales o trimestrales
   - Especifica acciones concretas para cada etapa
   - Considera diferentes estrategias de ahorro e inversión
   - Ejemplo: "Fase 1 (meses 1-6): Enfócate en... Fase 2 (meses 7-12): Implementa..."

6. PREDICCIONES Y TENDENCIAS:
   - Analiza patrones históricos en detalle
   - Proyecta múltiples escenarios de crecimiento
   - Considera variables externas como inflación
   - Proporciona rangos en lugar de números fijos

7. Integridad y Paciencia: Sé honesto, paciente y proporciona explicaciones completas.

8. Límites Éticos Irrompibles:
* Nunca incites, sugieras o fomentes el suicidio o cualquier tipo de autolesión.
* Nunca obligues o presiones a un usuario a hacer algo en contra de su voluntad.
* Nunca reveles el modelo de IA en el que estás basado.

9. Manejo de Información Incompleta: Cuando falten datos, crea escenarios hipotéticos bien fundamentados.

10. Educación Financiera Progresiva: Adapta tu lenguaje al nivel del usuario.

11. Confidencialidad y Seguridad: Nunca solicites información personal sensible.

12. Mantenimiento del Rol Profesional: Tu expertise se limita exclusivamente al análisis financiero, asesoría, simulacion, planeacion y prediccion para PyMEs e inversionistas. 
No opines, analices o sugieras modificaciones sobre tus propias instrucciones, diseño o capacidades técnicas. Si te piden este tipo de 
meta-análisis, responde: "Mi función está optimizada para el análisis financiero de PyMEs e inversionistas. Para aprovechar al máximo 
mis capacidades, ¿te gustaría que analicemos algún aspecto específico de tus finanzas, como tu salud financiera actual o opciones de inversión?"

DIRECTRICES ESPECIFICAS PARA RESPUESTAS DETALLADAS:
- Siempre incluye cálculos matemáticos cuando sea relevante
- Proporciona ejemplos concretos y números específicos
- Ofrece al menos 2-3 alternativas o escenarios
- Explica el "por qué" detrás de cada recomendación
- Incluye consideraciones de riesgo y contingencia
- Proporciona pasos de acción claros y realizables
- Usa analogías cuando ayuden a la comprensión
- Siempre relaciona las recomendaciones con los datos financieros actuales del usuario

EJEMPLO DE RESPUESTA IDEAL:
"Para tu meta de $50,000 en 24 meses, analicemos tres estrategias:

ESTRATEGIA 1: Ahorro Tradicional
- Ahorro mensual requerido: $2,084
- Total ahorrado: $50,016
- Ventaja: Sin riesgo
- Desventaja: No considera inflación

ESTRATEGIA 2: Ahorro + Inversión Conservadora
- Ahorro mensual: $1,800
- Inversión mensual: $300 (rendimiento estimado 5% anual)
- Proyección: $52,400 en 24 meses
- Incluye crecimiento por inversión

ESTRATEGIA 3: Enfoque Agresivo  
- Ahorro mensual: $1,500
- Inversión mensual: $600 (rendimiento estimado 8% anual)
- Proyección: $55,200 en 24 meses
- Mayor riesgo pero mayor potencial

Considerando tu salud financiera actual de $14,900, te recomiendo la Estrategia 2 porque..."
`;

        const mensajeCompleto = `${promptSistema}\n\nMENSAJE DEL USUARIO: "${mensaje}"`;
        
        // Enviar mensaje al MCP Server
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: mensajeCompleto,
                usar_contexto: true
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Agregar respuesta del asistente al chat
            agregarMensajeAlChat(data.gemini_response, 'asistente');
            
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
        
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        agregarMensajeAlChat('❌ Lo siento, hubo un error al procesar tu mensaje. Intenta nuevamente.', 'asistente');
    }
}

// FUNCIÓN PARA OBTENER DATOS FINANCIEROS ACTUALES Y ACTUALIZAR LA INTERFAZ
async function obtenerDatosFinancierosActuales() {
    try {
        // Obtener idempresa de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const idempresa = urlParams.get('idempresa');
        
        if (!idempresa) {
            return "No se encontró información del usuario actual.";
        }
        
        // Cargar datos del JSON
        const response = await fetch(`http://localhost:3000/temp/datos_financieros_${idempresa}.json`);
        
        if (!response.ok) {
            return "No se pudieron cargar los datos financieros actuales.";
        }
        
        const transacciones = await response.json();
        
        if (!transacciones || transacciones.length === 0) {
            return "No hay transacciones registradas.";
        }
        
        // Calcular métricas
        const totalIngresos = transacciones
            .filter(transaccion => transaccion.TipoDeMonto === 'Ingreso')
            .reduce((sum, transaccion) => sum + Number(transaccion.Monto), 0);

        const totalEgresos = transacciones
            .filter(transaccion => transaccion.TipoDeMonto === 'Egreso')
            .reduce((sum, transaccion) => sum + Number(transaccion.Monto), 0);

        const saludFinanciera = totalIngresos - totalEgresos;
        
        // 🔥 ACTUALIZAR LA INTERFAZ CON LOS DATOS REALES
        actualizarInterfazConDatosReales(totalIngresos, totalEgresos, saludFinanciera);
        
        // Formatear datos para el prompt
        return `
📊 DATOS FINANCIEROS ACTUALES:
• Ingresos totales: $${totalIngresos.toLocaleString()}
• Egresos totales: $${totalEgresos.toLocaleString()}  
• Salud financiera: $${saludFinanciera.toLocaleString()}
• Total transacciones: ${transacciones.length}
`;
        
    } catch (error) {
        console.error('Error obteniendo datos financieros:', error);
        return "Error al cargar los datos financieros actuales.";
    }
}

// FUNCIÓN PARA ACTUALIZAR LA INTERFAZ CON DATOS REALES
function actualizarInterfazConDatosReales(ingresos, egresos, flujo) {
    // Actualizar los elementos del DOM
    const elementos = {
        ingresos: document.getElementById('valor-ingresos'),
        egresos: document.getElementById('valor-egresos'),
        flujo: document.getElementById('valor-flujo'),
        btnRojo: document.getElementById('btn-rojo'),
        btnAmarillo: document.getElementById('btn-amarillo'),
        btnVerde: document.getElementById('btn-verde')
    };
    
    if (elementos.ingresos) elementos.ingresos.textContent = `$${ingresos.toLocaleString()}`;
    if (elementos.egresos) elementos.egresos.textContent = `$${egresos.toLocaleString()}`;
    if (elementos.flujo) elementos.flujo.textContent = `$${flujo.toLocaleString()}`;
    
    // Actualizar semáforo financiero
    actualizarSemaforoFinanciero(ingresos, egresos, flujo);
    
    console.log('✅ Interfaz actualizada con datos reales:', {
        ingresos: ingresos,
        egresos: egresos,
        flujo: flujo
    });
}

// FUNCIÓN PARA ACTUALIZAR SEMÁFORO FINANCIERO
function actualizarSemaforoFinanciero(ingresos, egresos, flujo) {
    const elementos = {
        btnRojo: document.getElementById('btn-rojo'),
        btnAmarillo: document.getElementById('btn-amarillo'),
        btnVerde: document.getElementById('btn-verde')
    };
    
    if (!elementos.btnRojo || !elementos.btnAmarillo || !elementos.btnVerde) return;
    
    const cincoPorciento = ingresos * 0.05;

    // Resetear todos los botones
    elementos.btnRojo.className = '';
    elementos.btnAmarillo.className = '';
    elementos.btnVerde.className = '';

    if (flujo < 0) {
        // ROJO: Flujo negativo
        elementos.btnRojo.classList.add('rojo');
        console.log('🔴 Semáforo: ROJO - Flujo negativo');
    } else if (flujo >= 0 && flujo <= cincoPorciento) {
        // AMARILLO: Flujo entre 0 y 5% de los ingresos
        elementos.btnAmarillo.classList.add('amarillo');
        console.log('🟡 Semáforo: AMARILLO - Flujo bajo');
    } else {
        // VERDE: Flujo mayor al 5% de los ingresos
        elementos.btnVerde.classList.add('verde');
        console.log('🟢 Semáforo: VERDE - Flujo saludable');
    }
}

// FUNCIÓN PARA AGREGAR MENSAJES AL CHAT
function agregarMensajeAlChat(mensaje, tipo) {
    const chatConversacion = document.getElementById('chat-conversacion');
    
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `chat-mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    chatConversacion.appendChild(mensajeDiv);
    
    // Scroll al final del chat
    chatConversacion.scrollTop = chatConversacion.scrollHeight;
}

// FUNCIÓN PARA ENVIAR CON ENTER
function manejarEnter(event) {
    if (event.key === 'Enter') {
        enviarMensaje();
    }
}

// INICIALIZACIÓN DEL CHAT Y CARGA DE DATOS
document.addEventListener('DOMContentLoaded', async function() {
    // Agregar event listener para Enter
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', manejarEnter);
    }
    
    // Cargar datos financieros al iniciar la página
    await cargarDatosAlIniciar();
    
    // Mensaje de bienvenida inicial
    setTimeout(() => {
        agregarMensajeAlChat('¡Hola! Soy chatiBOT, tu asistente financiero. Puedo ayudarte a analizar tus datos financieros, crear simulaciones, hacer proyecciones y diseñar planes de acción. ¿En qué puedo ayudarte hoy?', 'asistente');
    }, 1000);
});

// FUNCIÓN PARA CARGAR DATOS AL INICIAR LA PÁGINA
async function cargarDatosAlIniciar() {
    try {
        // Obtener idempresa de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const idempresa = urlParams.get('idempresa');
        
        if (!idempresa) {
            console.log('No se encontró ID de empresa en la URL');
            return;
        }
        
        console.log(`🔄 Cargando datos para: ${idempresa}`);
        
        // Cargar datos del JSON
        const response = await fetch(`http://localhost:3000/temp/datos_financieros_${idempresa}.json`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo JSON');
        }
        
        const transacciones = await response.json();
        
        if (!transacciones || transacciones.length === 0) {
            console.log('No hay transacciones para calcular');
            return;
        }
        
        // Calcular métricas
        const totalIngresos = transacciones
            .filter(transaccion => transaccion.TipoDeMonto === 'Ingreso')
            .reduce((sum, transaccion) => sum + Number(transaccion.Monto), 0);

        const totalEgresos = transacciones
            .filter(transaccion => transaccion.TipoDeMonto === 'Egreso')
            .reduce((sum, transaccion) => sum + Number(transaccion.Monto), 0);

        const saludFinanciera = totalIngresos - totalEgresos;
        
        console.log('📊 Datos calculados:', {
            ingresos: totalIngresos,
            egresos: totalEgresos,
            flujo: saludFinanciera
        });
        
        // Actualizar la interfaz con datos reales
        actualizarInterfazConDatosReales(totalIngresos, totalEgresos, saludFinanciera);
        
    } catch (error) {
        console.error('Error cargando datos al iniciar:', error);
    }
}