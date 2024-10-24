// DOM Elements
const yearSelect = document.getElementById('year');
const genreSelect = document.getElementById('genre');
const selectedGenresDisplay = document.getElementById('selectedGenres');
const currentYear = new Date().getFullYear();
const maxGenres = 4;
const selectedGenres = new Set();

// Initialize Year Selection
function initializeYearSelect() {
    for (let year = 1900; year <= currentYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    // Load year from sessionStorage
    const storedYear = sessionStorage.getItem('selectedYear');
    if (storedYear) {
        yearSelect.value = storedYear;
    }
}

// Initialize Genre Selection
function initializeGenreSelect() {
    const storedGenres = JSON.parse(sessionStorage.getItem('selectedGenres'));
    if (storedGenres) {
        storedGenres.forEach(genre => selectedGenres.add(genre));
        updateSelectedGenres();
    }

    genreSelect.addEventListener('change', handleGenreChange);
}

function handleGenreChange() {
    const selectedOption = genreSelect.value;
    if (selectedOption && !selectedGenres.has(selectedOption)) {
        if (selectedGenres.size < maxGenres) {
            selectedGenres.add(selectedOption);
            updateSelectedGenres();
            // Save selected genres to sessionStorage
            sessionStorage.setItem('selectedGenres', JSON.stringify(Array.from(selectedGenres)));
        } else {
            alert(`You can select a maximum of ${maxGenres} genres.`);
        }
    }
}

// Update Selected Genres Display
function updateSelectedGenres() {
    selectedGenresDisplay.innerHTML = '';
    selectedGenres.forEach(genre => {
        const genreDiv = document.createElement('div');
        genreDiv.classList.add('selected-genre');
        genreDiv.innerHTML = `
            ${genre} 
            <button class="remove-genre" data-genre="${genre}">Remove</button>
        `;
        selectedGenresDisplay.appendChild(genreDiv);
    });
}

// Handle Genre Removal
selectedGenresDisplay.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-genre')) {
        const genreToRemove = event.target.getAttribute('data-genre');
        selectedGenres.delete(genreToRemove);
        updateSelectedGenres();
        genreSelect.value = "";
        sessionStorage.setItem('selectedGenres', JSON.stringify(Array.from(selectedGenres)));
    }
});

// Store Selected Year
yearSelect.addEventListener('change', function() {
    sessionStorage.setItem('selectedYear', yearSelect.value);
});

// IndexedDB Functions
async function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BookStoreDB', 1);
        request.onupgradeneeded = event => {
            const db = event.target.result;
            db.createObjectStore('books', { keyPath: 'id' });
        };
        request.onsuccess = event => resolve(event.target.result);
        request.onerror = () => reject('Error opening IndexedDB');
    });
}

async function saveToIndexedDB(id, base64Data) {
    const db = await openIndexedDB();
    const transaction = db.transaction('books', 'readwrite');
    const store = transaction.objectStore('books');

    const data = { id, data: base64Data };
    const request = store.put(data);

    request.onsuccess = () => console.log(`${id} saved to IndexedDB`);
    request.onerror = () => console.error(`Error saving ${id} to IndexedDB`);
}

async function getBase64FromIndexedDB(id) {
    const db = await openIndexedDB();
    const transaction = db.transaction('books', 'readonly');
    const store = transaction.objectStore('books');

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = event => {
            resolve(event.target.result ? event.target.result.data : null);
        };
        request.onerror = () => {
            console.error(`Error retrieving ${id} from IndexedDB`);
            reject();
        };
    });
}

// File Handling Functions
function displayFileName(inputElement, displayElementId, storageKey) {
    const file = inputElement.files[0];
    if (file) {
        document.getElementById(displayElementId).textContent = `Selected file: ${file.name}`;
        sessionStorage.setItem(storageKey, file.name);
    }
}

async function loadFileNamesFromSessionStorage() {
    const storedImageFileName = sessionStorage.getItem('book_image');
    const storedBookFileName = sessionStorage.getItem('book_upload_file');

    if (storedImageFileName) {
        document.getElementById('imageFileName').textContent = `Selected file: ${storedImageFileName}`;
    }

    if (storedBookFileName) {
        document.getElementById('bookFileName').textContent = `Selected file: ${storedBookFileName}`;
    }
}

async function clearFileNamesFromSessionStorage() {
    sessionStorage.removeItem('book_image');
    sessionStorage.removeItem('book_upload_file');
}

// File Input Event Listeners
document.getElementById('bookImage').addEventListener('change', function() {
    displayFileName(this, 'imageFileName', 'book_image');
});

document.getElementById('file').addEventListener('change', function() {
    displayFileName(this, 'bookFileName', 'book_upload_file');
});

// Load File Names on Window Load
window.addEventListener('load', loadFileNamesFromSessionStorage);

// Read File as Base64
async function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Fetch Unique ID from Server
async function getUniqueId() {
    try {
        const response = await fetch('/auth/get_unique_id', { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.unique_id;
    } catch (error) {
        console.error('Error fetching unique ID:', error);
        return null;
    }
}

function clearFormFields() {
    document.getElementById('bookUploadForm').reset(); 
    selectedGenres.clear(); 
    updateSelectedGenres();
    yearSelect.value = ''; 
    genreSelect.value = ''; 
    document.getElementById('imageFileName').textContent = ''; 
    document.getElementById('bookFileName').textContent = ''; 
}

// Submit Form Handler
async function submitForm(event) {
    event.preventDefault();

    const uniqueId = await getUniqueId();
    if (!uniqueId) {
        showModal('Failed to fetch unique ID. Please try again.');
        return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const author_name = document.getElementById('author').value;
    const selectedGenresArray = Array.from(selectedGenres);
    const year = document.getElementById('year').value;
    const page = document.getElementById('page').value;
    const language = document.getElementById('language').value;
    const bookImageInput = document.getElementById('bookImage');
    const fileInput = document.getElementById('file');

    if (!title || !description || !author_name || !year || !page || !language || !bookImageInput.files.length || !fileInput.files.length || selectedGenresArray.length === 0) {
        showModal("Please fill out all fields, select at least one genre, and upload both the book image and the book file.");
        return;
    }

    const bookImageBase64 = await readFileAsBase64(bookImageInput.files[0]);
    const fileBase64 = await readFileAsBase64(fileInput.files[0]);
    const fileExtension = fileInput.files[0].name.split('.').pop();
    const genreString = selectedGenresArray.join(', ');

    const formData = {
        title,
        description,
        author_name,
        genre_name: genreString,
        year,
        page,
        language,
        extension: `.${fileExtension}`,
        bookImage: bookImageBase64,
        file: fileBase64,
    };

    try {
        const response = await fetch(`http://localhost:5000/book/upload/${uniqueId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (response.ok) {
            showModal('Book uploaded successfully!');
            console.log(result);
            await clearFileNamesFromSessionStorage();
            sessionStorage.removeItem('selectedYear');
            sessionStorage.removeItem('selectedGenres');
            clearFormFields();
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            if (result.error && result.error.includes('already exists')) {
                showModal('Error: A book with this title already exists. Please choose a different title.');
            } else {
                console.error('Error response:', result);
                showModal('Error: ' + (result.error || 'Something went wrong.'));
            }
        }
    } catch (error) {
        console.error('Error uploading book:', error);
        showModal('Failed to upload the book. Please check for errors.');
    }
}


function showModal(message) {
    const modal = document.getElementById('messageModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

function hideModal() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
}

document.querySelector('.close-button').addEventListener('click', hideModal);
window.addEventListener('click', (event) => {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        hideModal();
    }
});


document.getElementById('bookUploadForm').addEventListener('submit', submitForm);

initializeYearSelect();
initializeGenreSelect();
