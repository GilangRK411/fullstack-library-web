async function fetchBooks() {
    try {
        // Fetch all books using POST
        const response = await fetch('http://localhost:5000/book/getbooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const books = await response.json();
        if (!Array.isArray(books)) {
            throw new Error('Expected an array of books');
        }
        const imageContainer = document.querySelector('#section2 .imagecontai-row');
        if (!imageContainer) {
            throw new Error('Image container not found');
        }
        imageContainer.innerHTML = ''; 
        for (const book of books) {
            const imageBox = document.createElement('div');
            imageBox.classList.add('imagebox');
            const bookImageResponse = await fetch(`http://localhost:5000/book/showbook/${book.book_id}`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!bookImageResponse.ok) {
                console.error(`Failed to fetch image for book ID ${book.book_id}: ${bookImageResponse.statusText}`);
                continue; 
            }

            const bookData = await bookImageResponse.json();

            const bookImage = document.createElement('img');
            bookImage.classList.add('img');
            bookImage.src = bookData.image; 

            const imageBoxDesc = document.createElement('div');
            imageBoxDesc.classList.add('imageboxdec');

            const bookTitle = document.createElement('h5');
            bookTitle.textContent = bookData.title; 

            const bookDescription = document.createElement('p');
            bookDescription.classList.add('textcol');
            bookDescription.innerHTML = `<span class="green">+0</span>
                                         <span class="red">-0</span>`;
            imageBoxDesc.appendChild(bookTitle);
            imageBoxDesc.appendChild(bookDescription);
            imageBox.appendChild(bookImage);
            imageBox.appendChild(imageBoxDesc);

            imageContainer.appendChild(imageBox);
        }
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchBooks);
