async function loadHTML() {
    const hederResponse = await fetch('header.html');
    const footerResponse = await fetch('footer.html');

    const headerHTML = await hederResponse.text();
    const footerHTML = await footerResponse.text();

    const headerElement = document.getElementById('header');
    const footerElement = document.getElementById('footer');

    if (headerElement && footerElement) {
        headerElement.innerHTML = headerHTML;
        footerElement.innerHTML = footerHTML;
    } else {
        console.error('Header or footer element not found in the document.');
    }
};

document.addEventListener('DOMContentLoaded', loadHTML);


