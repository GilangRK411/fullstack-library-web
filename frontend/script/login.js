document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginform');
    const errorMessageElement = document.getElementById('eroormassage');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const credential = document.getElementById('logincredential').value;
            const password = document.getElementById('loginpassword').value;

            // Reset pesan kesalahan sebelum melakukan permintaan
            errorMessageElement.textContent = '';

            console.log("Attempting to login with:", { credential, password }); // Log untuk debug

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ credential, password })
                });

                const data = await response.json();
                console.log("Response data:", data); // Log respons dari server

                if (response.ok) {
                    alert("Login Success");
                    window.location.href = '/catalog';  
                } else {
                    errorMessageElement.textContent = "Login Failed: " + data.message;
                    console.log("Login failed:", data.message); // Log untuk debug
                }
            } catch (error) {
                console.error("Error:", error);
                errorMessageElement.textContent = "An error occurred while logging in. Please try again later.";
            }
        });
    } else {
        console.error("Login form not found"); // Log jika form tidak ditemukan
    }
});
