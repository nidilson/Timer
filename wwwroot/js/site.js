const STORAGE_KEY = 'timer:app';
var tipos;
var historial;

var temporizador = {
    horas: 0,
    minutos: 0,
    segundos: 0
}
var temporizadorParcial = {
    horas: 0,
    minutos: 0,
    segundos: 0
}
var tiempoInicial;
var temporizadorId;
var temporizadorEnPausa = false;

document.addEventListener('DOMContentLoaded', async () => { 

    var formNuevoTipoTimer = document.getElementById("form-tipo-personalizado");
    var selectTipoTimer = document.getElementById("tipo-timer");    

    await initStorage();

    LlenarSelect(selectTipoTimer);
    CrearHistorialCards();

    AnadirModalEvents();

    AnadirEventoBotonesAccion();

    formNuevoTipoTimer.addEventListener("submit", (e) => {
        e.preventDefault();
        NuevoTipoTimer(e, formNuevoTipoTimer);        
    })

    selectTipoTimer.addEventListener("change", (event) => {
        if (event.target.value === "Otro") {
            displayFormTipoTimer(true);
        } else {
            displayFormTipoTimer(false);
        }
    })
    
});

function AnadirEventoBotonesAccion() {
    var botonIniciar = document.getElementById("iniciar-boton");
    var botonPausar = document.getElementById("pausar-boton");
    var botonReiniciar = document.getElementById("reiniciar-boton");
    var botonMasCinco = document.getElementById("mas5-boton");
    var botonMenosCinco = document.getElementById("menos5-boton");

    botonIniciar.addEventListener("click", () => {
        IniciarTemporizador();
    });
    botonPausar.addEventListener("click", () => {
        PausarTemporizador();
    });
    botonReiniciar.addEventListener("click", () => {
        ReiniciarTemporizador();
    });
    botonMasCinco.addEventListener("click", () => {
        SumarMinutosATemporizador(5);
    });
    botonMenosCinco.addEventListener("click", () => {
        RestarMinutosATemporizador(5);
    });
}

function SumarMinutosATemporizador(minutos) {
    PausarTemporizador();
    temporizadorParcial.minutos += minutos;
    IniciarTemporizador();
}

function RestarMinutosATemporizador(minutos) {
    PausarTemporizador();
    let segundosRestantes = ConvertirASegundos(temporizadorParcial);
    segundosRestantes = segundosRestantes - (minutos * 60) > 0 ? segundosRestantes - (minutos * 60) : 0;
    temporizadorParcial = ConvertirATemporizador(segundosRestantes);

    IniciarTemporizador();
}

function IniciarTemporizador() {
    tiempoInicial = ConvertirASegundos(temporizadorParcial);
    mostrarBotonPausaYReinicio(true);
    AnimarCirculos(true);
    if (!temporizadorEnPausa) {
        AnadirSesionAHistorial();
    }
    temporizadorEnPausa = false;
    temporizadorId = setInterval(() => {

        tiempoInicial--;

        let tiempoParcial = ConvertirATemporizador(tiempoInicial);

        RenderTemporizador(tiempoParcial.horas, tiempoParcial.minutos, tiempoParcial.segundos)

        if (tiempoInicial <= 0) {
            mostrarBotonPausaYReinicio(false);
            AnimarCirculos(false);
            RenderTemporizador(0, 0, 0)
            clearInterval(temporizadorId);
            CompletarUltimaSesion();
        }               

    }, 1000)
}

function AnimarCirculos(animar) {
    var circuloMedio = document.getElementById("circulo-medio");
    var circuloInterior = document.getElementById("circulo-interior");

    if (animar) {
        circuloMedio.classList.add("activo");
        circuloInterior.classList.add("activo");
    } else {
        circuloMedio.classList.remove("activo");
        circuloInterior.classList.remove("activo");
    }

}

function PausarTemporizador() {
    if (temporizadorId) {
        temporizadorParcial = ConvertirATemporizador(tiempoInicial);
        clearInterval(temporizadorId);
        MostrarBotonInicio(true);
        AnimarCirculos(false);
        temporizadorEnPausa = true;
    }
}

function ReiniciarTemporizador() {
    PausarTemporizador();
    temporizadorParcial = temporizador;
    RenderTemporizador(temporizador.horas, temporizador.minutos, temporizador.segundos);
    temporizadorEnPausa = false;
}

function ConvertirATemporizador(segundos) {

    let horasConvertidas = Math.floor(segundos / 3600);
    segundos = segundos % 3600;
    let minutosConvertidos = Math.floor(segundos / 60);
    segundos = segundos % 60;
    let segundosConvertidos = segundos;

    return {
        horas: horasConvertidas,
        minutos: minutosConvertidos,
        segundos: segundosConvertidos
    }
}

function MostrarBotonInicio(mostrar) {
    let botonIniciar = document.getElementById("iniciar-boton");
    let botonPausar = document.getElementById("pausar-boton");

    if (mostrar) {
        botonIniciar.classList.remove("no-mostrar");
        botonPausar.classList.add("no-mostrar");
    } else {
        botonIniciar.classList.add("no-mostrar");
        botonPausar.classList.remove("no-mostrar");
    }
}

function mostrarBotonPausaYReinicio(mostrar) {
    let botonIniciar = document.getElementById("iniciar-boton");
    let botonPausar = document.getElementById("pausar-boton");
    let botonReiniciar = document.getElementById("reiniciar-boton");

    if (mostrar) {
        botonIniciar.classList.add("no-mostrar");
        botonPausar.classList.remove("no-mostrar");
        botonReiniciar.classList.remove("no-mostrar");
    } else {
        botonIniciar.classList.remove("no-mostrar");
        botonPausar.classList.add("no-mostrar");
        botonReiniciar.classList.add("no-mostrar");
    }
}

function ConvertirASegundos(temporizador) {
    return (temporizador.segundos) + (temporizador.minutos * 60) + (temporizador.horas * 3600);
}

function AnadirModalEvents(selHora, selMin, selSeg) {
    var selHora = document.querySelectorAll(".sel-hor");
    var selMin = document.querySelectorAll(".sel-min");
    var selSeg = document.querySelectorAll(".sel-seg");
    var horaSeleccionada = document.getElementById("hora");
    var minutoSeleccionada = document.getElementById("minuto");
    var segundoSeleccionada = document.getElementById("segundo");
    var botonSeleccionar = document.getElementById("seleccion-temporizador-boton");
    var open = document.getElementById("open-modal");


    anadirSeleccionListener(selHora, horaSeleccionada)
    anadirSeleccionListener(selMin, minutoSeleccionada)
    anadirSeleccionListener(selSeg, segundoSeleccionada)
    anadirBotonSeleccionarListener(botonSeleccionar);
    anadirAbrirModalListener(open);
}

function anadirSeleccionListener(seleccionArray, elementoACambiar) {
    seleccionArray.forEach(i => {
        i.addEventListener("click", event => {
            seleccionArray.forEach(f => {
                f.classList.remove("seleccionado")
            })
            event.target.classList.add("seleccionado");
            elementoACambiar.innerText = event.target.dataset.valor;
        })
    })
}

function anadirBotonSeleccionarListener(botonSeleccionar) {
    var HoraSeleccionada = document.getElementById("hora");
    var MinSeleccionada = document.getElementById("minuto");
    var SegSeleccionada = document.getElementById("segundo");

    botonSeleccionar.addEventListener("click", () => {
        RenderTemporizador(HoraSeleccionada.innerText, MinSeleccionada.innerText, SegSeleccionada.innerText)
        try {
            temporizador.horas = parseInt(HoraSeleccionada.innerText);
            temporizador.minutos = parseInt(MinSeleccionada.innerText);
            temporizador.segundos = parseInt(SegSeleccionada.innerText);
            temporizadorParcial = temporizador;
        } catch (e) {
            alert(e.message);
        }
        temporizadorEnPausa = false;
        ocultarModal();
    })
    
}

function displayFormTipoTimer(mostrar) {
    var formNuevoTipoTimer = document.getElementById("form-tipo-personalizado");

    if (mostrar) {
        formNuevoTipoTimer.style.display = "flex";
    } else {
        formNuevoTipoTimer.style.display = "none";
    }
}

function LlenarSelect() {
    var selectTipoTimer = document.getElementById("tipo-timer");
    limpiarSelect(selectTipoTimer)
    tipos.forEach(i => {
        selectTipoTimer.innerHTML += `<option value='${i.nombre}' data-recomendado='${i.recomendado.horas}:${i.recomendado.minutos}:${i.recomendado.segundos}'>${i.nombre}</option>`;
    });
}

function limpiarSelect(selectTipoTimer) {
    selectTipoTimer.innerHTML = ``;
}

async function ObtenerTiposIniciales() {
    let tiposIniciales;
    await fetch("/Home/TipoTimerInicial", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(err => {
                    throw new Error(err.error);
                });
            }
            return res.json();
        })
        .then(data => {
            tiposIniciales = data;
        })
        .catch(err => {
            alert(err.message);
        });
        return tiposIniciales
}

function NuevoTipoTimer(event, formNuevoTipoTimer) {
    const tipoNuevo = document.getElementById("tipo-personalizado");

    if (!formNuevoTipoTimer.checkValidity()) {
        formNuevoTipoTimer.reportValidity();
        return;
    }

    tipos.push({
        "id": tipos[length].id + 1,
        "nombre": tipoNuevo.value,
        "recomendado": {
            "horas": 0,
            "minutos": 0,
            "segundos": 0
        }
    })

    updateStorage();

    LlenarSelect();

    displayFormTipoTimer(false);

    tipoNuevo.value = "";
}

async function initStorage() {
    let tiposStorage = await ObtenerTiposIniciales();
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            tipos: tiposStorage,
            historial: []
        }));
    }

    let local = getStorage();
    tipos = local.tipos;
    historial = local.historial;
}

function getStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function updateStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tipos: tipos,
        historial: historial
    }));
}

function anadirAbrirModalListener(elemento) {
    elemento.addEventListener("click", () => {
        mostrarModal();
    })
}

function mostrarModal() {
    document.getElementById("modal").classList.add("show");
}

function ocultarModal() {
    document.getElementById("modal").classList.remove("show");
}

function RenderTemporizador(horas, minutos, segundos) {
    let HoraAEstablecer = document.getElementById("horas");
    let MinAEstablecer = document.getElementById("minutos");
    let SegAEstablecer = document.getElementById("segundos");

    HoraAEstablecer.innerText = String(horas).padStart(2, '0');
    MinAEstablecer.innerText = String(minutos).padStart(2, '0');
    SegAEstablecer.innerText = String(segundos).padStart(2, '0');
}

function CrearHistorialCards() {
    let historialHTML = "";
    historial = getStorage().historial;
    historial = historial.slice(-20);
    historial.reverse().forEach(sesion => {
        historialHTML += `<div class="sesion-card">
			<div class="titulo-sesion-card">
				<h2 class="encabezado-sesion-h2">${sesion.tipo} - ${sesion.tiempo}</h2>
			</div>
			<div class="detalle-sesion-card">
				<div>
					<i class="bi bi-clock icon-sesion-card"></i>
					<span class="fecha-sesion">${sesion.fecha}</span>
				</div>
				<div>
					<i class="bi bi-check-circle-fill icon-sesion-card"></i>
					<span class="estado-sesion">${sesion.estado}</span>
				</div>

			</div>
		</div>`;
    });
    historial = getStorage().historial;
    let container = document.getElementById("sesiones-container");
    try {
        container.innerHTML = historialHTML;
    } catch (e) {
        container.innerHTML = "";
    }
}

function AnadirSesionAHistorial() {
    let select = document.getElementById("tipo-timer");
    let fecha = new Date(Date.now());
    let sesion = {
        tipo: select.value,
        tiempo: `${String(temporizador.horas).padStart(2, '0')}:${String(temporizador.minutos).padStart(2, '0')}:${String(temporizador.segundos).padStart(2, '0')}`,
        fecha: fecha.toLocaleDateString(),
        estado: "En Curso"
    }
    historial.push(sesion);
    updateStorage()
    CrearHistorialCards();
}

function CompletarUltimaSesion() {
    historial.forEach(sesion => {
        if (sesion.estado == "En Curso") {
            sesion.estado = "Incompleto"
        }
    });

    historial[historial.length - 1].estado = "Completo";
    updateStorage();
    CrearHistorialCards();
}