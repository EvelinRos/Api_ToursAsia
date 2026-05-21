function initCharts(reservasPorMes, distribucionDestinos) {
    // Check if Chart is loaded
    if (typeof Chart === 'undefined') return;

    // Line Chart: Reservas por mes
    const ctxLine = document.getElementById('reservasChart');
    if (ctxLine && reservasPorMes) {
        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: reservasPorMes.labels,
                datasets: [{
                    label: 'Reservas',
                    data: reservasPorMes.data,
                    borderColor: '#0097A7',
                    tension: 0.1,
                    fill: false
                }]
            }
        });
    }

    // Doughnut Chart: Distribución
    const ctxDoughnut = document.getElementById('destinosChart');
    if (ctxDoughnut && distribucionDestinos) {
        new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: distribucionDestinos.labels,
                datasets: [{
                    data: distribucionDestinos.data,
                    backgroundColor: ['#FF5722', '#0097A7', '#4CAF50', '#FF9800', '#F8F9FA', '#1A1A2E']
                }]
            }
        });
    }
}

function actualizarEstadoReserva(selectElement, reservaId) {
    const nuevoEstado = selectElement.value;
    
    fetch('/api/actualizar-estado-reserva/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({id: reservaId, estado: nuevoEstado})
    })
    .then(r => r.json())
    .then(data => {
        if(data.success) {
            showToast('Estado actualizado exitosamente', 'success');
        } else {
            showToast('Error al actualizar', 'error');
        }
    });
}

function togglePopularTour(btn, tourId) {
    fetch('/api/toggle-popular-tour/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({id: tourId})
    })
    .then(r => r.json())
    .then(data => {
        if(data.success) {
            if(data.is_popular) {
                btn.classList.add('badge-popular');
                btn.classList.remove('badge-country');
                btn.textContent = 'Popular';
            } else {
                btn.classList.remove('badge-popular');
                btn.classList.add('badge-country');
                btn.textContent = 'Normal';
            }
            showToast('Estado popular actualizado', 'success');
        }
    });
}

function buscarEnTabla(inputElement) {
    const filter = inputElement.value.toLowerCase();
    const table = document.querySelector('.table tbody');
    const trs = table.getElementsByTagName('tr');

    for (let i = 0; i < trs.length; i++) {
        const text = trs[i].textContent || trs[i].innerText;
        if (text.toLowerCase().indexOf(filter) > -1) {
            trs[i].style.display = "";
        } else {
            trs[i].style.display = "none";
        }
    }
}

function confirmarEliminar(url, mensaje) {
    if(confirm(mensaje || '¿Estás seguro de eliminar este elemento?')) {
        // Enviar form post
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        const csrf = document.createElement('input');
        csrf.type = 'hidden';
        csrf.name = 'csrfmiddlewaretoken';
        csrf.value = getCookie('csrftoken');
        form.appendChild(csrf);
        document.body.appendChild(form);
        form.submit();
    }
}

// Utility CSRF (if not already loaded)
if (typeof getCookie === 'undefined') {
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
