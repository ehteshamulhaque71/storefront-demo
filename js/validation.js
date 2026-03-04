function updateField(formField, errorElement, isValid, errorMessage) {
    if (isValid) {
        formField.classList.add('is-valid');
        formField.classList.remove('is-invalid');

        errorElement.textContent = "";
        errorElement.classList.remove('show');
    }
    else {
        formField.classList.add('is-invalid');
        formField.classList.remove('is-valid');

        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    }
}


function validateField(formField) {
    const fieldId = formField.id;
    const value = formField.value.trim();
    const errorElement = document.getElementById(fieldId + 'Error');

    let isValid = true;
    let errorMessage = "";



    if (formField.hasAttribute('required') && value === ''){
        isValid = false;
        errorMessage = 'This field is required';
    }

    if (isValid && value !== '') {
        switch(fieldId) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be atleast 2 characters';
                }
                break;

            case 'email':
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                if (!emailPattern.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email';
                }
        }
    }

    updateField(formField, errorElement, isValid, errorMessage);

    return isValid;
}

function validateForm() {
    const form = document.getElementById("signupForm");
    let isValid = true;

    const formInputs = form.querySelectorAll('input, select');
    
    formInputs.forEach(formField => {
        if (!validateField(formField)) {
            isValid = false;
        }
    });

    return isValid;
}


function handleSignupSubmit(event) {
    event.preventDefault();

    if(!validateForm()) {
        window.alert('Form is not valid');
        return;
    }
}

function initilizeApp() {
    console.log('Setting Everything');

    document.getElementById('signupForm').addEventListener('submit', handleSignupSubmit);
}

document.addEventListener('DOMContentLoaded', initilizeApp);