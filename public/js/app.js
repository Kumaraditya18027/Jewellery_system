// Frontend JavaScript for Palmonas Jewellery Shop

// Global variables
let currentUser = null;
let products = [];
let cart = [];
let wishlist = [];

// Load user from localStorage first
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    currentUser = JSON.parse(savedUser);
}

// DOM ready
document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
    updateAuthUI();
    await loadCart();
    await loadWishlist();
    displayProducts(products);

    // Event listeners
    document.getElementById('loginLink')?.addEventListener('click', () => window.location.href = 'login.html');
    document.getElementById('registerLink')?.addEventListener('click', () => window.location.href = 'register.html');
    document.getElementById('logoutLink')?.addEventListener('click', logout);
    document.getElementById('ordersLink')?.addEventListener('click', () => window.location.href = 'orders.html');
    document.getElementById('searchBtn')?.addEventListener('click', searchProducts);
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchProducts();
    });

    // Category filters
    document.querySelectorAll('#categoryFilters .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#categoryFilters .btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.getAttribute('data-category'));
        });
    });

    // Checkout form
    document.getElementById('placeOrderBtn')?.addEventListener('click', placeOrder);
});

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts(productsToShow) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = '';
    productsToShow.forEach(product => {
        const isInWishlist = wishlist.includes(product.id);
        const productCard = `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="position-relative">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                        <button class="btn position-absolute top-0 end-0 m-2 ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'}" onclick="toggleWishlist('${product.id}', this)">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${product.name}</h6>
                        <p class="card-text text-muted small">${product.description.substring(0, 50)}...</p>
                        <div class="mt-auto">
                            <p class="card-text fw-bold text-primary mb-2">$${product.price}</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-primary btn-sm flex-fill" onclick="viewProduct('${product.id}')">View</button>
                                <button class="btn btn-dark btn-sm flex-fill" onclick="addToCart('${product.id}')">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

// Filter products
function filterProducts(category) {
    let filteredProducts = products;
    if (category !== 'all') {
        filteredProducts = products.filter(p => p.category === category);
    }
    displayProducts(filteredProducts);
}

// Search products
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
    displayProducts(filteredProducts);
}

// View product details
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Add to cart
async function addToCart(productId) {
    if (!currentUser) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`/api/cart/${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (response.ok) {
            loadCart();
            alert('Added to cart!');
        } else {
            const error = await response.json();
            alert('Error adding to cart: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart');
    }
}

// Load cart
async function loadCart() {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/cart/${currentUser.id}`);
        cart = await response.json();
        updateCartCount();
        displayCart();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.style.display = 'inline';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

// Display cart
function displayCart() {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutSection = document.getElementById('checkoutSection');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutSection) checkoutSection.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutSection) checkoutSection.style.display = 'block';

    container.innerHTML = '';
    cart.forEach(item => {
        const cartItem = `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.product.image}" class="img-fluid rounded" alt="${item.product.name}" style="max-height: 60px;">
                        </div>
                        <div class="col-md-4">
                            <h6>${item.product.name}</h6>
                            <small class="text-muted">${item.product.description.substring(0, 50)}...</small>
                        </div>
                        <div class="col-md-2">
                            <div class="input-group input-group-sm">
                                <button class="btn btn-outline-secondary" onclick="updateQuantity('${item.product.id}', ${item.quantity - 1})">-</button>
                                <input type="number" class="form-control text-center" value="${item.quantity}" readonly>
                                <button class="btn btn-outline-secondary" onclick="updateQuantity('${item.product.id}', ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <strong>$${(item.product.price * item.quantity).toFixed(2)}</strong>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.product.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cartItem;
    });

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// Update quantity
async function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    try {
        const response = await fetch(`/api/cart/${currentUser.id}/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            loadCart();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Remove from cart
async function removeFromCart(productId) {
    try {
        await fetch(`/api/cart/${currentUser.id}/${productId}`, { method: 'DELETE' });
        loadCart();
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

// Load wishlist
async function loadWishlist() {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/wishlist/${currentUser.id}`);
        wishlist = await response.json();
        displayWishlist();
    } catch (error) {
        console.error('Error loading wishlist:', error);
    }
}

// Toggle wishlist
async function toggleWishlist(productId, button) {
    if (!currentUser) {
        alert('Please login to manage wishlist');
        window.location.href = 'login.html';
        return;
    }

    try {
        if (wishlist.includes(productId)) {
            // Remove from wishlist
            await fetch(`/api/wishlist/${currentUser.id}/${productId}`, { method: 'DELETE' });
            wishlist = wishlist.filter(id => id !== productId);
            button.classList.remove('btn-danger');
            button.classList.add('btn-outline-danger');
        } else {
            // Add to wishlist
            await fetch(`/api/wishlist/${currentUser.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });
            wishlist.push(productId);
            button.classList.remove('btn-outline-danger');
            button.classList.add('btn-danger');
        }
        displayWishlist();
    } catch (error) {
        console.error('Error toggling wishlist:', error);
    }
}

// Display wishlist
function displayWishlist() {
    const container = document.getElementById('wishlistContainer');
    const emptyWishlist = document.getElementById('emptyWishlist');

    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '';
        if (emptyWishlist) emptyWishlist.style.display = 'block';
        return;
    }

    if (emptyWishlist) emptyWishlist.style.display = 'none';

    container.innerHTML = '';
    wishlist.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const wishlistItem = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="position-relative">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                            <button class="btn btn-danger position-absolute top-0 end-0 m-2" onclick="toggleWishlist('${product.id}', this)">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h6 class="card-title">${product.name}</h6>
                            <p class="card-text text-muted small">${product.description.substring(0, 50)}...</p>
                            <div class="mt-auto">
                                <p class="card-text fw-bold text-primary mb-2">$${product.price}</p>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-primary btn-sm flex-fill" onclick="viewProduct('${product.id}')">View</button>
                                    <button class="btn btn-dark btn-sm flex-fill" onclick="addToCart('${product.id}')">Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += wishlistItem;
        }
    });
}

// Payment method change handler
document.getElementById('paymentMethod')?.addEventListener('change', function() {
    const cardDetails = document.getElementById('cardDetails');
    const paymentMethod = this.value;
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
        cardDetails.style.display = 'block';
    } else {
        cardDetails.style.display = 'none';
    }
});

// Place order
async function placeOrder() {
    const receiverName = document.getElementById('receiverName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const shippingAddress = document.getElementById('shippingAddress').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!receiverName || !phone || !email || !shippingAddress || !paymentMethod) {
        alert('Please fill in all required fields');
        return;
    }

    // Validate card details if credit/debit card is selected
    if ((paymentMethod === 'credit_card' || paymentMethod === 'debit_card')) {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        if (!cardNumber || !expiryDate || !cvv) {
            alert('Please fill in all card details');
            return;
        }

        // Basic validation
        if (cardNumber.replace(/\s/g, '').length < 13 || cardNumber.replace(/\s/g, '').length > 19) {
            alert('Please enter a valid card number');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            alert('Please enter expiry date in MM/YY format');
            return;
        }

        if (cvv.length < 3 || cvv.length > 4) {
            alert('Please enter a valid CVV');
            return;
        }
    }

    // Simulate payment processing
    const paymentSuccess = await processPayment(paymentMethod);
    if (!paymentSuccess) {
        alert('Payment failed. Please try again.');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    try {
        const response = await fetch(`/api/orders/${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                total,
                shippingAddress,
                phone,
                receiverName,
                email,
                paymentMethod
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Order placed successfully! Your tracking number is: ${result.order.trackingNumber}`);
            cart = [];
            updateCartCount();
            window.location.href = 'orders.html';
        } else {
            const error = await response.json();
            alert('Error placing order: ' + error.error);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order');
    }
}

// Simulate payment processing
async function processPayment(paymentMethod) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 90% success rate
    return Math.random() > 0.1;
}

// Authentication functions
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    cart = [];
    wishlist = [];
    updateCartCount();
    window.location.href = 'index.html';
}

function updateAuthUI() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');
    const ordersLink = document.getElementById('ordersLink');
    const divider = document.getElementById('divider');

    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (ordersLink) ordersLink.style.display = 'block';
        if (divider) divider.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (ordersLink) ordersLink.style.display = 'none';
        if (divider) divider.style.display = 'none';
    }
}



// Product details page
if (window.location.pathname.includes('product.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        loadProductDetails(productId);
    }
}

async function loadProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        const container = document.getElementById('productDetails');
        const isInWishlist = wishlist.includes(productId);

        container.innerHTML = `
            <div class="col-md-6">
                <img src="${product.image}" class="img-fluid rounded shadow" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="mb-0">${product.name}</h2>
                    <button class="btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'}" onclick="toggleWishlist('${product.id}', this)">
                        <i class="fas fa-heart fa-lg"></i>
                    </button>
                </div>
                <p class="text-muted mb-3">${product.description}</p>
                <h4 class="text-primary mb-4">$${product.price}</h4>
                <div class="d-flex gap-3">
                    <button class="btn btn-dark btn-lg" onclick="addToCart('${product.id}')">
                        <i class="fas fa-cart-plus me-2"></i>Add to Cart
                    </button>
                    <button class="btn btn-outline-primary btn-lg" onclick="shareProduct('${product.id}')">
                        <i class="fas fa-share me-2"></i>Share
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// Share functions
function shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnTwitter() {
    const url = window.location.href;
    const text = "Check out this amazing jewellery piece!";
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
}

function shareOnWhatsApp() {
    const url = window.location.href;
    const text = "Check out this amazing jewellery piece! " + url;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
    });
}

// Orders page
if (window.location.pathname.includes('orders.html')) {
    loadOrders();
}

async function loadOrders() {
    if (!currentUser) {
        alert('Please login to view orders');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`/api/orders/${currentUser.id}`);
        const orders = await response.json();

        const container = document.getElementById('ordersList');
        if (!container) return;

        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = '<div class="text-center"><h4>No orders found</h4><p>You haven\'t placed any orders yet.</p></div>';
            return;
        }

        orders.forEach(order => {
            const orderCard = `
                <div class="card mb-4 shadow-sm">
                    <div class="card-header bg-light">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Order #${order.id}</h5>
                            <span class="badge bg-${order.status === 'Pending' ? 'warning' : order.status === 'Shipped' ? 'info' : order.status === 'Delivered' ? 'success' : 'secondary'}">${order.status}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h6>Items:</h6>
                                ${order.items.map(item => `
                                    <div class="d-flex align-items-center mb-2">
                                        <img src="${item.product.image}" class="me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                                        <div>
                                            <strong>${item.product.name}</strong><br>
                                            <small class="text-muted">Quantity: ${item.quantity} | Price: $${(item.product.price * item.quantity).toFixed(2)}</small>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="col-md-4">
                                <div class="border-start ps-3">
                                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                                    <p><strong>Shipping Address:</strong><br><small>${order.shippingAddress}</small></p>
                                    ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
                                    ${order.receiverName ? `<p><strong>Receiver:</strong> ${order.receiverName}</p>` : ''}
                                    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
                                    ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>` : ''}
                                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="viewTracking('${order.id}')">Track Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += orderCard;
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// View tracking details
async function viewTracking(orderId) {
    try {
        const response = await fetch(`/api/orders/order/${orderId}`);
        const order = await response.json();

        const trackingSection = document.getElementById('trackingSection');
        const trackingDetails = document.getElementById('trackingDetails');

        if (trackingSection && trackingDetails) {
            trackingDetails.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h5>Tracking Details for Order #${order.id}</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Status:</strong> <span class="badge bg-${order.status === 'Pending' ? 'warning' : order.status === 'Shipped' ? 'info' : order.status === 'Delivered' ? 'success' : 'secondary'}">${order.status}</span></p>
                                <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Not available'}</p>
                                <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Not available'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Shipping Progress:</h6>
                                <div class="progress mb-3">
                                    <div class="progress-bar ${order.status === 'Pending' ? 'bg-warning' : order.status === 'Shipped' ? 'bg-info' : order.status === 'Delivered' ? 'bg-success' : 'bg-secondary'}" role="progressbar" style="width: ${order.status === 'Pending' ? '33%' : order.status === 'Shipped' ? '66%' : order.status === 'Delivered' ? '100%' : '0%'}" aria-valuenow="${order.status === 'Pending' ? '33' : order.status === 'Shipped' ? '66' : order.status === 'Delivered' ? '100' : '0'}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-check-circle text-success"></i> Order Placed</li>
                                    <li><i class="fas fa-${order.status === 'Pending' ? 'circle' : 'check-circle'} ${order.status === 'Pending' ? 'text-muted' : 'text-success'}"></i> Processing</li>
                                    <li><i class="fas fa-${order.status === 'Shipped' || order.status === 'Delivered' ? 'check-circle' : 'circle'} ${order.status === 'Shipped' || order.status === 'Delivered' ? 'text-success' : 'text-muted'}"></i> Shipped</li>
                                    <li><i class="fas fa-${order.status === 'Delivered' ? 'check-circle' : 'circle'} ${order.status === 'Delivered' ? 'text-success' : 'text-muted'}"></i> Delivered</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            trackingSection.style.display = 'block';
            trackingSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading tracking details:', error);
        alert('Error loading tracking details');
    }
}

// Login/Register pages
if (window.location.pathname.includes('login.html')) {
    document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.user) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                window.location.href = 'index.html';
            } else {
                alert('Login failed: ' + (data.error || 'Invalid credentials'));
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed');
        }
    });
}

if (window.location.pathname.includes('register.html')) {
    document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (data.message === 'User registered successfully') {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                alert('Registration failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed');
        }
    });
}
