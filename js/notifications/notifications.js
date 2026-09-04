/**
 * All CopyRight by AES Foundation | AES WarDarkness | Almazow Faradey
 * Показывает стилизованное уведомление в верхней части экрана
 * @param {string} type - Тип уведомления: 'success', 'error', 'warning', 'info'
 * @param {string} title - Заголовок уведомления
 * @param {string} message - Текст сообщения
 * @param {number} duration - Время отображения в миллисекундах (по умолчанию 5000)
 */
function showNotification(type, title, message, duration = 5000) {
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const colors = {
        success: {
            bg: 'rgba(16, 185, 129, 0.95)',
            border: '#10b981',
            icon: '#10b981',
            accent: '#34d399'
        },
        error: {
            bg: 'rgba(239, 68, 68, 0.95)',
            border: '#ef4444',
            icon: '#ef4444',
            accent: '#f87171'
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.95)',
            border: '#f59e0b',
            icon: '#f59e0b',
            accent: '#fbbf24'
        },
        info: {
            bg: 'rgba(59, 130, 246, 0.95)',
            border: '#3b82f6',
            icon: '#3b82f6',
            accent: '#60a5fa'
        }
    };

    const color = colors[type] || colors.info;

    const icons = {
        success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                  stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12L11 14L15 10" 
                  stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                  stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 9L9 15" 
                  stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9L15 15" 
                  stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13" stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 17H12.01" stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10.29 3.85999L1.82002 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7238C2.83871 20.9009 3.18082 20.9961 3.53002 21H20.47C20.8192 20.9961 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.85999C13.5318 3.5661 13.2807 3.32311 12.9812 3.15447C12.6817 2.98584 12.3438 2.89722 12 2.89722C11.6563 2.89722 11.3184 2.98584 11.0188 3.15447C10.7193 3.32311 10.4683 3.5661 10.29 3.85999V3.85999Z" 
                  stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                  stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V12" stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8H12.01" stroke="${color.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    };

    notification.innerHTML = `
        <div class="notification-icon">
            ${icons[type] || icons.info}
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress"></div>
        <button class="notification-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M4 4L12 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </button>
    `;

    notification.style.cssText = `
        position: relative;
        background: ${color.bg};
        backdrop-filter: blur(10px);
        border: 1px solid ${color.border};
        border-radius: 12px;
        padding: 16px 52px 16px 16px;
        min-width: 300px;
        max-width: 400px;
        color: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        transform: translateX(400px);
        opacity: 0;
        animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        overflow: hidden;
    `;

    const progressBar = notification.querySelector('.notification-progress');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: ${color.accent};
        width: 100%;
        transform: scaleX(1);
        transform-origin: left;
        animation: progress ${duration}ms linear forwards;
        border-radius: 0 0 12px 12px;
    `;

    notification.querySelector('.notification-icon').style.cssText = `
        flex-shrink: 0;
        margin-top: 2px;
    `;

    notification.querySelector('.notification-content').style.cssText = `
        flex: 1;
        min-width: 0;
    `;

    notification.querySelector('.notification-title').style.cssText = `
        font-weight: 600;
        font-size: 15px;
        margin-bottom: 4px;
        line-height: 1.3;
    `;

    notification.querySelector('.notification-message').style.cssText = `
        font-size: 13px;
        opacity: 0.9;
        line-height: 1.4;
    `;

    notification.querySelector('.notification-close').style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.7;
        padding: 0;
    `;

    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                0% {
                    transform: translateX(400px);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                0% {
                    transform: translateX(0);
                    opacity: 1;
                }
                100% {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            @keyframes progress {
                0% {
                    transform: scaleX(1);
                }
                100% {
                    transform: scaleX(0);
                }
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.3);
                opacity: 1;
                transform: scale(1.05);
            }
            
            .notification-close:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(notification);

    const removeNotification = () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    };

    notification.querySelector('.notification-close').addEventListener('click', removeNotification);

    const autoRemoveTimeout = setTimeout(removeNotification, duration);

    notification.addEventListener('mouseenter', () => {
        clearTimeout(autoRemoveTimeout);
        progressBar.style.animationPlayState = 'paused';
    });

    notification.addEventListener('mouseleave', () => {
        const remainingTime = (progressBar.style.transform === 'scaleX(0)') ? 0 :
            duration * (1 - parseFloat(progressBar.style.transform.replace('scaleX(', '').replace(')', '')));
        if (remainingTime > 0) {
            progressBar.style.animation = `progress ${remainingTime}ms linear forwards`;
            setTimeout(removeNotification, remainingTime);
        }
    });

    return {
        element: notification,
        close: removeNotification,
        update: (newTitle, newMessage) => {
            const titleEl = notification.querySelector('.notification-title');
            const messageEl = notification.querySelector('.notification-message');
            if (titleEl) titleEl.textContent = newTitle;
            if (messageEl) messageEl.textContent = newMessage;
        }
    };
}

/**
 * Быстрые функции для разных типов уведомлений
 */
const Notify = {
    success: (title, message, duration) => showNotification('success', title, message, duration),
    error: (title, message, duration) => showNotification('error', title, message, duration),
    warning: (title, message, duration) => showNotification('warning', title, message, duration),
    info: (title, message, duration) => showNotification('info', title, message, duration)
};
