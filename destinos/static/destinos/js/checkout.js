// Checkout Logic
let timerInterval;

function initTimer(minutes = 20) {
    let timeLeft = sessionStorage.getItem('checkout_timer');
    if (!timeLeft) {
        timeLeft = minutes * 60;
    } else {
        timeLeft = parseInt(timeLeft);
    }
    
    updateTimerDisplay(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        sessionStorage.setItem('checkout_timer', timeLeft);
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimerExpired();
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent = `${min}:${sec}`;
    }
}

function handleTimerExpired() {
    showToast('Tu tiempo de reserva ha expirado.', 'warning');
    // En un sistema real se liberaría la plaza
    if(confirm('¿Deseas continuar con tu reserva?')) {
        sessionStorage.removeItem('checkout_timer');
        initTimer(20);
    } else {
        window.location.href = '/';
    }
}

function aplicarCupon(codigo) {
    if (!codigo) return;
    
    fetch('/api/aplicar-cupon/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({codigo: codigo})
    })
    .then(r => r.json())
    .then(data => {
        if(data.valido) {
            showToast(`¡Cupón aplicado! ${data.descuento}% de descuento.`, 'success');
            // Recalcular subtotal
            const subtotalEl = document.getElementById('checkoutSubtotal');
            const totalEl = document.getElementById('checkoutTotal');
            if (subtotalEl && totalEl) {
                let subtotal = parseFloat(subtotalEl.dataset.value);
                let descuento = subtotal * (data.descuento / 100);
                let total = subtotal - descuento + 3.00;
                
                document.getElementById('descuentoRow').style.display = 'flex';
                document.getElementById('checkoutDescuento').textContent = `- USD ${descuento.toFixed(2)}`;
                totalEl.textContent = `USD ${total.toFixed(2)}`;
                
                // Add hidden input for the form
                let inputDesc = document.getElementById('hiddenDescuento');
                if(!inputDesc) {
                    inputDesc = document.createElement('input');
                    inputDesc.type = 'hidden';
                    inputDesc.name = 'descuento';
                    inputDesc.id = 'hiddenDescuento';
                    document.getElementById('checkoutForm')?.appendChild(inputDesc);
                }
                inputDesc.value = descuento.toFixed(2);
            }
        } else {
            showToast('Cupón inválido', 'error');
        }
    });
}

function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += val[i];
    }
    input.value = formatted.substring(0, 19);
}

function toggleCVV() {
    const input = document.getElementById('cardCvv');
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function handlePaymentMethodChange() {
    const method = document.querySelector('input[name="payment_method"]:checked').value;
    if (method === 'tarjeta') {
        document.getElementById('cardDetails').style.display = 'block';
        document.getElementById('paypalDetails').style.display = 'none';
    } else {
        document.getElementById('cardDetails').style.display = 'none';
        document.getElementById('paypalDetails').style.display = 'block';
    }
}

function validatePaso3(event) {
    const method = document.querySelector('input[name="payment_method"]:checked').value;
    if (method === 'tarjeta') {
        const card = document.getElementById('cardNumber').value.replace(/\s/g, '');
        if (card.length !== 16) {
            showToast('Número de tarjeta inválido', 'error');
            event.preventDefault();
            return false;
        }
    }
    return true;
}

// Utility CSRF
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
