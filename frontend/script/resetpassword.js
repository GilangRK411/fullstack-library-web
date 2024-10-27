const resetPasswordForm = document.getElementById('resetPasswordForm');

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

resetPasswordForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const verificationCode = document.getElementById('verificationCode').value;

    if (!token) {
        document.getElementById('responseMessage').textContent = 'Invalid or missing token.';
        return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
        document.getElementById('responseMessage').textContent = 'Please enter a valid 6-digit verification code.';
        return;
    }

    try {
        const response = await fetch(`/auth/${token}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword, verificationCode })
        });
        const result = await response.json();

        document.getElementById('responseMessage').textContent = result.message;
        if (response.ok) {
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        }
    } catch (error) {
        console.error('Error during password reset:', error);
        document.getElementById('responseMessage').textContent = 'An error occurred. Please try again.';
    }
});
