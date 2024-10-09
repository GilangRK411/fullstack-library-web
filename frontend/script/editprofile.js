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

window.onclick = function(event) {
    const popup = document.getElementById('photo-edit-popup');
    if (event.target === popup) {
        closePhotoEditPopup();
    }
};
