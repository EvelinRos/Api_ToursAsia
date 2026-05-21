function validateEmail(input) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = re.test(input.value);
    setValidationState(input, isValid, 'El correo electrónico no es válido.');
    return isValid;
}

function validatePassword(input) {
    const val = input.value;
    const isValid = val.length >= 8;
    setValidationState(input, isValid, 'La contraseña debe tener al menos 8 caracteres.');
    return isValid;
}

function validatePasswordMatch(pass1, pass2) {
    const isValid = pass1.value === pass2.value && pass1.value !== '';
    setValidationState(pass2, isValid, 'Las contraseñas no coinciden.');
    return isValid;
}

function validatePhone(input) {
    const re = /^\+?[0-9\s\-]{7,15}$/;
    const isValid = re.test(input.value);
    setValidationState(input, isValid, 'Número de teléfono no válido.');
    return isValid;
}

function validateRequired(input) {
    const isValid = input.value.trim() !== '';
    setValidationState(input, isValid, 'Este campo es obligatorio.');
    return isValid;
}

function setValidationState(input, isValid, errorMsg) {
    const parent = input.parentElement;
    let errorEl = parent.querySelector('.error-msg');
    
    if (!isValid) {
        input.classList.add('field-invalid');
        input.classList.remove('field-valid');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-msg';
            parent.appendChild(errorEl);
        }
        errorEl.textContent = errorMsg;
    } else {
        input.classList.remove('field-invalid');
        input.classList.add('field-valid');
        if (errorEl) {
            errorEl.remove();
        }
    }
}

// Automatically attach listeners to forms with specific classes
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="email"]').forEach(el => {
        el.addEventListener('blur', () => validateEmail(el));
    });
    
    const pass1 = document.getElementById('id_password1');
    const pass2 = document.getElementById('id_password2');
    if (pass1 && pass2) {
        pass1.addEventListener('blur', () => validatePassword(pass1));
        pass2.addEventListener('blur', () => validatePasswordMatch(pass1, pass2));
    }
    
    document.querySelectorAll('input[required]').forEach(el => {
        el.addEventListener('blur', () => validateRequired(el));
    });
});
