// ============================================
// L07: Product Management with jQuery + localStorage
// ============================================

let products = [];
const STORAGE_KEY = 'storefront_products';

// ============================================
// Load products from localStorage
// ============================================
function loadProductsFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
        products = JSON.parse(stored);
        console.log('✅ Products loaded from localStorage:', products);
    } else {
        products = [];
        console.log('ℹ️ No products in localStorage. Starting fresh.');
    }
    
    displayAllProducts();
    updateProductCount();
}

// ============================================
// Save products to localStorage
// ============================================
function saveProductsToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products, null, 2));
    console.log('💾 Products saved to localStorage');
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

    // Check if required field is empty
    if ($(formField).prop('required') && value === '') {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Specific validations
    if (isValid && value !== '') {
        switch(fieldId) {
            case 'productTitle':
            case 'updateProductTitle':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Title must be at least 2 characters';
                }
                break;

            case 'unitMeasure':
            case 'updateUnitMeasure':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Unit must be at least 2 characters';
                }
                break;

            case 'price':
            case 'updatePrice':
                const priceValue = parseFloat(value);
                if (isNaN(priceValue) || priceValue < 0) {
                    isValid = false;
                    errorMessage = 'Price must be a positive number';
                }
                break;
        }
    }

    updateField(formField, errorElement, isValid, errorMessage);
    return isValid;
}

function validateForm(formId) {
    let isValid = true;
    
    // jQuery: Select all required inputs and validate
    $(`#${formId} input[required], #${formId} select[required]`).each(function() {
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
        id: 'PROD-' + Date.now(),
        title: $('#productTitle').val().trim(),
        category: $('#category').val(),
        unitMeasure: $('#unitMeasure').val().trim(),
        price: parseFloat($('#price').val()),
        additionalInfo: $('#additionalInfo').val().trim() || 'N/A',
        dateAdded: new Date().toISOString()
    };
}

// ============================================
// Display all products using jQuery
// Concept: 6.5 DOM Manipulation
// ============================================
function displayAllProducts(productsToDisplay = products) {
    const $productContainer = $('#productContainer'); // jQuery selector (6.2)
    
    if (productsToDisplay.length === 0) {
        $productContainer.html('<p class="text-muted text-center">No products found.</p>'); // jQuery DOM manipulation
        return;
    }

    $productContainer.empty(); // jQuery - clear container (6.5)
    
    // Loop through products and create cards
    productsToDisplay.forEach(product => {
        const productCard = `
            <div class="col-md-4 mb-3 product-card" data-product-id="${product.id}">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title product-title">${product.title}</h5>
                        <p class="card-text product-category">
                            <strong>Category:</strong> 
                            <span class="badge bg-primary">${product.category}</span>
                        </p>
                        <p class="card-text"><strong>Unit:</strong> ${product.unitMeasure}</p>
                        <p class="card-text"><strong>Price:</strong> <span class="text-success">$${product.price.toFixed(2)}</span></p>
                        <p class="card-text"><small class="text-muted">${product.additionalInfo}</small></p>
                        <p class="card-text"><small class="text-muted">Added: ${new Date(product.dateAdded).toLocaleDateString()}</small></p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-warning btn-sm me-2 btn-update-product" data-product-id="${product.id}">Update</button>
                        <button class="btn btn-danger btn-sm btn-delete-product" data-product-id="${product.id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        $productContainer.append(productCard); // jQuery append (6.5)
    });
}

// ============================================
// Update product count badge
// ============================================
function updateProductCount() {
    const count = products.length;
    $('#productCount').text(count); // jQuery - update text (6.5)
}

// ============================================
// Open Update Modal
// ============================================
function openUpdateModal(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('❌ Product not found!');
        return;
    }
    
    // Fill the modal form with existing data using jQuery
    $('#updateProductId').val(product.id);
    $('#updateProductTitle').val(product.title);
    $('#updateCategory').val(product.category);
    $('#updateUnitMeasure').val(product.unitMeasure);
    $('#updatePrice').val(product.price);
    $('#updateAdditionalInfo').val(product.additionalInfo === 'N/A' ? '' : product.additionalInfo);
    
    // Clear any previous validation states
    $('#updateForm input, #updateForm select').removeClass('is-valid is-invalid');
    $('#updateForm .text-danger').text('');
    
    // Show the modal using Bootstrap's JavaScript API
    const updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
    updateModal.show();
}

// ============================================
// Update Product
// ============================================
function updateProduct() {
    const productId = $('#updateProductId').val();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        alert('❌ Product not found!');
        return;
    }
    
    // Validate update form
    if (!validateForm('updateForm')) {
        alert('⚠️ Please fix validation errors before updating');
        return;
    }
    
    // Update the product in array
    products[productIndex] = {
        id: productId,
        title: $('#updateProductTitle').val().trim(),
        category: $('#updateCategory').val(),
        unitMeasure: $('#updateUnitMeasure').val().trim(),
        price: parseFloat($('#updatePrice').val()),
        additionalInfo: $('#updateAdditionalInfo').val().trim() || 'N/A',
        dateAdded: products[productIndex].dateAdded // Keep original date
    };
    
    // Save to localStorage
    saveProductsToLocalStorage();
    
    // Hide modal using jQuery and Bootstrap
    $('#updateModal').modal('hide');
    
    // Refresh display
    displayAllProducts();
    
    console.log('✅ Product updated:', products[productIndex]);
    alert('✅ Product updated successfully!');
}

// ============================================
// jQuery Event: Real-time Search
// Concept: 6.2 Selectors + 6.3 Events
// ============================================
$('#searchBox').on('input', function() { // jQuery event handler (6.3)
    const searchTerm = $(this).val().toLowerCase(); // jQuery - get value (6.2)
    
    console.log('🔍 Searching for:', searchTerm);
    
    // If search is empty, show all products
    if (searchTerm === '') {
        displayAllProducts();
        $('#searchBox').removeClass('border-warning'); // jQuery - remove class (6.4)
        return;
    }
    
    // Filter products by title or category
    const filteredProducts = products.filter(product => {
        return product.title.toLowerCase().includes(searchTerm) ||
               product.category.toLowerCase().includes(searchTerm);
    });
    
    console.log('📦 Found', filteredProducts.length, 'products');
    
    // Display filtered results
    displayAllProducts(filteredProducts);
    
    // Visual feedback if no results
    if (filteredProducts.length === 0) {
        $('#searchBox').addClass('border-warning'); // jQuery - add class (6.4)
    } else {
        $('#searchBox').removeClass('border-warning');
    }
});

// ============================================
// jQuery Event: Form Submission
// Concept: 6.3 Events
// ============================================
$('#productForm').on('submit', function(e) { // jQuery event handler (6.3)
    e.preventDefault();

    if (!validateForm('productForm')) {
        alert('⚠️ Please fix validation errors before submitting');
        return;
    }

    const productData = getFormData();

    // Add to products array
    products.push(productData);
    console.log('✅ Product added:', productData);

    // Save to localStorage
    saveProductsToLocalStorage();

    alert('✅ Product added successfully!');

    // Clear form
    $('#productForm')[0].reset();
    
    // Remove validation classes using jQuery
    $('#productForm input, #productForm select').removeClass('is-valid is-invalid'); // jQuery (6.4)

    // Refresh display
    displayAllProducts();
    updateProductCount();
    
    // Clear search box
    $('#searchBox').val(''); // jQuery - set value (6.2)
});

// ============================================
// jQuery Event: Update Product Button
// Concept: 6.3 Events (delegated)
// ============================================
$(document).on('click', '.btn-update-product', function() { // jQuery delegated event (6.3)
    const productId = $(this).data('product-id'); // jQuery - get data attribute (6.2)
    openUpdateModal(productId);
});

// ============================================
// jQuery Event: Save Update Button
// Concept: 6.3 Events
// ============================================
$('#saveUpdateBtn').on('click', function() { // jQuery event handler (6.3)
    updateProduct();
});

// ============================================
// jQuery Event: Delete Product
// Concept: 6.3 Events (delegated)
// ============================================
$(document).on('click', '.btn-delete-product', function() { // jQuery delegated event (6.3)
    const productId = $(this).data('product-id'); // jQuery - get data attribute (6.2)
    
    if (!confirm('⚠️ Are you sure you want to delete this product?')) {
        return;
    }

    // Remove from array
    products = products.filter(p => p.id !== productId);
    console.log('🗑️ Product deleted:', productId);
    
    // Save to localStorage
    saveProductsToLocalStorage();
    
    // Refresh display
    displayAllProducts();
    updateProductCount();
    
    alert('✅ Product deleted!');
});

// ============================================
// jQuery Event: Real-time Validation
// Concept: 6.3 Events
// ============================================
$(document).on('blur', '#productForm input, #productForm select', function() { // jQuery event (6.3)
    validateField(this);
});

// Real-time validation for update form
$(document).on('blur', '#updateForm input, #updateForm select', function() { // jQuery event (6.3)
    validateField(this);
});

// ============================================
// Initialize on page load
// Concept: jQuery Document Ready
// ============================================
$(document).ready(function() { // jQuery document ready (6.3)
    console.log('🚀 Product Management Page Initialized with jQuery');
    console.log('✨ Features: Add, Update, Delete, Search with real-time filtering');
    
    // Load products from localStorage
    loadProductsFromLocalStorage();
});