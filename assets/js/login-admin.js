

// Khởi tạo tài khoản Admin mặc định trong localStorage nếu chưa có
function initAdminAccount() {
    if (!localStorage.getItem('admin')) {
        const defaultAdmin = { username: 'admin', password: '123' };
        localStorage.setItem('admin', JSON.stringify(defaultAdmin));
    }
}

// Kiểm tra xem Admin đã đăng nhập trước đó chưa
function checkExistingAdminSession() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentAdmin) {
        window.location.href = 'dashboard.html';
    }
}

// Chạy khởi tạo
initAdminAccount();
checkExistingAdminSession();

// Xử lý đăng nhập khi người dùng bấm nút submit
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value;
            const errorElement = document.getElementById('adminError');

            const adminAccount = JSON.parse(localStorage.getItem('admin'));

            if (username === adminAccount.username && password === adminAccount.password) {
                localStorage.setItem('currentAdmin', JSON.stringify({
                    username: username,
                    role: 'admin',
                    loginTime: new Date().toISOString()
                }));

                alert('Đăng nhập Quản trị thành công!');
                window.location.href = 'admin.html';
            } else {
                errorElement.innerText = 'Tài khoản hoặc mật khẩu Quản trị không chính xác!';
                errorElement.style.display = 'block';
            }
        });
    }
});

// ========================================================
// 1. DỮ LIỆU MẪU & KHỞI TẠO LOCALSTORAGE
// ========================================================
const initialProducts = [
    {
        id: "SP001",
        code: "IP15PM",
        name: "iPhone 15 Pro Max 256GB",
        category: "Apple",
        price: 29990000,
        image: "../assets/images/iphone15.jpg",
        description: "Màn hình OLED 6.7 inch, Chip A17 Pro, RAM 8GB, Camera 48MP",
        status: "active" // active (hiển thị) hoặc hidden (ẩn)
    },
    {
        id: "SP002",
        code: "SS-S24U",
        name: "Samsung Galaxy S24 Ultra",
        category: "Samsung",
        price: 31990000,
        image: "../assets/images/s24ultra.jpg",
        description: "Màn hình Dynamic AMOLED 2X 6.8 inch, Snapdragon 8 Gen 3, S-Pen",
        status: "active"
    }
];

const initialCategories = ["Apple", "Samsung", "Xiaomi", "OPPO"];

// Khởi tạo dữ liệu nếu localStorage trống
function initData() {
    if (!localStorage.getItem("products")) {
        localStorage.setItem("products", JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem("categories")) {
        localStorage.setItem("categories", JSON.stringify(initialCategories));
    }
}

function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}

function getCategories() {
    return JSON.parse(localStorage.getItem("categories")) || [];
}

// ========================================================
// 2. HIỂN THỊ DANH SÁCH & BỘ LỌC
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    initData();
    renderCategoryOptions();
    renderProducts();

    // Lắng nghe sự kiện Tìm kiếm và Lọc
    document.getElementById("search-product").addEventListener("input", renderProducts);
    document.getElementById("filter-category").addEventListener("change", renderProducts);

    // Bắt sự kiện Thêm mới
    document.getElementById("btn-add-product").addEventListener("click", openAddModal);

    // Bắt sự kiện Submit Form (Thêm/Sửa)
    document.getElementById("product-form").addEventListener("submit", handleSaveProduct);
});

// Render danh mục vào thẻ Select
function renderCategoryOptions() {
    const categories = getCategories();
    const filterSelect = document.getElementById("filter-category");
    const formSelect = document.getElementById("prod-category");

    let filterHtml = '<option value="">-- Tất cả hãng --</option>';
    let formHtml = '';

    categories.forEach(cat => {
        filterHtml += `<option value="${cat}">${cat}</option>`;
        formHtml += `<option value="${cat}">${cat}</option>`;
    });

    filterSelect.innerHTML = filterHtml;
    formSelect.innerHTML = formHtml;
}

// Render Bảng danh sách sản phẩm
function renderProducts() {
    const products = getProducts();
    const searchValue = document.getElementById("search-product").value.toLowerCase().trim();
    const selectedCategory = document.getElementById("filter-category").value;
    const tbody = document.getElementById("product-list");

    // Lọc theo từ khóa và Hãng
    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchValue) || p.code.toLowerCase().includes(searchValue);
        const matchesCategory = selectedCategory === "" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không tìm thấy sản phẩm nào!</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><strong>${p.code}</strong></td>
            <td><img src="${p.image}" alt="${p.name}" width="50" height="50" style="object-fit:cover; border-radius:4px;"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${Number(p.price).toLocaleString("vi-VN")} đ</td>
            <td>
                <span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}">
                    ${p.status === 'active' ? 'Kinh doanh' : 'Đã ẩn'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-edit" onclick="openEditModal('${p.id}')">Sửa</button>
                <button class="btn btn-sm btn-toggle" onclick="toggleProductStatus('${p.id}')">
                    ${p.status === 'active' ? 'Ẩn' : 'Hiện'}
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteProduct('${p.id}')">Xóa</button>
            </td>
        </tr>
    `).join("");
}

// ========================================================
// 3. MỞ MODAL & SỰ KIỆN FORM (THÊM / SỬA)
// ========================================================
const modal = document.getElementById("product-modal");
const form = document.getElementById("product-form");

function openAddModal() {
    document.getElementById("modal-title").innerText = "Thêm sản phẩm mới";
    form.reset();
    document.getElementById("product-id").value = ""; // ID rỗng nghĩa là thêm mới
    modal.classList.remove("hidden");
}

function openEditModal(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("modal-title").innerText = "Cập nhật sản phẩm";
    document.getElementById("product-id").value = product.id;
    document.getElementById("prod-code").value = product.code;
    document.getElementById("prod-name").value = product.name;
    document.getElementById("prod-category").value = product.category;
    document.getElementById("prod-price").value = product.price;
    document.getElementById("prod-image").value = product.image;
    document.getElementById("prod-desc").value = product.description;
    document.getElementById("prod-status").value = product.status;

    modal.classList.remove("hidden");
}

function closeProductModal() {
    modal.classList.add("hidden");
}

// Xử lý Thêm / Sửa khi submit form
function handleSaveProduct(e) {
    e.preventDefault();
    const products = getProducts();
    const id = document.getElementById("product-id").value;

    const productData = {
        id: id ? id : "SP" + Date.now(), // Tạo ID duy nhất nếu là sản phẩm mới
        code: document.getElementById("prod-code").value.trim(),
        name: document.getElementById("prod-name").value.trim(),
        category: document.getElementById("prod-category").value,
        price: Number(document.getElementById("prod-price").value),
        image: document.getElementById("prod-image").value.trim(),
        description: document.getElementById("prod-desc").value.trim(),
        status: document.getElementById("prod-status").value
    };

    if (id) {
        // Cập nhật sản phẩm cũ
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = productData;
        }
    } else {
        // Thêm sản phẩm mới
        products.push(productData);
    }

    saveProducts(products);
    closeProductModal();
    renderProducts();
}

// ========================================================
// 4. THAO TÁC XÓA & ẨN / HIỆN SẢN PHẨM
// ========================================================

// Đổi trạng thái Ẩn / Kinh doanh
function toggleProductStatus(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
        product.status = product.status === "active" ? "hidden" : "active";
        saveProducts(products);
        renderProducts();
    }
}

// Xóa vĩnh viễn sản phẩm
function deleteProduct(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderProducts();
    }
}