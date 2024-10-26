const loginForm = document.getElementById('loginform');
const errorMessage = document.querySelector('.error-message');
const resetPrompt = document.getElementById('resetPrompt');
const passwordField = document.getElementById('loginpassword');
const togglePasswordCheckbox = document.getElementById('togglePassword');

let passwordAttempts = 0;
let errorTimeout;

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const usernameOrEmail = document.getElementById('logincredential').value; 
    const password = passwordField.value;

    try {
        const response = await fetch('/auth/login', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usernameOrEmail, password }) 
        });
        const result = await response.json();

        if (response.ok) {
            alert("Login Success");
            window.location.href = '/catalog';  
        } else {
            if (errorTimeout) clearTimeout(errorTimeout);

            if (response.status === 404) {
                showMessage('Username/email not found');
                resetPrompt.style.display = 'none'; 
            } else if (response.status === 401) {
                passwordAttempts++;
                showMessage('Incorrect password');

                if (passwordAttempts >= 2) {
                    resetPrompt.style.display = 'block';
                }
            } else {
                showMessage(result.message || 'Login failed.');
                resetPrompt.style.display = 'none'; 
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        showMessage('An error occurred. Please try again.'); 
    }
});

togglePasswordCheckbox.addEventListener('change', function() {
    passwordField.type = this.checked ? 'text' : 'password';
});

function showMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    errorTimeout = setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 1000);
}
