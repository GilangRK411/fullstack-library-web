async function loadHTML() {
    const headerResponse = await fetch('header.html'); 
    const footerResponse = await fetch('footer.html');

    const headerHTML = await headerResponse.text(); 
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


// Log Out
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to log out'); 
        }
        alert('You have been logged out.');
        isLoggedIn = false; 
        document.getElementById('dropdown').style.display = 'none'; 
        window.location.reload(); 
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred during logout. Please try again.');
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    const currentUrl = window.location.pathname; 
    if (currentUrl !== '/') {
        dropdown.style.display = (dropdown.style.display === 'none' || dropdown.style.display === '') ? 'block' : 'none';
    }
}

window.onload = function() {
    const imgProfile = document.getElementById('imgprofile');
    const currentUrl = window.location.pathname;

    if (currentUrl === '/') {
        imgProfile.style.display = 'none'; 
    } else {
        imgProfile.style.display = 'block'; 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadHTML();
});


// // Function to edit the profile
// function editProfile() {
//     if (isLoggedIn) {
//         // Redirect to the Edit Profile page or show an edit profile form
//         alert('Redirecting to Edit Profile page...');
//     } else {
//         alert('Please log in to edit your profile.');
//     }
// }