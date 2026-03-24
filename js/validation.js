// ============================================
// L06: User/Member Management with localStorage
// ============================================

let users = [];
const STORAGE_KEY = 'storefront_users';

// ============================================
// Load users from localStorage
// ============================================
function loadUsersFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
        users = JSON.parse(stored);
        console.log('✅ Users loaded from localStorage:', users);
    } else {
        users = [];
        console.log('ℹ️ No users in localStorage. Starting fresh.');
    }
    
    displayAllUsers();
    updateUserCount();
}

// ============================================
// Save users to localStorage
// ============================================
function saveUsersToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users, null, 2));
    console.log('💾 Users saved to localStorage');
}

// ============================================
// Validation Functions
// ============================================
function updateField(formField, errorElement, isValid, errorMessage) {
    if (isValid) {
        $(formField).addClass('is-valid').removeClass('is-invalid');
        $(errorElement).text('').removeClass('show');
    }
    else {
        $(formField).addClass('is-invalid').removeClass('is-valid');
        $(errorElement).text(errorMessage).addClass('show');
    }
}

function validateField(formField) {
    const fieldId = formField.id;
    const value = $(formField).val().trim();
    const errorElement = document.getElementById(fieldId + 'Error');

    let isValid = true;
    let errorMessage = "";

    if ($(formField).prop('required') && value === '') {
        isValid = false;
        errorMessage = 'This field is required';
    }

    if (isValid && value !== '') {
        switch(fieldId) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;

            case 'email':
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailPattern.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email';
                }
                break;

            case 'zip':
                if (!/^\d{5}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Zip must be 5 digits';
                }
                break;
        }
    }

    updateField(formField, errorElement, isValid, errorMessage);
    return isValid;
}

function validateForm() {
    let isValid = true;
    
    $('#signupForm input[required], #signupForm select[required]').each(function() {
        if (!validateField(this)) {
            isValid = false;
        }
    });

    return isValid;
}

// ============================================
// Get form data
// ============================================
function getFormData() {
    return {
        id: 'USER-' + Date.now(),
        firstName: $('#firstName').val().trim(),
        lastName: $('#lastName').val().trim(),
        email: $('#email').val().trim(),
        phone: $('#phone').val().trim() || 'N/A',
        address: {
            street: $('#street').val().trim(),
            city: $('#city').val().trim(),
            state: $('#state').val(),
            zip: $('#zip').val().trim()
        },
        creationDate: new Date().toISOString()
    };
}

// ============================================
// Display all users using jQuery
// ============================================
function displayAllUsers() {
    const $userCardsContainer = $('#userCards');
    
    if (users.length === 0) {
        $userCardsContainer.html('<p class="text-muted text-center">No users registered yet.</p>');
        return;
    }

    $userCardsContainer.empty();
    
    users.forEach(user => {
        const userCard = `
            <div class="col-md-4 mb-3 user-card" data-user-id="${user.id}">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${user.firstName} ${user.lastName}</h5>
                        <p class="card-text"><strong>Email:</strong> ${user.email}</p>
                        <p class="card-text"><strong>Phone:</strong> ${user.phone}</p>
                        <p class="card-text"><strong>Address:</strong><br>
                        ${user.address.street}<br>
                        ${user.address.city}, ${user.address.state} ${user.address.zip}</p>
                        <p class="card-text"><small class="text-muted">Registered: ${new Date(user.creationDate).toLocaleString()}</small></p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-danger btn-sm btn-delete-user" data-user-id="${user.id}">Delete User</button>
                    </div>
                </div>
            </div>
        `;
        
        $userCardsContainer.append(userCard);
    });
}

// ============================================
// Update user count badge
// ============================================
function updateUserCount() {
    const count = users.length;
    $('#userCount').text(count);
}

// ============================================
// jQuery Event: Form Submission
// ============================================
$('#signupForm').on('submit', function(e) {
    e.preventDefault();

    if(!validateForm()) {
        alert('⚠️ Please fix validation errors before submitting');
        return;
    }

    const userData = getFormData();
    users.push(userData);
    
    // Save to localStorage
    saveUsersToLocalStorage();

    alert('✅ You successfully signed up!');

    // Clear form
    $('#signupForm')[0].reset();
    $('#signupForm input, #signupForm select').removeClass('is-valid is-invalid');

    // Refresh display
    displayAllUsers();
    updateUserCount();
});

// ============================================
// jQuery Event: Delete user
// ============================================
$(document).on('click', '.btn-delete-user', function() {
    const userId = $(this).data('user-id');
    
    if (!confirm('⚠️ Are you sure you want to delete this user?')) {
        return;
    }

    users = users.filter(user => user.id !== userId);
    
    // Save to localStorage
    saveUsersToLocalStorage();
    
    displayAllUsers();
    updateUserCount();
    
    alert('✅ User deleted!');
});

// ============================================
// jQuery Event: Real-time validation
// ============================================
$(document).on('blur', '#signupForm input, #signupForm select', function() {
    validateField(this);
});

// ============================================
// Initialize on page load
// ============================================
$(document).ready(function() {
    console.log('🚀 Signup Page Initialized');
    
    // Load users from localStorage
    loadUsersFromLocalStorage();
});