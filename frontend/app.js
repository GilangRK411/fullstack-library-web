async function loadHTML() {
    const hederResponse = await fetch('../header.html');
    const footerResponse = await fetch('../footer.html');

    const headerHTML = await hederResponse.text();
    const footerHTML = await footerResponse.text();

    document.getElementById('header').innerHTML = headerHTML;
    document.getElementById('footer').innerHTML = footerHTML;

    const currentPage = window.location.pathname.split("/").pop();
    const navLink = document.querySelector('nav ul li a');

    navLink.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', loadHTML);