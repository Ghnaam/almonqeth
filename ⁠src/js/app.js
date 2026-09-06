// الحالة العامة للنظام
const state = {
    currentBranch: "فرع عشيرة",
    cart: [],
    products: [
        { id: 1, name: "سم", category: "سلام", price: 0, stock: 0, available: false, description: "", image: "" }
    ],
    categories: ["سلام"],
    banner: { title: "أهلاً بكم في لذة الخلية", subtitle: "اطلب ما يحلو لك واستلم من الفرع" },
    role: "guest", // guest, employee, manager
    adminPin: "1111" // رمز الدخول الافتراضي للإدارة
};

// متغيرات لعداد النقر السري
let clickCount = 0;
let clickTimer = null;

// تهيئة التطبيق
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderCategories();
    
    document.getElementById("menu-btn").addEventListener("click", toggleSidebar);

    // تفعيل خاصية الـ 5 نقرات على الشعار
    const triggerEl = document.getElementById("secret-admin-trigger");
    if (triggerEl) {
        triggerEl.addEventListener("click", () => {
            clickCount++;
            
            // إعادة ضبط العداد إذا مر أكثر من ثوانٍ بدون نقر
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);

            // عند الوصول لـ 5 نقرات
            if (clickCount >= 5) {
                clickCount = 0;
                clearTimeout(clickTimer);
                openAdminLoginModal();
            }
        });
    }
});

// فتح نافذة تسجيل دخول الإدارة
function openAdminLoginModal() {
    const modal = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    
    modal.classList.remove("hidden");
    content.innerHTML = `
        <h3 style="margin-bottom: 15px; text-align: center;">تسجيل دخول الإدارة 🔑</h3>
        <p style="font-size: 0.85rem; color: #666; text-align: center; margin-bottom: 15px;">أدخل رمز المرور الخاص بلوحة التحكم</p>
        <input type="password" id="admin-pin-input" placeholder="****" maxlength="4" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; text-align: center; font-size: 1.2rem; margin-bottom: 15px;">
        <button class="action-chip" style="width: 100%; background: #3b2b22; color: white; padding: 10px; margin-bottom: 8px;" onclick="verifyAdminPin()">دخول</button>
        <button class="action-chip" style="width: 100%; padding: 8px;" onclick="closeModal()">إلغاء</button>
    `;
}

// التحقق من الرمز المدخل
function verifyAdminPin() {
    const pin = document.getElementById("admin-pin-input").value;
    if (pin === state.adminPin) {
        state.role = "manager";
        closeModal();
        alert("تم تسجيل الدخول بنجاح كمدير للنظام!");
        // افتح القائمة الجانبية تلقائياً بعد الدخول الناجح
        toggleSidebar();
    } else {
        alert("رمز الدخول غير صحيح!");
    }
}

// تبديل ظهور القائمة الجانبية
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("hidden");
}

// عرض المنتجات
function renderProducts() {
    const container = document.getElementById("products-container");
    container.innerHTML = "";
    
    state.products.forEach(product => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/60'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.price} ر.س</p>
                <span style="color: ${product.available ? 'green' : 'red'}; font-size: 0.8rem;">
                    ${product.available ? 'متوفر حالياً' : 'غير متوفر حالياً'}
                </span>
                <button class="action-chip" style="margin-top: 10px;" ${!product.available ? 'disabled' : ''} onclick="addToCart(${product.id})">
                    ${product.available ? 'إضافة للسلة' : 'غير متوفر'}
                </button>
            </div>
        `;
    });
}

// عرض الأقسام
function renderCategories() {
    const container = document.getElementById("categories-container");
    container.innerHTML = "";
    state.categories.forEach(cat => {
        container.innerHTML += `<div class="category-pill">${cat}</div>`;
    });
}

// إدارة السلة
function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !product.available) return;
    
    const existing = state.cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }
    alert("تم إضافة المنتج إلى السلة بنجاح");
}

function openCart() {
    const modal = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    
    modal.classList.remove("hidden");
    
    if (state.cart.length === 0) {
        content.innerHTML = `
            <h3>سلتك</h3>
            <p style="text-align: center; margin: 20px 0;">سلتك فارغة، أضف بعض المنتجات الشهية 🧁</p>
            <button class="action-chip" style="width: 100%; background: #3b2b22; color: white;" onclick="closeModal()">إغلاق</button>
        `;
        return;
    }

    let cartHtml = `<h3>سلتك</h3><div style="max-height: 200px; overflow-y: auto; margin: 15px 0;">`;
    let total = 0;
    
    state.cart.forEach(item => {
        total += item.price * item.quantity;
        cartHtml += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center;">
                <span>${item.name} (${item.quantity})</span>
                <span>${item.price * item.quantity} ر.س</span>
            </div>
        `;
    });
    
    cartHtml += `</div><hr><p>الإجمالي: ${total} ر.س</p>
        <button class="action-chip" style="width: 100%; background: #3b2b22; color: white; margin-top: 15px;" onclick="checkout()">احجز الطلب</button>
        <button class="action-chip" style="width: 100%; margin-top: 5px;" onclick="closeModal()">إلغاء</button>
    `;
    content.innerHTML = cartHtml;
}

function closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
}

function checkout() {
    alert("تم حجز الطلب بنجاح!");
    state.cart = [];
    closeModal();
}

function openMap() {
    window.open("https://maps.google.com", "_blank");
}

function changeBranch() {
    alert("خاصية تغيير الفرع مفعلة");
}

function openSection(sectionName) {
    toggleSidebar();
    alert(`الانتقال إلى لوحة: ${sectionName}`);
}

function logout() {
    state.role = "guest";
    toggleSidebar();
    alert("تم تسجيل الخروج بنجاح");
}
