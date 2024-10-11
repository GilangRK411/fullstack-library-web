function previewImage(event, isPopup = false) {
    const img = isPopup ? document.getElementById('popup-profile-img') : document.getElementById('profile-img');
    img.src = URL.createObjectURL(event.target.files[0]);
    if (!isPopup) {
        document.getElementById('profile-picture').click();
    }
}

function openPhotoEditPopup() {
    document.getElementById('photo-edit-popup').style.display = 'block';
}

function closePhotoEditPopup() {
    document.getElementById('photo-edit-popup').style.display = 'none';
}

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

function updateUrlWithUniqueId() {
    const uniqueId = getCookie('unique_id');  
    if (uniqueId) {
        const newUrl = `/user/edit?${uniqueId}`;
        window.history.replaceState(null, null, newUrl); 
        console.log("Updated URL:", newUrl);
    } else {
        console.log("Unique ID not found in cookies."); kan
    }
}

document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const uniqueId = getCookie('unique_id'); 

    if (!uniqueId) {
        document.getElementById('message').innerText = "Unique ID not found or invalid format!";
        return;
    }

    const newEmail = document.getElementById('new_email').value;
    const newUsername = document.getElementById('new_username').value;
    const profilePhoto = document.getElementById('profile_photo').files[0]; 

    const data = {
        unique_id: uniqueId,
        new_email: newEmail || undefined,
        new_username: newUsername || undefined, 
        profile_photo: profilePhoto || undefined 
    };
    try {
        const response = await fetch(`http://localhost:5000/user/edit/${uniqueId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.text();
        document.getElementById('message').innerText = result;

        if (response.ok) {
            document.getElementById('editProfileForm').reset(); 
            updateUrlWithoutUniqueId();
        } else {
            console.error("Response error:", result); 
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'An error occurred. Please try again.';
    }
});

function updateUrlWithoutUniqueId() {
    const newUrl = `/user/edit`; 
    window.history.replaceState(null, null, newUrl); 
    console.log("URL updated to:", newUrl); 
}

window.onload = updateUrlWithUniqueId;
