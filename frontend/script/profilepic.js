
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
                document.getElementById('profileImage').src = 'https://i.ibb.co.com/6yCCpFw/vecteezy-user-profile-icon-profile-avatar-user-icon-male-icon-20911737.png'; 
            };
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    } else {
        console.log('Unique ID not found in cookies');
    }
}

window.onload = fetchProfilePicture;