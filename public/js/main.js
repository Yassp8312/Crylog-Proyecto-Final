// Crylog - Premium JavaScript Interactions

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav__toggle');
    const navLinks = document.querySelector('.nav__links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent scroll when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            
            console.log('Menu toggled:', navLinks.classList.contains('active'));
        });
        
        // Close menu when clicking on a link
        const mobileNavLinks = navLinks.querySelectorAll('.nav__link, .btn');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !navToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = hero.querySelector('.hero__content');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.3}px)`;
                parallax.style.opacity = 1 - (scrolled / 700);
            }
        });
    }

    // Navigation visibility on scroll
    let lastScroll = 0;
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.background = 'rgba(14, 14, 14, 0.95)';
                header.style.backdropFilter = 'blur(20px)';
            } else {
                header.style.background = 'rgba(14, 14, 14, 0.7)';
            }
            
            lastScroll = currentScroll;
        });
    }

    // Cursor glow effect for buttons and cards
    const glowElements = document.querySelectorAll('.btn, .post-card');
    glowElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'all 0.3s ease';
        });
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.5s ease';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });

    // Close alert buttons
    const closeButtons = document.querySelectorAll('.alert__close');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const alert = button.closest('.alert');
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        });
    });

    // Form validation visual feedback
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Add focus class for styling
            input.addEventListener('focus', () => {
                input.closest('.form-group')?.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.closest('.form-group')?.classList.remove('focused');
                
                // Simple validation
                if (input.hasAttribute('required') && !input.value.trim()) {
                    input.classList.add('invalid');
                } else {
                    input.classList.remove('invalid');
                }
            });
        });
    });

    // Image lazy loading with fade-in effect
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.5s ease';
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                    
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Post card hover effects (parallax subtle effect)
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach(card => {
        const image = card.querySelector('.post-card__image img');
        if (image) {
            card.addEventListener('mouseenter', () => {
                image.style.transform = 'scale(1.05)';
            });
            
            card.addEventListener('mouseleave', () => {
                image.style.transform = 'scale(1)';
            });
        }
    });

    // Confirmation for delete actions
    const deleteForms = document.querySelectorAll('form[action*="_method=DELETE"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!confirm('¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.')) {
                e.preventDefault();
            }
        });
    });

    // Search input enhancement
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        // Clear search on Escape key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                input.value = '';
                input.blur();
            }
        });
    });

    // Intersection Observer for scroll animations
    const animatedElements = document.querySelectorAll('.post-card, .section-header');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Active navigation link highlighting
    const currentPath = window.location.pathname;
    const navLinkElements = document.querySelectorAll('.nav__link');
    navLinkElements.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    console.log('🗿 Crylog - Neo-Editorial Blog loaded successfully');
});

// Utility functions
const utils = {
    // Format date to localized string
    formatDate: (dateString, options = {}) => {
        const date = new Date(dateString);
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
    },

    // Debounce function for search inputs
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Truncate text
    truncate: (text, maxLength = 100, suffix = '...') => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + suffix;
    }
};

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}
