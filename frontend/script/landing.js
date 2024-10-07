document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById('dropdown-toggle');
    const menu = document.getElementById('dropdown-menu');

    toggle.addEventListener('click', function() {
        menu.classList.toggle('dropdown-hidden');
    });

    document.addEventListener('click', function(event) {
        if (!toggle.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.add('dropdown-hidden');
        }
    });
});
