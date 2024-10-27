const resetRequestForm = document.getElementById('resetRequestForm');
const responseMessageEl = document.getElementById('responseMessage');
const submitButton = document.querySelector('.submit-button');
const countdownEl = document.createElement('p');

resetRequestForm.appendChild(countdownEl);
countdownEl.style.display = 'none';

let countdownTimer;

resetRequestForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/auth/request-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        
        console.log('Server response:', result);

        if (response.status === 200) {
            responseMessageEl.innerText = result.message;

            if (result.remainingTime && typeof result.remainingTime === 'number' && result.remainingTime > 0) {
                startCooldown(result.remainingTime); 
            } else {
                responseMessageEl.innerText = 'Invalid remaining time. Please try again later.';
            }
        } else if (response.status === 429) {
            responseMessageEl.innerText = result.message;
            if (result.remainingTime && typeof result.remainingTime === 'number' && result.remainingTime > 0) {
                startCooldown(result.remainingTime); 
            } else {
                responseMessageEl.innerText = 'Invalid remaining time. Please try again later.';
            }
        } else {
            responseMessageEl.innerText = 'An error occurred';
        }
    } catch (error) {
        console.error('Error:', error);
        responseMessageEl.innerText = 'An error occurred';
    }
});

function startCooldown(remainingTime) {
    submitButton.disabled = true; 
    countdownEl.style.display = 'block'; 
    countdownEl.innerText = `Please wait ${remainingTime} seconds before requesting again.`;

    let timeLeft = remainingTime;

    countdownTimer = setInterval(() => {
        timeLeft--;
        countdownEl.innerText = `Please wait ${timeLeft} seconds before requesting again.`;
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            submitButton.disabled = false; 
            countdownEl.style.display = 'none';
            responseMessageEl.innerText = ''; 
        }
    }, 1000);
}
