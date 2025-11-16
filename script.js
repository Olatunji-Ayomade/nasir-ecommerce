/* app.js (Updated)
   - Supports quantity
   - WhatsApp checkout shows qty + total
   - Works with static HTML data-id, data-name, data-price, data-img
*/

// --- Utilities -----------------------------------------------------------
const fmt = n => Number(n).toLocaleString();
const escapeHtml = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));

// --- Cart state ----------------------------------------------------------
let cart = JSON.parse(localStorage.getItem('nasir_cart') || '[]');

// --- DOM refs ------------------------------------------------------------
const cartCountEl = document.getElementById('cart-count');
const cartItemsModal = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartInlineEl = document.getElementById('cart-inline');
const cartTotalInlineEl = document.getElementById('cart-total-inline');

// --- Save + Rerender -----------------------------------------------------
function saveCart() {
    localStorage.setItem('nasir_cart', JSON.stringify(cart));
    renderCart();
    updateBadge();
}

function updateBadge() {
    if (cartCountEl) cartCountEl.textContent = cart.length;
}

// --- Render Cart ---------------------------------------------------------
function renderCart() {
    if (!cartItemsModal) return;

    if (cart.length === 0) {
        cartItemsModal.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
        if (cartTotalEl) cartTotalEl.textContent = '0';
        if (cartInlineEl) cartInlineEl.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
        if (cartTotalInlineEl) cartTotalInlineEl.textContent = '0';
        return;
    }

    let total = 0;

    const pieces = cart.map((item, idx) => {
        const lineTotal = item.price * item.qty;
        total += lineTotal;

        return `
            <div class="cart-item d-flex align-items-center mb-3">
                <img src="${escapeHtml(item.img)}" 
                    alt="${escapeHtml(item.name)}"
                    style="width:70px;height:70px;object-fit:cover;border-radius:8px" />

                <div class="ms-3 flex-grow-1">
                    <div class="fw-semibold">${escapeHtml(item.name)}</div>

                    <div class="d-flex align-items-center mt-2">
                        <button class="btn btn-sm btn-light decrease-btn" data-id="${item.id}">−</button>
                        <span class="mx-2">${item.qty}</span>
                        <button class="btn btn-sm btn-light increase-btn" data-id="${item.id}">+</button>
                    </div>

                    <div class="text-warning mt-2">₦ ${fmt(item.price)} each</div>
                    <div class="text-info">Subtotal: ₦ ${fmt(lineTotal)}</div>
                </div>

                <button class="btn btn-sm btn-outline-light remove-item" data-index="${idx}">
                    Remove
                </button>
            </div>
        `;
    });

    cartItemsModal.innerHTML = pieces.join('');
    cartTotalEl.textContent = fmt(total);

    if (cartInlineEl) {
        cartInlineEl.innerHTML = pieces.join('');
        if (cartTotalInlineEl) cartTotalInlineEl.textContent = fmt(total);
    }
}


document.addEventListener("click", function (e) {

    // Increase quantity
    if (e.target.classList.contains("increase-btn")) {
        let id = e.target.dataset.id;
        let item = cart.find(p => p.id === id);

        if (item) {
            item.qty++;
            saveCart();
        }
    }

    // Decrease quantity
    if (e.target.classList.contains("decrease-btn")) {
        let id = e.target.dataset.id;
        let item = cart.find(p => p.id === id);

        if (item) {
            if (item.qty > 1) {
                item.qty--;
            } else {
                cart = cart.filter(p => p.id !== id); // remove item
            }
            saveCart();
        }
    }

});


// --- Add item to cart ----------------------------------------------------
function addItemToCart(item) {
    // Check if item already exists
    let existing = cart.find(p => p.id === item.id);

    if (existing) {
        existing.qty++;
    } else {
        item.qty = 1;
        cart.push(item);
    }

    saveCart();
}


// --- Remove item ---------------------------------------------------------
function removeItemAt(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart();
    }
}

// --- Clear cart ----------------------------------------------------------
function clearCart() {
    cart = [];
    saveCart();
}

// --- Event Listeners -----------------------------------------------------
document.addEventListener("click", function (e) {

    // ADD TO CART
    const addBtn = e.target.closest(".add-btn");
    if (addBtn) {
        const id = addBtn.dataset.id;
        const name = addBtn.dataset.name;
        const price = Number(addBtn.dataset.price);
        const img = addBtn.dataset.img;

        addItemToCart({ id, name, price, img });

        addBtn.classList.add("btn-success");
        setTimeout(() => addBtn.classList.remove("btn-success"), 300);
        return;
    }

    // REMOVE ITEM
    const rm = e.target.closest(".remove-item");
    if (rm) {
        removeItemAt(parseInt(rm.dataset.index));
        return;
    }

    // CLEAR CART
    if (e.target.id === "clear-cart") {
        clearCart();
        return;
    }
});

// Render on modal open
const cartModalEl = document.getElementById("cartModal");
if (cartModalEl) {
    cartModalEl.addEventListener("shown.bs.modal", renderCart);
}

// Initial render
renderCart();
updateBadge();

// --- WHATSAPP CHECKOUT (updated) -----------------------------------------
document.getElementById("checkout").addEventListener("click", function () {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const phone = "2348101306497"; // your WhatsApp

    let message = "🛒 *NEW ORDER*\n\n";
    let total = 0;

    cart.forEach(item => {
        const lineTotal = item.price * item.qty;
        total += lineTotal;

        message += `• ${item.name}\n`;
        message += `  Qty: ${item.qty}\n`;
        message += `  Price: ₦${fmt(item.price)}\n`;
        message += `  Subtotal: ₦${fmt(lineTotal)}\n\n`;
    });

    message += `------------------------\n`;
    message += `*TOTAL: ₦${fmt(total)}*\n`;
    message += `------------------------\n`;
    message += `Customer wants to checkout.\n`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
});


document.addEventListener("click", function (e) {
    if (e.target.classList.contains("increase-btn")) {
        let id = e.target.dataset.id;
        let product = cart.find(item => item.id == id);

        if (product) {
            product.quantity++;
            updateCart();
        }
    }
});
