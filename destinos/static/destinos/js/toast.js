// Sistema global de Toast Notifications
function showToast(message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon selection based on type
    let iconClass = 'fa-check-circle';
    if(type === 'error') iconClass = 'fa-exclamation-circle';
    if(type === 'warning') iconClass = 'fa-exclamation-triangle';
    if(type === 'info') iconClass = 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="closeToast(this.parentElement)"><i class="fa-solid fa-xmark"></i></button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;
    
    container.appendChild(toast);
    
    // Manage max 3 toasts
    const toasts = container.querySelectorAll('.toast');
    if (toasts.length > 3) {
        toasts[0].remove();
    }
    
    // Auto-remove
    setTimeout(() => {
        if(toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

function closeToast(toastElement) {
    toastElement.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => toastElement.remove(), 300);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Convertir mensajes de Django automáticamente
document.addEventListener('DOMContentLoaded', () => {
    const djangoMessages = document.querySelectorAll('.django-message');
    djangoMessages.forEach(msg => {
        showToast(msg.dataset.message, msg.dataset.type);
        msg.remove();
    });
});

// Animación de salida (añadir dinámicamente si no está en CSS)
const style = document.createElement('style');
style.innerHTML = `
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(style);
