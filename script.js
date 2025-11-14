// Product data
const allProducts = [
    {
        id: 1,
        name: 'Premium Wireless Headphones with Noise Cancellation',
        price: 12999,
        originalPrice: 19999,
        discount: 35,
        rating: 4.5,
        reviews: 1250,
        isNew: true,
        category: 'headphones',
        image: 'headphones.jpg',
    },
    {
        id: 2,
        name: 'Smart Watch with Health Monitoring & GPS',
        price: 8999,
        originalPrice: 12999,
        discount: 31,
        rating: 4.8,
        reviews: 880,
        isNew: false,
        category: 'smartwatches',
        image: 'smartwatch.jpg',
    },
    {
        id: 3,
        name: 'Latest Smartphone with 128GB Storage',
        price: 24999,
        originalPrice: 29999,
        discount: 17,
        isNew: false,
        rating: 4.9,
        reviews: 2340,
        category: 'smartphones',
        image: 'smartphone.jpg',
    },
    {
        id: 4,
        name: 'Ultra-Slim Laptop for Professional Work',
        price: 55999,
        originalPrice: 65999,
        discount: 16,
        isNew: true,
        category: 'laptops',
        image: 'laptop.jpg',
        rating: 4.7,
        reviews: 1560,
    },
    {
        id: 5,
        name: 'Latest Tablet with 128GB Storage',
        price: 12999,
        originalPrice: 19999,
        discount: 35,
        rating: 4.5,
        reviews: 1250,
        isNew: false,
        category: 'headphones',
        image: 'tablet.jpg',
    },
    {
        id: 6,
        name: 'Wireless Earbuds for a Premium Audio Experience',
        price: 8999,
        originalPrice: 12999,
        discount: 29,
        rating: 4.8,
        reviews: 880,
        isNew: true,
        category: 'smartwatches',
        image: 'earbuds.jpg',
    },
];

// Select DOM elements
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartSubtotal = document.getElementById('cart-subtotal'); // Added for subtotal
const categoryFilters = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');
const couponInput = document.getElementById('coupon-code');
const applyCouponBtn = document.getElementById('apply-coupon-btn');
const discountText = document.getElementById('discount-text');
const checkoutBtn = document.getElementById('checkout-btn'); // Changed to ID selector

// Checkout Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const closeModalBtn = document.querySelector('.close-modal');
const checkoutForm = document.getElementById('checkout-form');

// Order Success Modal Elements
const orderSuccessModal = document.getElementById('order-success-modal');
const closeSuccessModalBtn = document.querySelector('.close-success-modal');
const continueShoppingBtn = document.querySelector('.continue-shopping-btn');

let cart = [];
let discountApplied = false;

// --- Functions to handle rendering and logic ---

function renderProducts(productArray) {
    productGrid.innerHTML = '';
    if (productArray.length === 0) {
        productGrid.innerHTML = '<p style="text-align: center; color: #666; width: 100%;">कोई उत्पाद नहीं मिला।</p>';
        return;
    }
    
    productArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        let badges = '';
        if (product.isNew) {
            badges += '<span class="badge new-badge">New</span>';
        }
        if (product.discount) {
            badges += `<span class="badge discount-badge">-${product.discount}%</span>`;
        }

        const ratingStars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 !== 0 ? '½' : '');

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="images/${product.image}" alt="${product.name}" class="product-image"> <div class="product-badges">${badges}</div>
                <div class="product-actions">
                    <div class="action-btn"><i class="far fa-heart"></i></div>
                    <div class="action-btn"><i class="fas fa-expand-alt"></i></div>
                </div>
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <div class="product-rating">
                    ${ratingStars}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    <span class="original-price">₹${product.originalPrice}</span>
                </div>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

function updateCart() {
    // 1. Calculate Total Item Count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
    // 2. Re-render the Cart UI
    renderCart();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; margin-top: 2rem; color: #666;">Your cart is empty.</p>';
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Cart is Empty';
        }
    } else {
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Proceed to Checkout';
        }

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            
            // --- CART ITEM TEMPLATE WITH QUANTITY CONTROLS ---
            cartItem.innerHTML = `
                <img src="images/${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;"> <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrement-btn" data-id="${item.id}" data-action="decrement">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn increment-btn" data-id="${item.id}" data-action="increment">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">X</button>
            `;
            // ---------------------------------------------------
            
            cartItemsContainer.appendChild(cartItem);
            subtotal += item.price * item.quantity;
        });
    }

    let total = subtotal;

    if (discountApplied) {
        const discountAmount = total * 0.10;
        total = total - discountAmount; 
        discountText.textContent = `Coupon applied! 10% off (₹${discountAmount.toFixed(2)})`;
    } else {
        discountText.textContent = '';
    }
    
    // Check if elements exist before updating
    if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `₹${total.toFixed(2)}`; 
}

// --- Event Listeners ---

// 1. Add to Cart (Updated for Quantity)
productGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = parseInt(e.target.dataset.id);
        const productToAdd = allProducts.find(p => p.id === productId);

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        discountApplied = false; 
        updateCart();
        cartSidebar.classList.add('open');
    }
});

// 2. Open/Close Cart
cartIcon.addEventListener('click', () => {
    cartSidebar.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

// 3. Quantity/Remove Listener (New Functionality)
cartItemsContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.dataset.id) return; 

    const productId = parseInt(target.dataset.id);
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex === -1) return; 

    if (target.classList.contains('remove-item-btn')) {
        cart.splice(itemIndex, 1);
    } else if (target.classList.contains('quantity-btn')) {
        const action = target.dataset.action;

        if (action === 'increment') {
            cart[itemIndex].quantity++;
        } else if (action === 'decrement') {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
            } else {
                cart.splice(itemIndex, 1);
            }
        }
    }
    
    discountApplied = false;
    updateCart();
});
// --------------------------------------------------------


// 4. Filters and Search (Existing Logic)
categoryFilters.addEventListener('click', (e) => {
    const categoryCard = e.target.closest('.category-card');
    if (categoryCard) {
        const filter = categoryCard.dataset.category;
        
        let filteredProducts = [];
        if (filter === 'all') { 
            filteredProducts = allProducts;
        } else {
            filteredProducts = allProducts.filter(product => product.category === filter);
        }
        renderProducts(filteredProducts);
    }
});

searchInput.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
});

// 5. Apply Coupon (Existing Logic)
applyCouponBtn.addEventListener('click', () => {
    const couponCode = couponInput.value.trim().toUpperCase();
    if (couponCode === 'SAVE10' && cart.length > 0) {
        discountApplied = true;
        updateCart();
    } else if (cart.length === 0) {
         discountText.textContent = 'Cart is empty. Cannot apply coupon.';
         discountApplied = false;
         updateCart();
    } else {
        discountApplied = false;
        updateCart();
        discountText.textContent = 'Invalid coupon code.';
    }
});

// 6. Checkout Modals (Existing Logic)
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            cartSidebar.classList.remove('open');
            checkoutModal.style.display = 'flex';
        } else {
            alert('Your cart is empty. Please add items to checkout.');
        }
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        checkoutModal.style.display = 'none';
        orderSuccessModal.style.display = 'flex';

        cart = [];
        discountApplied = false;
        updateCart();
        checkoutForm.reset();
    });
}

if (closeSuccessModalBtn) {
    closeSuccessModalBtn.addEventListener('click', () => {
        orderSuccessModal.style.display = 'none';
    });
}

if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', () => {
        orderSuccessModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
    if (e.target === orderSuccessModal) {
        orderSuccessModal.style.display = 'none';
    }
});


// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(allProducts);
    updateCart();
    
    const viewAllBtn = document.querySelector('.view-all-btn');
    const featuredProductsSection = document.getElementById('featured-products');
    if (viewAllBtn && featuredProductsSection) {
        viewAllBtn.addEventListener('click', () => {
            featuredProductsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    }
});