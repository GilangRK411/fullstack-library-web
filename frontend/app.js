async function loadNavbar() {
    const response = await fetch('navbar.html');
    const navbarHTML = await response.text();
    document.getElementById('navbar-container').innerHTML = navbarHTML;  
}    

async function  LoadFooter() {
    const response = await fetch('footer.html');
    const footerHTML = await response.text();
    document.getElementById('footer-container').innerHTML = footerHTML;
}

// LOGIN POPUP 

// LOGIN POPUP 