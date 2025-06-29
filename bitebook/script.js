// BiteBook JavaScript Functions

// Initialize system on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize default values if not set
    if (!localStorage.getItem('totalMeals')) {
        localStorage.setItem('totalMeals', '0');
    }
    if (!localStorage.getItem('tokensIssued')) {
        localStorage.setItem('tokensIssued', '0');
    }
    if (!localStorage.getItem('studentTokens')) {
        localStorage.setItem('studentTokens', '{}');
    }
    if (!localStorage.getItem('activityLog')) {
        localStorage.setItem('activityLog', '[]');
    }
});

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

// Local Storage Management
const StorageManager = {
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return defaultValue;
        }
    },

    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting to localStorage:', error);
            return false;
        }
    },

    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
};

// Animation Functions
function addAnimation(element, animationClass, duration = 1000) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

function showLoadingButton(buttonElement, loadingText = 'Loading...') {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        ${loadingText}
    `;
    buttonElement.disabled = true;
    
    return function() {
        buttonElement.innerHTML = originalText;
        buttonElement.disabled = false;
    };
}

// Notification System
const NotificationManager = {
    show: function(message, type = 'info', duration = 5000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 fade-in`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            <i class="bi bi-${this.getIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after duration
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.classList.add('fade-out');
                setTimeout(() => alertDiv.remove(), 300);
            }
        }, duration);
    },

    getIcon: function(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle',
            'primary': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
};

// Form Validation
const FormValidator = {
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validateUsername: function(username) {
        return username && username.trim().length >= 3;
    },

    validateNumber: function(value, min = 0, max = Infinity) {
        const num = parseInt(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    showFieldError: function(fieldElement, message) {
        fieldElement.classList.add('is-invalid');
        
        // Remove existing error message
        const existingError = fieldElement.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        fieldElement.parentNode.appendChild(errorDiv);
    },

    clearFieldError: function(fieldElement) {
        fieldElement.classList.remove('is-invalid');
        const errorDiv = fieldElement.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
};

// Data Analytics
const Analytics = {
    getTotalMeals: function() {
        return parseInt(localStorage.getItem('totalMeals') || '0');
    },

    getTotalTokensIssued: function() {
        return parseInt(localStorage.getItem('tokensIssued') || '0');
    },

    getActiveStudents: function() {
        const studentTokens = StorageManager.get('studentTokens', {});
        return Object.keys(studentTokens).length;
    },

    getTodayTokens: function() {
        const today = new Date().toDateString();
        const studentTokens = StorageManager.get('studentTokens', {});
        let todayCount = 0;
        
        Object.values(studentTokens).forEach(tokens => {
            todayCount += tokens.filter(token => 
                new Date(token.timestamp).toDateString() === today
            ).length;
        });
        
        return todayCount;
    },

    getStudentStats: function(username) {
        const studentTokens = StorageManager.get('studentTokens', {});
        const userTokens = studentTokens[username] || [];
        const today = new Date().toDateString();
        
        return {
            totalTokens: userTokens.length,
            todayTokens: userTokens.filter(token => 
                new Date(token.timestamp).toDateString() === today
            ).length,
            lastTokenDate: userTokens.length > 0 ? 
                new Date(userTokens[userTokens.length - 1].timestamp).toLocaleDateString() : 
                'Never'
        };
    }
};

// Activity Logger
const ActivityLogger = {
    log: function(message, type = 'info', username = 'System') {
        const activities = StorageManager.get('activityLog', []);
        const activity = {
            id: generateUniqueId(),
            message,
            type,
            username,
            timestamp: new Date().toISOString()
        };
        
        activities.push(activity);
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.splice(0, activities.length - 100);
        }
        
        StorageManager.set('activityLog', activities);
        
        // Trigger custom event for real-time updates
        window.dispatchEvent(new CustomEvent('activityLogged', { detail: activity }));
    },

    getRecent: function(limit = 10) {
        const activities = StorageManager.get('activityLog', []);
        return activities.slice(-limit).reverse();
    }
};

// Theme Manager
const ThemeManager = {
    setTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    },

    getTheme: function() {
        return localStorage.getItem('theme') || 'light';
    },

    toggleTheme: function() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }
};

// Performance Monitor
const PerformanceMonitor = {
    startTiming: function(label) {
        performance.mark(`${label}-start`);
    },

    endTiming: function(label) {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label)[0];
        console.log(`${label}: ${measure.duration.toFixed(2)}ms`);
        
        return measure.duration;
    }
};

// Export functions for global use
window.BiteBook = {
    StorageManager,
    NotificationManager,
    FormValidator,
    Analytics,
    ActivityLogger,
    ThemeManager,
    PerformanceMonitor,
    addAnimation,
    showLoadingButton,
    formatDate,
    generateUniqueId,
    getGreeting
};

// Add some global utility functions
window.showAlert = NotificationManager.show.bind(NotificationManager);
window.logActivity = ActivityLogger.log.bind(ActivityLogger);

// Initialize theme on load
document.addEventListener('DOMContentLoaded', function() {
    const theme = ThemeManager.getTheme();
    ThemeManager.setTheme(theme);
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + L to logout (on dashboard pages)
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        if (typeof logout === 'function') {
            e.preventDefault();
            logout();
        }
    }
    
    // Ctrl/Cmd + R to refresh (prevent default and use custom refresh if available)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        if (typeof refreshMealCount === 'function') {
            e.preventDefault();
            refreshMealCount();
        }
    }
});

// Add service worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add error boundary
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    NotificationManager.show('An unexpected error occurred. Please refresh the page.', 'danger');
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    NotificationManager.show('An error occurred while processing your request.', 'warning');
});

// Add online/offline status monitoring
window.addEventListener('online', function() {
    NotificationManager.show('Connection restored', 'success', 3000);
});

window.addEventListener('offline', function() {
    NotificationManager.show('Connection lost - working offline', 'warning', 5000);
});

// Add page visibility change handler
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible, refresh data if needed
        if (typeof updateStats === 'function') {
            updateStats();
        }
        if (typeof updateMealCount === 'function') {
            updateMealCount();
        }
    }
});

console.log('BiteBook JavaScript loaded successfully!');