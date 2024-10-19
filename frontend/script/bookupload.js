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

async function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function submitForm(event) {
    event.preventDefault(); // Prevent the default form submission

    const uniqueId = await getUniqueId(); // Get the unique user ID from your backend
    if (!uniqueId) {
        alert('Failed to fetch unique ID. Please try again.');
        return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const author_name = document.getElementById('author').value;
    const category_name = document.getElementById('category').value;
    const year = document.getElementById('year').value;
    const page = document.getElementById('page').value;
    const language = document.getElementById('language').value;
    const extension = document.getElementById('extension').value;

    const bookImageInput = document.getElementById('bookImage');
    const fileInput = document.getElementById('file');

    // Read image and file as Base64
    const bookImageBase64 = await readFileAsBase64(bookImageInput.files[0]);
    const fileBase64 = await readFileAsBase64(fileInput.files[0]);

    // Prepare data in the required format
    const formData = {
        title,
        description,
        author_name,
        category_name,
        year,
        page,
        language,
        extension,
        bookImage: bookImageBase64,
        file: fileBase64,
    };

    try {
        const response = await fetch(`http://localhost:5000/book/upload/${uniqueId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Book uploaded successfully!');
            console.log(result);
        } else {
            console.error('Error response:', result);
            alert('Error: ' + (result.error || 'Something went wrong.'));
        }
    } catch (error) {
        console.error('Error uploading book:', error);
        alert('Failed to upload the book. Please check the console for more details.');
    }
}

// Attach submit event to the form
document.getElementById('bookUploadForm').addEventListener('submit', submitForm);
