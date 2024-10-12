let cropper;

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
    if (cropper) {
        cropper.destroy();  
        cropper = null;  
    }
}

function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const imgSrc = reader.result;
        const image = document.getElementById('popup-profile-img');
        image.src = imgSrc; 

        if (cropper) {
            cropper.destroy(); 
            cropper = null;
        }
        image.style.width = "100px";
        image.style.height = "100px";
    };
    reader.readAsDataURL(event.target.files[0]);  
}

function initCropperOnClick() {
    const image = document.getElementById('popup-profile-img');

    if (cropper) {
        cropper.destroy();
    }
    image.style.width = "400px";
    image.style.height = "400px";
    cropper = new Cropper(image, {
        aspectRatio: 1,  
        viewMode: 1,
        responsive: true,
        scalable: true,
        zoomable: true,
        background: false
    });
}

function cropImage() {
    if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas(); 
        const croppedImage = croppedCanvas.toDataURL('image/png'); 

        localStorage.setItem('profilePicture', croppedImage);
        
        document.getElementById('profile-img').src = croppedImage;
        
        const image = document.getElementById('popup-profile-img');
        image.style.width = "100px";
        image.style.height = "100px";

        closePhotoEditPopup();
    } else {
        alert('Please crop the image first.');
    }
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

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); 
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
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
    
    let base64Photo = null;
    if (profilePhoto) {
        try {
            base64Photo = await readFileAsDataURL(profilePhoto); 
        } catch (error) {
            console.error("Failed to read profile photo:", error);
            document.getElementById('message').innerText = 'Failed to read profile photo.';
            return;
        }
    }
    const data = {
        unique_id: uniqueId,
        new_email: newEmail || undefined,
        new_username: newUsername || undefined,
        new_profile_photo: base64Photo ? base64Photo.split(',')[1] : undefined 
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

window.onload = function() {
    updateUrlWithUniqueId();

    const savedImage = localStorage.getItem('profile_picture');
    if (savedImage) {
        document.getElementById('profile-img').src = savedImage;
    }
};

document.getElementById('popup-profile-img').addEventListener('click', initCropperOnClick);