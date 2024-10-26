const resetRequestForm = document.getElementById('resetRequestForm');

resetRequestForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/auth/request-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        const result = await response.json();

        // Show the response message
        document.getElementById('responseMessage').textContent = result.message;
        if (response.ok) {
            // Clear input after successful submission
            document.getElementById('email').value = '';
        }
    } catch (error) {
        console.error('Error during password reset request:', error);
        document.getElementById('responseMessage').textContent = 'An error occurred. Please try again.';
    }
});
