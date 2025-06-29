document.addEventListener('DOMContentLoaded', () => {
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    const headerElements = document.querySelectorAll('.animate-fade-in, .animate-fade-in-up, .animate-scale-in, .animate-slide-in-right');

    // Intersection Observer para elementos que aparecen al hacer scroll
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% del elemento debe ser visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Deja de observar una vez que el elemento es visible
            }
        });
    };

    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    animateOnScrollElements.forEach(element => {
        scrollObserver.observe(element);
    });

    // Pequeño hack para asegurar que las animaciones iniciales del header se disparen
    // Se activan automáticamente por CSS si no se les quita la clase de animación,
    // pero si usaras JS para animarlas, lo harías aquí:
    // Por ahora, solo nos aseguramos de que estén visibles si JS está activo (aunque CSS ya lo hace)
    headerElements.forEach(element => {
        element.style.opacity = 1; // Ya que CSS los tiene en opacity 0 y anima a 1
        element.style.transform = 'none'; // Resetea cualquier transform inicial de la animación
    });
});