let tourPrice = 0;
let timeSlots = [];
let maxParticipants = 25;

function initBookingWidget(price, slots) {
    tourPrice = parseFloat(price);
    timeSlots = slots;
    
    // Set min date to today
    const dateInput = document.getElementById('tourDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    // Render time slots
    const slotsContainer = document.getElementById('timeSlotsContainer');
    if (slotsContainer && timeSlots.length > 0) {
        slotsContainer.innerHTML = '';
        timeSlots.forEach((slot, index) => {
            const slotEl = document.createElement('div');
            slotEl.className = `time-slot ${index === 0 ? 'selected' : ''}`;
            slotEl.textContent = slot;
            slotEl.onclick = () => selectTimeSlot(slotEl, slot);
            slotsContainer.appendChild(slotEl);
        });
        document.getElementById('selectedTime').value = timeSlots[0];
    }
    
    updateTotalPrice();
}

function updateTotalPrice() {
    const adults = parseInt(document.getElementById('adultsCount').textContent);
    const children = parseInt(document.getElementById('childrenCount').textContent);
    const total = (adults * tourPrice) + (children * tourPrice);
    
    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

function incrementAdults() {
    const el = document.getElementById('adultsCount');
    let val = parseInt(el.textContent);
    const totalPeople = val + parseInt(document.getElementById('childrenCount').textContent);
    if (totalPeople < maxParticipants) {
        el.textContent = val + 1;
        updateTotalPrice();
    }
}

function decrementAdults() {
    const el = document.getElementById('adultsCount');
    let val = parseInt(el.textContent);
    if (val > 1) {
        el.textContent = val - 1;
        updateTotalPrice();
    }
}

function incrementChildren() {
    const el = document.getElementById('childrenCount');
    let val = parseInt(el.textContent);
    const totalPeople = parseInt(document.getElementById('adultsCount').textContent) + val;
    if (totalPeople < maxParticipants) {
        el.textContent = val + 1;
        updateTotalPrice();
    }
}

function decrementChildren() {
    const el = document.getElementById('childrenCount');
    let val = parseInt(el.textContent);
    if (val > 0) {
        el.textContent = val - 1;
        updateTotalPrice();
    }
}

function selectTimeSlot(element, slotText) {
    document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selectedTime').value = slotText;
}

function handleReservarAhora(isLoggedIn, tourId, tourName, tourImage) {
    const date = document.getElementById('tourDate').value;
    if (!date) {
        showToast('Por favor selecciona una fecha.', 'error');
        return;
    }
    
    const adults = parseInt(document.getElementById('adultsCount').textContent);
    const children = parseInt(document.getElementById('childrenCount').textContent);
    const time = document.getElementById('selectedTime').value;
    const subtotal = (adults * tourPrice) + (children * tourPrice);
    const total = subtotal + 3.00; // tarifa de servicio hardcoded

    const checkoutData = {
        tour_id: tourId,
        tour_name: tourName,
        tour_image: tourImage,
        precio_unitario: tourPrice,
        fecha: date,
        hora: time,
        adultos: adults,
        ninos: children,
        subtotal: subtotal,
        tarifa: 3.00,
        total: total
    };
    
    sessionStorage.setItem('checkout_temp', JSON.stringify(checkoutData));

    if (isLoggedIn) {
        continuarSinSesion();
    } else {
        openLoginModal();
    }
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function continuarSinSesion() {
    const data = JSON.parse(sessionStorage.getItem('checkout_temp'));
    
    // Create form and submit to /checkout/paso1/
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = '/checkout/paso1/';
    
    for (const key in data) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
}

function verificarEmail() {
    const email = document.getElementById('modalEmail').value;
    if(!email) return;
    
    fetch(`/api/verificar-email/?email=${encodeURIComponent(email)}`)
        .then(r => r.json())
        .then(data => {
            if(data.existe) {
                document.getElementById('passwordField').style.display = 'block';
                document.getElementById('continuarConCorreo').textContent = 'Iniciar sesión';
                document.getElementById('continuarConCorreo').onclick = loginAjax;
            } else {
                window.location.href = `/registro/?email=${encodeURIComponent(email)}&redirect=checkout`;
            }
        });
}

function loginAjax() {
    // In a real scenario, this would post to a login endpoint.
    // For this flow, we will just redirect to login if password is required.
    const email = document.getElementById('modalEmail').value;
    window.location.href = `/login/?next=/checkout/paso1/&email=${encodeURIComponent(email)}`;
}
