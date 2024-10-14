async function logout() {
    try {
        const response = await fetch('/auth/logout', {
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

async function fetchProfilePicture() {
    try {
        const uniqueIdResponse = await fetch('/unique-id', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!uniqueIdResponse.ok) {
            throw new Error('Failed to fetch unique_id: ' + uniqueIdResponse.statusText);
        }

        const uniqueIdData = await uniqueIdResponse.json();
        const unique_id = uniqueIdData.unique_id;

        if (unique_id) {
            const profilePictureUrl = `/user/profile_picture/${unique_id}`;
            const pictureResponse = await fetch(profilePictureUrl);
            if (!pictureResponse.ok) {
                throw new Error('Failed to fetch profile picture: ' + pictureResponse.statusText);
            }

            const data = await pictureResponse.json();
            const profileImageElement = document.getElementById('profileImage');
            profileImageElement.src = data.profile_picture;
            profileImageElement.onerror = () => {
                console.error('Error loading image, setting to default');
                profileImageElement.src = 'https://i.ibb.co/com/6yCCpFw/vecteezy-user-profile-icon-profile-avatar-user-icon-male-icon-20911737.png'; 
            };
        } else {
            console.log('Unique ID not found in response');
        }
    } catch (error) {
        console.error('Error fetching profile picture:', error);
    } finally {
        isFetching = false;
    }
}

function executeLast() {
    fetchProfilePicture();
}

executeLast();