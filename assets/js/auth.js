if (!localStorage.getItem('users')) {
  if (typeof SEED_DATA !== 'undefined' && SEED_DATA.users) {
    localStorage.setItem('users', JSON.stringify(SEED_DATA.users));
  }
}
const DangNhap = document.querySelector('.login');
if (DangNhap) {
  DangNhap.addEventListener('submit', function (e) {
    e.preventDefault();

    const userName = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => (u.name === userName || u.phone === userName || u.email === userName) && u.password === password);

    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      if (user.name === 'admin') {
        window.location.href = 'admin/admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      alert("Đăng nhập thất bại!");
    }
  });
}
document.addEventListener('DOMContentLoaded', function () {
  const userDangNhap = sessionStorage.getItem('currentUser');
  const nutDangNhap = document.getElementById('dangnhap');
  const hienThiND = document.getElementById('HienThiND');
  const nutDangXuat = document.getElementById('DangXuat');
  const hienThiTen = document.getElementById('HienThiTen');

  if (userDangNhap && nutDangNhap && hienThiND && hienThiTen) {
    const current = JSON.parse(userDangNhap); 

    nutDangNhap.style.display = 'none';
    hienThiND.style.display = 'inline-block';

    hienThiTen.textContent = current.name || current.username;
  }

  if (nutDangXuat) {
    nutDangXuat.addEventListener('click', function () {
    sessionStorage.removeItem('currentUser');
    alert('Đã đăng xuất thành công!');
    window.location.reload();
    });
  }
});

// Chỉnh sửa 23/10/2026
// ==========================================================================
//                  XỬ LÝ GIỎ HÀNG VÀ THANH TOÁN
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  
  // Nếu đang ở trang giỏ hàng (cart.html)

  //Để bật tính năng yêu cầu đăng nhập thì xóa dòng note dưới là sẽ bật được

  /*const cartListContainer = document.querySelector(".cart-list");
  if (cartListContainer) {
    if (!currentUser || currentUser.name === "admin") {
      alert("Vui lòng đăng nhập tài khoản khách hàng để xem giỏ hàng và thanh toán!");
      window.location.href = "login.html";
      return;
    }
  }*/

    // Tự động điền thông tin khách hàng vào form thanh toán
    const nameInput = document.getElementById("fullname");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");

    if (nameInput) nameInput.value = currentUser.name || "";
    if (phoneInput) phoneInput.value = currentUser.phone || "";
    if (addressInput) addressInput.value = currentUser.address || "";

    renderCartPage();
  //}
});

// Render danh sách sản phẩm trong giỏ hàng
function renderCartPage() {
  const cartListContainer = document.querySelector(".cart-list");
  const totalContainer = document.getElementById("cart-total");
  if (!cartListContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartListContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--muted);">
        <p style="font-size: 1.1rem; margin-bottom: 15px;">🛒 Giỏ hàng của bạn đang trống!</p>
        <a href="products.html" class="btn" style="background: var(--accent); color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600;">Tiếp tục mua sắm</a>
      </div>
    `;
    if (totalContainer) totalContainer.textContent = formatCurrency(0);
    return;
  }

  let totalAmount = 0;

  cartListContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = (item.price || 0) * (item.qty || 1);
    totalAmount += itemTotal;

    return `
      <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid var(--line);">
        <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
          <div style="width: 70px; height: 70px; background: #eef0f4; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
            ${item.img ? `<img src="${item.img}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:0.8rem; color:var(--muted);">📱</span>`}
          </div>
          <div>
            <h4 style="font-size: 1rem; margin-bottom: 4px; color: var(--text);">${item.name}</h4>
            <div style="color: var(--accent); font-weight: 700; font-size: 0.95rem;">${formatCurrency(item.price)}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="display: flex; align-items: center; border: 1px solid var(--line); border-radius: 6px; overflow: hidden;">
            <button type="button" onclick="updateQty(${index}, -1)" style="background: #f5f6f8; border: none; padding: 6px 12px; cursor: pointer; font-weight: bold;">-</button>
            <span style="padding: 0 12px; font-weight: 600; font-size: 0.95rem;">${item.qty}</span>
            <button type="button" onclick="updateQty(${index}, 1)" style="background: #f5f6f8; border: none; padding: 6px 12px; cursor: pointer; font-weight: bold;">+</button>
          </div>

          <div style="width: 120px; text-align: right; font-weight: 700; color: var(--text);">
            ${formatCurrency(itemTotal)}
          </div>

          <button type="button" onclick="removeItem(${index})" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 1.1rem; padding: 5px;" title="Xóa sản phẩm">🗑️</button>
        </div>
      </div>
    `;
  }).join("");

  if (totalContainer) {
    totalContainer.textContent = formatCurrency(totalAmount);
  }
}

// Tăng/giảm số lượng
function updateQty(index, change) {
  let cart = getCart();
  if (cart[index]) {
    cart[index].qty = (cart[index].qty || 1) + change;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    renderCartPage();
  }
}

// Xóa sản phẩm
function removeItem(index) {
  let cart = getCart();
  if (cart[index] && confirm(`Bạn có muốn xóa sản phẩm "${cart[index].name}" khỏi giỏ hàng?`)) {
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
  }
}

// Xử lý nút Xác nhận đặt hàng
document.getElementById("checkout-form")?.addEventListener("submit", function(e) {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống, không thể đặt hàng!");
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const receiverName = document.getElementById("fullname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const paymentMethod = document.getElementById("payment-method").value;

  if (!receiverName || !phone || !address) {
    alert("Vui lòng điền đầy đủ thông tin người nhận và địa chỉ giao hàng!");
    return;
  }

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const newOrderId = "DH" + String(orders.length + 1).padStart(2, "0");

  const newOrder = {
    id: newOrderId,
    customerName: currentUser.name,
    customerPhone: phone,
    receiverName: receiverName,
    address: address,
    date: new Date().toISOString().split("T")[0],
    payment: paymentMethod,
    status: "new",
    items: cart.map(item => ({
      prodId: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty
    })),
    total: totalAmount
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.removeItem("userCart");
  updateCartBadge();

  alert(`Đặt hàng thành công! Mã đơn hàng của bạn là #${newOrderId}`);
  window.location.href = "order-history.html";
});

// Chỉnh sửa ngày 24/10/2026
// ==========================================================================
//                    XỬ LÝ HIỂN THỊ LỊCH SỬ ĐƠN HÀNG 
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
  const orderListContainer = document.getElementById("order-list");
  if (!orderListContainer) return; // Nếu không phải trang lịch sử đơn hàng thì bỏ qua

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");

  // Lọc các đơn hàng của khách hàng đang đăng nhập (hoặc hiển thị tất cả nếu đang ẩn tính năng đăng nhập)
  let userOrders = allOrders;
  if (currentUser && currentUser.name !== "admin") {
    userOrders = allOrders.filter(o => o.customerName === currentUser.name);
  }

  if (userOrders.length === 0) {
    orderListContainer.innerHTML = `
      <div style="background: #fff; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid var(--line);">
        <p class="muted" style="margin-bottom: 15px;">Bạn chưa có đơn hàng nào được đặt thành công.</p>
        <a href="products.html" class="btn" style="background: var(--accent); color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600;">Mua sắm ngay</a>
      </div>
    `;
    return;
  }

  // Từ điển ánh xạ trạng thái đơn hàng sang tiếng Việt kèm màu sắc huy hiệu (badge)
  const statusMap = {
    new: { text: "Mới đặt", class: "new" },
    processed: { text: "Đã xử lý", class: "processed" },
    delivered: { text: "Đã giao", class: "delivered" },
    cancelled: { text: "Đã hủy", class: "cancelled" }
  };

  orderListContainer.innerHTML = userOrders.slice().reverse().map(o => {
    const statusInfo = statusMap[o.status] || { text: o.status, class: "new" };
    
    const itemsHtml = (o.items || []).map(it => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--line); font-size: 0.95rem;">
        <div>
          <b>${it.name}</b> <span class="muted">(x${it.qty})</span>
        </div>
        <div style="font-weight: 600;">${formatCurrency(it.price * it.qty)}</div>
      </div>
    `).join("");

    return `
      <div class="order-card" style="background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 20px; margin-bottom: 15px;">
        <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <b style="font-size: 1.05rem; color: var(--text);">Mã đơn: #${o.id}</b>
            <span class="muted" style="margin-left: 15px;">📅 Ngày đặt: ${o.date}</span>
          </div>
          <div>
            <span class="badge ${statusInfo.class}" style="padding: 4px 10px; border-radius: 999px; font-size: 0.85srem; font-weight: 700;">${statusInfo.text}</span>
          </div>
        </div>

        <div style="margin-bottom: 12px; font-size: 0.9rem; color: var(--muted);">
          <p><b>Người nhận:</b> ${o.receiverName || o.customerName} (${o.customerPhone || "---"})</p>
          <p><b>Địa chỉ giao:</b> ${o.address || "Tại cửa hàng"}</p>
          <p><b>Hình thức thanh toán:</b> ${o.payment || "Tiền mặt (COD)"}</p>
        </div>

        <div style="background: var(--bg); padding: 10px 15px; border-radius: 6px; margin-bottom: 12px;">
          ${itemsHtml}
        </div>

        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; font-size: 1.05rem;">
          <span style="color: var(--muted);">Tổng tiền thanh toán:</span>
          <b style="color: var(--accent); font-size: 1.2rem;">${formatCurrency(o.total)}</b>
        </div>
      </div>
    `;
  }).join("");
});

// Chỉnh sửa ngày 24/10/2026
// ==========================================================================
// XỬ LÝ CHUYỂN ĐỔI FORM VÀ ĐĂNG KÝ / ĐĂNG NHẬP
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const linkToRegister = document.getElementById("link-to-register");
  const linkToLogin = document.getElementById("link-to-login");

  // Sự kiện chuyển sang form Đăng ký
  if (linkToRegister && formLogin && formRegister) {
    linkToRegister.addEventListener("click", function(e) {
      e.preventDefault();
      formLogin.classList.add("hidden");
      formRegister.classList.remove("hidden");
    });
  }

  // Sự kiện chuyển về form Đăng nhập
  if (linkToLogin && formLogin && formRegister) {
    linkToLogin.addEventListener("click", function(e) {
      e.preventDefault();
      formRegister.classList.add("hidden");
      formLogin.classList.remove("hidden");
    });
  }

  // Kiểm tra tham số trên URL (nếu bấm nút Đăng ký từ trang chủ)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("mode") === "register" && formLogin && formRegister) {
    formLogin.classList.add("hidden");
    formRegister.classList.remove("hidden");
  }

  // Xử lý logic Đăng ký tài khoản mới
  if (formRegister) {
    formRegister.addEventListener("submit", function(e) {
      e.preventDefault();

      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const phone = document.getElementById("reg-phone").value.trim();
      const password = document.getElementById("reg-password").value;

      let users = JSON.parse(localStorage.getItem("users")) || [];

      // Kiểm tra trùng lặp số điện thoại hoặc email
      const existing = users.find(u => u.phone === phone || u.email === email);
      if (existing) {
        alert("Số điện thoại hoặc Email này đã tồn tại trong hệ thống!");
        return;
      }

      // Tạo mã khách hàng mới tự động
      const newId = "KH" + String(users.filter(u => u.id).length + 1).padStart(2, "0");

      const newUser = {
        id: newId,
        name: name,
        email: email,
        phone: phone,
        password: password,
        address: "",
        registerDate: new Date().toISOString().split("T")[0],
        status: true
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      
      // Chuyển hướng về form đăng nhập
      formRegister.classList.add("hidden");
      formLogin.classList.remove("hidden");
      formRegister.reset();
    });
  }
});

// ==========================================================================
// XỬ LÝ TRANG THÔNG TIN CÁ NHÂN
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
  const profileForm = document.getElementById("profile-form");
  if (!profileForm) return;

  // 1. Kiểm tra phiên đăng nhập: Nếu chưa đăng nhập thì chuyển hướng về login.html
  //Để bật tính năng này hãy xóa note ở dưới
  /*const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null");
  if (!currentUser) {
    alert("Vui lòng đăng nhập để xem thông tin cá nhân!");
    window.location.href = "login.html";
    return;
  }*/

  // 2. Đổ dữ liệu hiện tại của người dùng lên các ô input của form
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const phoneInput = document.getElementById("profile-phone");
  const addressInput = document.getElementById("profile-address");
  const passwordInput = document.getElementById("profile-password");

  if (nameInput) nameInput.value = currentUser.name || "";
  if (emailInput) emailInput.value = currentUser.email || "";
  if (phoneInput) phoneInput.value = currentUser.phone || "";
  if (addressInput) addressInput.value = currentUser.address || "";

  // 3. Xử lý sự kiện khi người dùng bấm nút "Lưu thay đổi"
  profileForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const newName = nameInput ? nameInput.value.trim() : "";
    const newPhone = phoneInput ? phoneInput.value.trim() : "";
    const newAddress = addressInput ? addressInput.value.trim() : "";
    const newPassword = passwordInput ? passwordInput.value : "";

    // Cập nhật thông tin mới vào đối tượng currentUser
    currentUser.name = newName;
    currentUser.phone = newPhone;
    currentUser.address = newAddress;
    
    // Nếu có nhập mật khẩu mới thì cập nhật, ngược lại giữ nguyên mật khẩu cũ
    if (newPassword) {
      currentUser.password = newPassword;
    }

    // Cập nhật lại phiên làm việc trong sessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    if (localStorage.getItem("currentUser")) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    // Cập nhật đồng bộ vào mảng danh sách người dùng (users) trong localStorage
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    users = users.map(u => {
      if (u.id === currentUser.id || u.email === currentUser.email) {
        return currentUser;
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Cập nhật thông tin cá nhân thành công!");
    location.reload();
  });
});