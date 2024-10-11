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
        window.location.href = '/';
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred during logout. Please try again.');
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block'; 
    } else {
        dropdown.style.display = 'none'; 
    }
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdown');
    const imgProfile = document.getElementById('imgprofile');

    if (!imgProfile.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadHTML();
    toggleDropdown();
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        const decodedValue = decodeURIComponent(cookieValue);
        const parsedValue = JSON.parse(decodedValue);
        return parsedValue.unique_id; // Return the unique_id
    }
    return null;
}

async function fetchProfilePicture() {
    const unique_id = getCookie('unique_id'); 
    
    // Print the URL if unique_id is found
    if (unique_id) {
        const profilePictureUrl = `/user/profile_picture/${unique_id}`;
        console.log(`Fetching profile picture from: ${profilePictureUrl}`); 
        
        try {
            const response = await fetch(profilePictureUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            document.getElementById('profileImage').src = data.profile_picture;

            // Optional: Add error handling if the image fails to load
            document.getElementById('profileImage').onerror = () => {
                console.error('Error loading image, setting to default');
                document.getElementById('profileImage').src = '../asset/defaultpp.png'; 
            };
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    } else {
        console.log('Unique ID not found in cookies');
    }
}

window.onload = fetchProfilePicture;