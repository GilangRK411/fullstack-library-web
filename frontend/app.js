const loginform = document.createElement('loginform');
const registerForm = document.createElement('registerform');

// Login 
loginform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginusername').value;
    const password = document.getElementById('loginpassword').value;
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.auth) {
        localStorage.setitem('token', data.token);
        alert("Login Succes")
    } else {
        alert("Login Failed")
    }
});

// Register
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
        const response = await fetch('http://localhost:5000/api/auth/register', {
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
