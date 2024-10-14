let cropper;

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

async function cropImage() {
    if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas(); 
        const croppedImage = croppedCanvas.toDataURL('image/png'); 
        localStorage.setItem('profile_picture', croppedImage);
        await saveToIndexedDB(croppedImage);

        console.log(croppedImage);
        document.getElementById('profile-img').src = croppedImage;
        const image = document.getElementById('popup-profile-img');

        closePhotoEditPopup();
    } else {
        alert('Please crop the image first.');
    }
}

function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('profile_picturesDB', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pictures')) {
                db.createObjectStore('pictures', { keyPath: 'id' });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject('Error opening IndexedDB: ' + event.target.errorCode);
        };
    });
}

async function saveToIndexedDB(base64Image) {
    const db = await openIndexedDB();
    const transaction = db.transaction('pictures', 'readwrite');
    const store = transaction.objectStore('pictures');
    const data = {
        id: 'profile_picture', 
        image: base64Image
    };
    const request = store.put(data);

    request.onsuccess = function() {
        console.log('Image saved to Local');
    };
    request.onerror = function() {
        console.error('Error saving image to IndexedDB:', request.error);
    };
}

async function getBase64ImageFromIndexedDB() {
    const db = await openIndexedDB();
    const transaction = db.transaction('pictures', 'readonly');
    const store = transaction.objectStore('pictures');

    return new Promise((resolve, reject) => {
        const request = store.get('profile_picture');

        request.onsuccess = function(event) {
            if (event.target.result) {
                const base64Image = event.target.result.image; 
                resolve(base64Image);
            } else {
                resolve(null); 
            }
        };
        request.onerror = function() {
            console.error('Error retrieving image from IndexedDB:', request.error);
            reject(request.error);
        };
    });
}

async function getUniqueId() {
    try {
        const response = await fetch('/unique-id', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.unique_id; 
    } catch (error) {
        console.error('Error fetching unique ID:', error);
        return null;
    }
}

async function updateUrlWithUniqueId() {
    const uniqueId = await getUniqueId();  
    if (uniqueId) {
        const newUrl = `/user/edit?${uniqueId}`;
        window.history.replaceState(null, null, newUrl); 
    }
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

    const uniqueId = await getUniqueId(); 

    if (!uniqueId) {
        document.getElementById('message').innerText = "Unique ID not found or invalid format!";
        return;
    }
    const newEmail = document.getElementById('new_email').value;
    const newUsername = document.getElementById('new_username').value;
    let base64Photo = await getBase64ImageFromIndexedDB();
    if (base64Photo && !base64Photo.startsWith('data:image/png;base64,')) {
        base64Photo = `data:image/png;base64,${base64Photo}`;
    }

    const data = {
        unique_id: uniqueId,
        new_email: newEmail || undefined,
        new_username: newUsername || undefined,
        new_profile_picture: base64Photo || undefined 
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
            document.getElementById('message').innerText = 'Failed to update profile. Please try again.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'An error occurred. Please try again.';
    }
});

function updateUrlWithoutUniqueId() {
    const newUrl = `/user/edit`; 
    window.history.replaceState(null, null, newUrl); 
}

window.onload = async function() {
    await updateUrlWithUniqueId();
    const savedImage = localStorage.getItem('profile_picture'); 
    if (savedImage) {
        document.getElementById('profile-img').src = savedImage;
    }
};

document.getElementById('popup-profile-img').addEventListener('click', initCropperOnClick);
