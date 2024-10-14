const loginForm = document.getElementById('loginform');

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const usernameOrEmail = document.getElementById('logincredential').value; 
    const password = document.getElementById('loginpassword').value;

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
            document.querySelector('.error-message').textContent = result.message || 'Login failed.'; 
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.querySelector('.error-message').textContent = 'An error occurred. Please try again.'; 
    }
});

