const registerForm = document.createElement('registerform');

document.getElementById('registerform').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const username = document.getElementById('registerusername').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('registerpassword').value;

    const data = {
        username: username,
        email: email,
        password: password
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            window.location.href = '/login'; 
        } else {
            document.querySelector('.error-message').textContent = result.message || 'Registration failed.';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        document.querySelector('.error-message').textContent = 'An error occurred. Please try again.';
    }
});
