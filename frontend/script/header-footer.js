async function loadHTML() {
    const headerResponse = await fetch('header.ejs'); 
    const footerResponse = await fetch('footer.ejs');

    const headerHTML = await headerResponse.text(); 
    const footerHTML = await footerResponse.text();

    const headerElement = document.getElementById('header');
    const footerElement = document.getElementById('footer');

    if (headerElement && footerElement) {
        headerElement.innerHTML = headerHTML;
        footerElement.innerHTML = footerHTML;

        executeScripts(headerElement);
        executeScripts(footerElement);
    } else {
        console.error('Header or footer element not found in the document.');
    }
}

function executeScripts(element) {
    const scripts = element.getElementsByTagName('script');
    for (let script of scripts) {
        const newScript = document.createElement('script');
        newScript.type = script.type || 'text/javascript';
        newScript.src = script.src || '';
        newScript.text = script.innerHTML;
        document.head.appendChild(newScript); 
    }
}

window.onload = loadHTML;