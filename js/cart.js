// ============================================
// L08: Shopping Cart with AJAX
// ============================================

let products = [];
let cart = [];

const PRODUCTS_KEY = 'storefront_products';
const CART_KEY = 'storefront_cart';

// ============================================
// Load Products from localStorage
// ============================================
function loadProducts() {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (stored) {
        products = JSON.parse(stored);
        console.log('✅ Products loaded:', products.length);
    } else {
        products = [];
        console.log('ℹ️ No products found');
    }
    displayProducts();
}

// ============================================
// Load Cart from localStorage
// ============================================
function loadCart() {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
        cart = JSON.parse(stored);
        console.log('✅ Cart loaded:', cart.length, 'items');
    } else {
        cart = [];
        console.log('ℹ️ Cart is empty');
    }
    displayCart();
}

// ============================================
// Save Cart to localStorage
// ============================================
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    console.log('💾 Cart saved');
}

// ============================================
// Get Product by ID
// ============================================
function getProduct(productId) {
    return products.find(p => p.id === productId);
}

// ============================================
// Get Available Inventory for Product
// ============================================
function getAvailableInventory(productId) {
    const product = getProduct(productId);
    if (!product) {
        return 0;
    }
    
    // If product has inventory field, use it; otherwise no limit
    return product.inventory !== undefined ? product.inventory : null;
}

// ============================================
// Check if Quantity is Available
// ============================================
function isQuantityAvailable(productId, requestedQuantity) {
    const availableInventory = getAvailableInventory(productId);
    
    // If no inventory limit (null), always available
    if (availableInventory === null) {
        return true;
    }
    
    // Check against inventory
    return requestedQuantity <= availableInventory;
}

// ============================================
// Display Products (Browse List)
// ============================================
function displayProducts(productsToDisplay = products) {
    const $productList = $('#productList');
    
    if (productsToDisplay.length === 0) {
        $productList.html('<p class="text-muted">No products available</p>');
        return;
    }

    $productList.empty();
    
    productsToDisplay.forEach(product => {
        const inventoryText = product.inventory !== undefined 
            ? `<small class="text-muted">(${product.inventory} in stock)</small>` 
            : '';
        
        const productCard = `
            <div class="card mb-3 product-card" data-product-id="${product.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-1 product-title">${product.title}</h6>
                            <small class="text-muted">${product.category} | ${product.unitMeasure}</small>
                            ${inventoryText}
                        </div>
                        <div class="col-md-4 text-end">
                            <h6 class="text-success mb-2">$${product.price.toFixed(2)}</h6>
                            <button class="btn btn-sm btn-primary btn-add-to-cart" data-product-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $productList.append(productCard);
    });
}

// ============================================
// Display Cart
// ============================================
function displayCart() {
    const $cartItems = $('#cartItems');
    
    if (cart.length === 0) {
        $cartItems.html('<p class="text-muted">Your cart is empty</p>');
        $('#cartTotal').text('$0.00');
        return;
    }

    $cartItems.empty();
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const availableInventory = getAvailableInventory(item.id);
        const inventoryNote = availableInventory !== null 
            ? `<small class="text-muted">(${availableInventory} available)</small>` 
            : '';
        
        const cartItem = `
            <div class="cart-item mb-3 pb-3 border-bottom" data-cart-index="${index}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.title}</h6>
                        <small class="text-muted">$${item.price.toFixed(2)} each</small>
                    </div>
                    <button class="btn btn-sm btn-danger btn-remove-from-cart" data-index="${index}">×</button>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="d-flex align-items-center gap-2">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-secondary btn-decrease-qty" data-index="${index}">-</button>
                            <input type="text" class="form-control form-control-sm quantity-input" 
                                   style="width: 60px; text-align: center;" 
                                   value="${item.quantity}" 
                                   data-index="${index}">
                            <button class="btn btn-outline-secondary btn-increase-qty" data-index="${index}">+</button>
                        </div>
                        ${inventoryNote}
                    </div>
                    <strong class="item-subtotal">$${itemTotal.toFixed(2)}</strong>
                </div>
            </div>
        `;
        $cartItems.append(cartItem);
    });
    
    $('#cartTotal').text('$' + total.toFixed(2));
}

// ============================================
// Add to Cart
// ============================================
function addToCart(productId) {
    const product = getProduct(productId);
    
    if (!product) {
        alert('❌ Product not found');
        return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        
        // Check if new quantity is available
        if (!isQuantityAvailable(productId, newQuantity)) {
            const available = getAvailableInventory(productId);
            alert(`⚠️ Cannot add more. Only ${available} units of "${product.title}" available in stock!`);
            return;
        }
        
        existingItem.quantity = newQuantity;
    } else {
        // Check if at least 1 is available
        if (!isQuantityAvailable(productId, 1)) {
            alert(`⚠️ "${product.title}" is out of stock!`);
            return;
        }
        
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
    
    console.log('✅ Added to cart:', product.title);
}

// ============================================
// Remove from Cart
// ============================================
function removeFromCart(index) {
    const item = cart[index];
    
    if (!confirm(`Remove ${item.title} from cart?`)) {
        return;
    }
    
    cart.splice(index, 1);
    
    saveCart();
    displayCart();
    
    console.log('🗑️ Removed from cart:', item.title);
}

// ============================================
// Update Quantity (+ or - buttons)
// ============================================
function updateQuantity(index, change) {
    const item = cart[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    // Check if new quantity is available
    if (!isQuantityAvailable(item.id, newQuantity)) {
        const available = getAvailableInventory(item.id);
        alert(`⚠️ Cannot increase quantity. Only ${available} units of "${item.title}" available in stock!`);
        return;
    }
    
    cart[index].quantity = newQuantity;
    saveCart();
    displayCart();
}

// ============================================
// Set Quantity Directly (from input box)
// ============================================
function setQuantity(index, quantity) {
    const item = cart[index];
    const newQuantity = parseInt(quantity);
    
    // Validate input
    if (isNaN(newQuantity) || newQuantity < 1) {
        alert('⚠️ Please enter a valid quantity (minimum 1)');
        displayCart(); // Reset to current value
        return;
    }
    
    // Check if quantity is available
    if (!isQuantityAvailable(item.id, newQuantity)) {
        const available = getAvailableInventory(item.id);
        alert(`⚠️ Only ${available} units of "${item.title}" available in stock! Cannot set quantity to ${newQuantity}.`);
        displayCart(); // Reset to current value
        return;
    }
    
    cart[index].quantity = newQuantity;
    saveCart();
    displayCart();
}

// ============================================
// Validate Entire Cart Before Checkout
// ============================================
function validateCart() {
    const issues = [];
    
    cart.forEach((item) => {
        const availableInventory = getAvailableInventory(item.id);
        
        // Only validate if product has inventory limit
        if (availableInventory !== null && item.quantity > availableInventory) {
            issues.push(`${item.title}: You have ${item.quantity} in cart, but only ${availableInventory} available in stock`);
        }
    });
    
    if (issues.length > 0) {
        alert('⚠️ Cannot proceed with checkout. The following items exceed available inventory:\n\n' + 
              issues.join('\n') + 
              '\n\nPlease adjust quantities before checking out.');
        return false;
    }
    
    return true;
}

// ============================================
// AJAX Checkout
// ============================================
function checkout() {
    if (cart.length === 0) {
        alert('⚠️ Your cart is empty!');
        return;
    }

    // Validate cart before checkout
    if (!validateCart()) {
        return; // STOP - do not proceed with checkout
    }

    console.log('📡 Sending cart to API via AJAX...');
    console.log('Cart data:', cart);

    $.ajax({
        url: 'https://jsonplaceholder.typicode.com/posts',
        method: 'POST',
        data: JSON.stringify({
            cart: cart,
            total: calculateTotal(),
            timestamp: new Date().toISOString()
        }),
        contentType: 'application/json'
    })
    .done(function(response) {
        console.log('✅ Server response:', response);
        
        alert('✅ Order placed successfully!\n\nOrder ID: ' + response.id + '\nTotal: $' + calculateTotal().toFixed(2) + '\n\nCheck console for details.');
        
        // Clear cart after successful checkout
        cart = [];
        saveCart();
        displayCart();
    })
    .fail(function(jqXHR) {
        console.error('❌ AJAX Error:', jqXHR);
        alert('❌ Checkout failed. Please try again.');
    });
}

// ============================================
// Calculate Total
// ============================================
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ============================================
// jQuery Event: Search Products
// ============================================
$('#searchBox').on('keyup', function() {
    const searchValue = $(this).val().toLowerCase();
    
    if (searchValue === '') {
        displayProducts();
        return;
    }
    
    const filtered = products.filter(product => {
        return product.title.toLowerCase().includes(searchValue) ||
               product.category.toLowerCase().includes(searchValue);
    });
    
    displayProducts(filtered);
});

// ============================================
// jQuery Event: Add to Cart
// ============================================
$(document).on('click', '.btn-add-to-cart', function() {
    const productId = $(this).data('product-id');
    addToCart(productId);
});

// ============================================
// jQuery Event: Remove from Cart
// ============================================
$(document).on('click', '.btn-remove-from-cart', function() {
    const index = $(this).data('index');
    removeFromCart(index);
});

// ============================================
// jQuery Event: Increase Quantity
// ============================================
$(document).on('click', '.btn-increase-qty', function() {
    const index = $(this).data('index');
    updateQuantity(index, 1);
});

// ============================================
// jQuery Event: Decrease Quantity
// ============================================
$(document).on('click', '.btn-decrease-qty', function() {
    const index = $(this).data('index');
    updateQuantity(index, -1);
});

// ============================================
// jQuery Event: Quantity Input Change
// ============================================
$(document).on('change', '.quantity-input', function() {
    const index = $(this).data('index');
    const quantity = $(this).val();
    setQuantity(index, quantity);
});

// ============================================
// jQuery Event: Prevent Invalid Input
// ============================================
$(document).on('keypress', '.quantity-input', function(e) {
    // Only allow numbers
    if (e.which < 48 || e.which > 57) {
        e.preventDefault();
    }
});

// ============================================
// jQuery Event: Checkout
// ============================================
$('#checkoutBtn').on('click', function() {
    checkout();
});

// ============================================
// Initialize on Page Load
// ============================================
$(document).ready(function() {
    console.log('🛒 Shopping Cart Page Initialized');
    
    loadProducts();
    loadCart();
});