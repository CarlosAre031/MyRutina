const startDate = new Date(2024, 8, 25); // 25/09/2024
const meses = 6;
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const actividades = {
    programacion: { dias: [1, 2, 3, 4, 5, 6], nombre: 'Programación 💻' },
    ejercicio: { dias: [1, 2, 3, 4, 5], nombre: 'Ejercicio 🏋️' },
    ingles: { dias: [0, 1, 2, 3, 4, 5, 6], nombre: 'Inglés 🇬🇧' },
    oficio: { dias: [6], nombre: 'Oficio 🛠️' }
};

const fechasEspeciales = {
    '2024-10-03': { nombre: 'Cumpleaños Amor ❤️', emoji: '🎂' },
    '2024-10-07': { nombre: 'Aniversario 💑', emoji: '💍' },
    '2024-10-31': { nombre: 'Halloween 🎃', emoji: '👻' },
    '2024-12-25': { nombre: 'Navidad 🎄', emoji: '🎅' },
    '2024-12-31': { nombre: 'Año Nuevo y Mi Cumpleaños 🎉', emoji: '🎊' }
};

let rutinas = JSON.parse(localStorage.getItem('rutinas')) || {};

function generarCalendario() {
    const calendarioEl = document.getElementById('calendario');
    calendarioEl.innerHTML = '';

    for (let i = 0; i < meses; i++) {
        const mesActual = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const mesEl = document.createElement('div');
        mesEl.className = 'mes';
        
        const mesCheckbox = document.createElement('span');
        mesCheckbox.className = 'mes-checkbox';
        mesCheckbox.onclick = () => toggleMesCompleto(mesActual);

        mesEl.innerHTML = `<h2>${mesActual.toLocaleString('es', { month: 'long', year: 'numeric' })}</h2>`;
        mesEl.querySelector('h2').appendChild(mesCheckbox);

        const diasEl = document.createElement('div');
        diasEl.className = 'dias';

        diasSemana.forEach(dia => {
            const diaNombreEl = document.createElement('div');
            diaNombreEl.className = 'dia-nombre';
            diaNombreEl.textContent = dia;
            diasEl.appendChild(diaNombreEl);
        });

        const primerDia = mesActual.getDay();
        for (let j = 0; j < primerDia; j++) {
            diasEl.appendChild(document.createElement('div'));
        }

        const diasEnMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const diaEl = document.createElement('div');
            diaEl.className = 'dia';
            diaEl.innerHTML = `<div class="dia-numero">${dia}</div>`;

            const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
            const fechaStr = fecha.toISOString().split('T')[0];

            // Agregar fechas especiales
            if (fechasEspeciales[fechaStr]) {
                const fechaEspecialEl = document.createElement('div');
                fechaEspecialEl.className = 'fecha-especial';
                fechaEspecialEl.title = fechasEspeciales[fechaStr].nombre;
                fechaEspecialEl.textContent = fechasEspeciales[fechaStr].emoji;
                diaEl.appendChild(fechaEspecialEl);
            }

            Object.entries(actividades).forEach(([key, { dias, nombre }]) => {
                if (dias.includes(fecha.getDay())) {
                    const actividadEl = document.createElement('div');
                    actividadEl.className = `actividad ${key}`;
                    const isChecked = rutinas[`${fechaStr}_${key}`];
                    actividadEl.innerHTML = `
                        <span class="checkbox ${isChecked ? 'checked' : ''}"></span>
                        ${nombre}
                    `;
                    actividadEl.onclick = () => toggleRutina(fechaStr, key);
                    diaEl.appendChild(actividadEl);
                }
            });

            diasEl.appendChild(diaEl);
        }

        mesEl.appendChild(diasEl);
        
        const resumenMes = generarResumenMes(mesActual);
        mesEl.appendChild(resumenMes);

        calendarioEl.appendChild(mesEl);
    }

    actualizarCheckboxesMes();
}

function toggleRutina(fecha, actividad) {
    const key = `${fecha}_${actividad}`;
    rutinas[key] = !rutinas[key];
    localStorage.setItem('rutinas', JSON.stringify(rutinas));
    generarCalendario();
}

function toggleMesCompleto(mes) {
    const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

    for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
        const fechaStr = d.toISOString().split('T')[0];
        Object.keys(actividades).forEach(actividad => {
            if (actividades[actividad].dias.includes(d.getDay())) {
                const key = `${fechaStr}_${actividad}`;
                rutinas[key] = true;
            }
        });
    }

    localStorage.setItem('rutinas', JSON.stringify(rutinas));
    generarCalendario();
}

function generarResumenMes(mes) {
    const resumenEl = document.createElement('div');
    resumenEl.className = 'resumen-mes';
    resumenEl.innerHTML = '<h3>Resumen del Mes</h3>';

    const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

    Object.entries(actividades).forEach(([key, { nombre, dias }]) => {
        let completados = 0;
        let total = 0;

        for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
            if (dias.includes(d.getDay())) {
                total++;
                const fechaStr = d.toISOString().split('T')[0];
                if (rutinas[`${fechaStr}_${key}`]) {
                    completados++;
                }
            }
        }

        const porcentaje = (completados / total) * 100;
        
        const actividadResumen = document.createElement('div');
        actividadResumen.className = `resumen-actividad ${key}`;
        actividadResumen.innerHTML = `
            <span>${nombre}: ${completados}/${total}</span>
            <div class="barra-progreso">
                <div class="progreso" style="width: ${porcentaje}%"></div>
            </div>
        `;
        resumenEl.appendChild(actividadResumen);
    });

    return resumenEl;
}

function actualizarCheckboxesMes() {
    const meses = document.querySelectorAll('.mes');
    meses.forEach(mesEl => {
        const mesCheckbox = mesEl.querySelector('.mes-checkbox');
        const actividades = mesEl.querySelectorAll('.actividad');
        const todasCompletadas = Array.from(actividades).every(act => act.querySelector('.checkbox').classList.contains('checked'));
        mesCheckbox.classList.toggle('checked', todasCompletadas);
    });
}

generarCalendario();