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
        return parsedValue.unique_id; 
    }
    return null;
}

async function fetchProfilePicture() {
    const unique_id = getCookie('unique_id'); 
    if (unique_id) {
        const profilePictureUrl = `/user/profile_picture/${unique_id}`;

        try {
            const response = await fetch(profilePictureUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            let profilePicture = data.profile_picture;
            if (!profilePicture || profilePicture === 'null') {
                profilePicture = '../asset/defaultpp.png';
            }
            const profileImageElement = document.getElementById('profileImage');
            profileImageElement.src = profilePicture;

            profileImageElement.onerror = () => {
                console.error('Error loading image, setting to default');
                profileImageElement.src = '../asset/defaultpp.png'; 
            };
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            document.getElementById('profileImage').src = '../asset/defaultpp.png';
        }
    } else {
        console.log('Unique ID not found in cookies');
        document.getElementById('profileImage').src = '../asset/defaultpp.png';
    }
}


window.onload = function() {
    fetchProfilePicture();
};