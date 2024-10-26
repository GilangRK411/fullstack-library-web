const resetPasswordForm = document.getElementById('resetPasswordForm');

// Extract token from the URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token'); // Assumes token is in URL as `?token=<tokenValue>`

resetPasswordForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;

    if (!token) {
        document.getElementById('responseMessage').textContent = 'Invalid or missing token.';
        return;
    }

    try {
        // Pass the token in the URL
        const response = await fetch(`/auth/${token}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword })
        });
        const result = await response.json();

        document.getElementById('responseMessage').textContent = result.message;
        if (response.ok) {
            // Redirect or notify the user of success
            setTimeout(() => {
                window.location.href = '/login'; // Redirect to login after 3 seconds
            }, 3000);
        }
    } catch (error) {
        console.error('Error during password reset:', error);
        document.getElementById('responseMessage').textContent = 'An error occurred. Please try again.';
    }
});
