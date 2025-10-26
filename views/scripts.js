// DATOS DE EJEMPLO (simulando base de datos)
const datosFinancieros = {
    ingresos: 15000,
    egresos: 12000,
    flujoEfectivo: 3000,
    simulacionActiva: false
};

// ELEMENTOS DEL DOM
const elementos = {
    ingresos: document.getElementById('valor-ingresos'),
    egresos: document.getElementById('valor-egresos'),
    flujo: document.getElementById('valor-flujo'),
    btnRojo: document.getElementById('btn-rojo'),
    btnAmarillo: document.getElementById('btn-amarillo'),
    btnVerde: document.getElementById('btn-verde'),
    modal: document.getElementById('modal-simulacion')
};

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function () {
    cargarDatosFinancieros();
    actualizarSemaforo();
});

// FUNCIÓN PARA CARGAR DATOS (simulando conexión a DB)
function cargarDatosFinancieros() {
    // En una implementación real, aquí harías una llamada a la API
    elementos.ingresos.textContent = `$${datosFinancieros.ingresos.toLocaleString()}`;
    elementos.egresos.textContent = `$${datosFinancieros.egresos.toLocaleString()}`;
    elementos.flujo.textContent = `$${datosFinancieros.flujoEfectivo.toLocaleString()}`;
}

// FUNCIÓN PARA ACTUALIZAR SEMÁFORO
function actualizarSemaforo() {
    const flujo = datosFinancieros.flujoEfectivo;
    const cincoPorciento = datosFinancieros.ingresos * 0.05;

    // Resetear todos los botones
    elementos.btnRojo.className = '';
    elementos.btnAmarillo.className = '';
    elementos.btnVerde.className = '';

    if (flujo < 0) {
        // ROJO: Flujo negativo
        elementos.btnRojo.classList.add('rojo');
    } else if (flujo >= 0 && flujo <= cincoPorciento) {
        // AMARILLO: Flujo entre 0 y 5% de los ingresos
        elementos.btnAmarillo.classList.add('amarillo');
    } else {
        // VERDE: Flujo mayor al 5% de los ingresos
        elementos.btnVerde.classList.add('verde');
    }
}

// FUNCIONES DE SIMULACIÓN
function abrirModalSimulacion() {
    elementos.modal.style.display = 'flex';
}

function cerrarModal() {
    elementos.modal.style.display = 'none';
}

function aplicarSimulacion() {
    const ingresosSim = parseFloat(document.getElementById('modal-ingresos').value) || 0;
    const egresosSim = parseFloat(document.getElementById('modal-egresos').value) || 0;

    // Aplicar simulación
    datosFinancieros.ingresos = ingresosSim;
    datosFinancieros.egresos = egresosSim;
    datosFinancieros.flujoEfectivo = ingresosSim - egresosSim;
    datosFinancieros.simulacionActiva = true;

    // Actualizar interfaz
    cargarDatosFinancieros();
    actualizarSemaforo();
    cerrarModal();

    console.log('Simulación aplicada:', datosFinancieros);
}

function cerrarSimulacion() {
    if (datosFinancieros.simulacionActiva) {
        // Restaurar datos originales (en realidad, harías una nueva consulta a la DB)
        datosFinancieros.ingresos = 15000;
        datosFinancieros.egresos = 12000;
        datosFinancieros.flujoEfectivo = 3000;
        datosFinancieros.simulacionActiva = false;

        cargarDatosFinancieros();
        actualizarSemaforo();

        console.log('Simulación finalizada');
    }
}

// FUNCIÓN DE PREDICCIÓN
function actualizarPrediccion() {
    const tiempo = document.getElementById('s-tiempo').value;
    console.log('Actualizando predicción para:', tiempo, 'meses');

    // En una implementación real, aquí llamarías al modelo MCP
    // con el valor seleccionado y actualizarías las gráficas
}

// SIMULAR CARGA DE GRÁFICAS (Power BI)
setTimeout(() => {
    // En una implementación real, aquí cargarías las URLs de Power BI
    document.getElementById('grafica-gastos').innerHTML =
        '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #737373;">Gráfica de Gastos por Categorías (Power BI)</div>';

    document.getElementById('grafica-prediccion').innerHTML =
        '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #737373;">Gráfica de Predicción (Power BI)</div>';
}, 1000);