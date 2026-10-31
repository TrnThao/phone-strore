
const SEED_DATA = {
  // 1. HÃNG SẢN XUẤT (Categories)
  categories: [
    { id: "CAT01", name: "Apple", profitRate: 15, status: true },
    { id: "CAT02", name: "Samsung", profitRate: 12, status: true },
    { id: "CAT03", name: "Xiaomi", profitRate: 10, status: true },
    { id: "CAT04", name: "OPPO", profitRate: 10, status: true },
    { id: "CAT05", name: "Vivo", profitRate: 8, status: true },
    { id: "CAT06", name: "Realme", profitRate: 8, status: false }
  ],

  // 2. SẢN PHẨM ĐIỆN THOẠI (Products)
  products: [
    {
      id: "SP01",
      code: "IP15PM",
      name: "iPhone 15 Pro Max 256GB",
      catId: "CAT01",
      img: ["assets/images/ip15prmm.png",
            "assets/images/ip15prm.jpg",
            "assets/images/ip15prmmm.jpg"
      ],
      desc: "Chip Apple A17 Pro mạnh mẽ, màn hình OLED 6.7 inch Super Retina XDR, vỏ hợp kim Titan chuẩn hàng không.",
      customProfitRate: null,
      status: true
    },
    {
      id: "SP02",
      code: "IP15",
      name: "iPhone 15 128GB",
      catId: "CAT01",
      img: ["assets/images/ip15.png",
            "assets/images/ip15-1.jpeg",
            "assets/images/ip15-2.jpeg"
      ],
      desc: "Màn hình Dynamic Island, camera chính 48MP sắc nét, chip A16 Bionic mượt mà, cổng kết nối Type-C.",
      customProfitRate: 14,
      status: true
    },
    {
      id: "SP03",
      code: "IP13",
      name: "iPhone 13 128GB",
      catId: "CAT01",
      img: ["assets/images/iphone13-1.jpg",
            "assets/images/iphone13.jpg",
            "assets/images/iphone13-2.jpg"
      ],
      desc: "Chip Apple A15 Bionic, thời lượng pin ấn tượng, camera kép chống rung cảm biến quang học hiện đại.",
      customProfitRate: null,
      status: true
    },
    {
      id: "SP04",
      code: "SS24U",
      name: "Samsung Galaxy S24 Ultra 5G",
      catId: "CAT02",
      img: ["assets/images/s24ultra.png",
            "assets/images/s24ultra-1.png",
            "assets/images/s24ultra-2.jpg"
      ],
      desc: "Trang bị Galaxy AI đột phá, chip Snapdragon 8 Gen 3 for Galaxy, camera 200MP zoom 100x và bút S-Pen tiện ích.",
      customProfitRate: null,
      status: true
    },
    {
      id: "SP05",
      code: "SSZF5",
      name: "Samsung Galaxy Z Fold5 5G",
      catId: "CAT02",
      img: ["assets/images/zfold5.jpg",
            "assets/images/zfold5-1.jpg",
            "assets/images/zfold5-2.jpg"
      ],
      desc: "Thiết kế màn hình gập không kẽ hở, đa nhiệm linh hoạt tối đa 3 ứng dụng, trang bị chuẩn kháng nước IPX8.",
      customProfitRate: 15,
      status: true
    },
    {
      id: "SP06",
      code: "SSA55",
      name: "Samsung Galaxy A55 5G",
      catId: "CAT02",
      img: ["assets/images/a55.png",
            "assets/images/a55-1.png",
            "assets/images/a55-2.png"
      ],
      desc: "Khung viền kim loại sang trọng, màn hình Super AMOLED 120Hz, viên pin dung lượng lớn 5000 mAh bền bỉ.",
      customProfitRate: null,
      status: true
    },
    {
      id: "SP07",
      code: "MI14",
      name: "Xiaomi 14 5G 512GB",
      catId: "CAT03",
      img: ["assets/images/xom14.png",
            "assets/images/xom14-1.png",
            "assets/images/xom14-2.png"
      ],
      desc: "Hệ thống ống kính Leica quang học thế hệ mới, vi xử lý Snapdragon 8 Gen 3, hỗ trợ sạc nhanh HyperCharge 90W.",
      customProfitRate: 12,
      status: true
    },
    {
      id: "SP08",
      code: "RN13P",
      name: "Xiaomi Redmi Note 13 Pro 4G",
      catId: "CAT03",
      img: ["assets/images/xomrdn13.png",
            "assets/images/xomrdn13-1.png",
            "assets/images/xomrdn13-2.png"
      ],
      desc: "Cảm biến camera siêu nét 200MP, màn hình tràn viền AMOLED 120Hz mượt mà, công nghệ sạc nhanh Turbo 67W.",
      customProfitRate: null,
      status: true
    },
    {
      id: "SP09",
      code: "OPF11",
      name: "OPPO Reno11 Pro 5G",
      catId: "CAT04",
      img: ["assets/images/opporeno11pr.png",
            "assets/images/opporeno11pr-1.png"
      ],
      desc: "Chuyên gia chụp ảnh chân dung chân thật, đường nét uốn cong 3D sang trọng, hỗ trợ sạc nhanh SuperVOOC 80W.",
      customProfitRate: null,
      status: true
    },
    {
      id: "SP10",
      code: "OPA79",
      name: "OPPO A79 5G",
      catId: "CAT04",
      img: ["assets/images/oppa79.png",
            "assets/images/oppoa79-1.png"
      ],
      desc: "Thiết kế lông vũ phát sáng độc đáo, loa kép âm lượng siêu lớn 300%, pin khủng 5000 mAh tích hợp sạc 33W.",
      customProfitRate: null,
      status: true
    },
    {
      id: "SP11",
      code: "VVV30",
      name: "Vivo V30e 5G",
      catId: "CAT05",
      img: ["assets/images/vvv30e.png",
            "assets/images/vvv30e-1.png"
      ],
      desc: "Vòng sáng Aura thế hệ mới tạo hiệu ứng chân dung studio, màn hình cong 3D 120Hz, thân máy siêu mỏng nhẹ.",
      customProfitRate: 10,
      status: true
    },
    {
      id: "SP12",
      code: "IP11",
      name: "iPhone 11 64GB (Cũ)",
      catId: "CAT01",
      img: "",
      desc: "Máy cũ qua sử dụng, ngừng kinh doanh mặt hàng mới.",
      customProfitRate: null,
      status: false
    }
  ],

  // 3. KHÁCH HÀNG (Users)
  users: [
    {
      name: "admin",
      password: "123"

    },
    {
      id: "KH01",
      name: "Nguyễn Văn An",
      email: "an.nguyen@gmail.com",
      phone: "0901234567",
      password: "123",
      address: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM",
      registerDate: "2026-01-10",
      status: true
    },
    {
      id: "KH02",
      name: "Trần Thị Bích",
      email: "bich.tran@gmail.com",
      phone: "0912345678",
      password: "123",
      address: "456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM",
      registerDate: "2026-01-28",
      status: true
    },
    {
      id: "KH03",
      name: "Lê Hoàng Long",
      email: "long.le@gmail.com",
      phone: "0987654321",
      password: "123",
      address: "789 Cách Mạng Tháng 8, Phường 6, Quận Tân Bình, TP.HCM",
      registerDate: "2026-02-14",
      status: false
    },
    {
      id: "KH04",
      name: "Phạm Minh Tuấn",
      email: "tuan.pham@gmail.com",
      phone: "0933445566",
      password: "123",
      address: "102 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM",
      registerDate: "2026-03-02",
      status: true
    },
    {
      id: "KH05",
      name: "Đặng Thu Thảo",
      email: "thao.dang@gmail.com",
      phone: "0977889900",
      password: "123",
      address: "220 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM",
      registerDate: "2026-03-20",
      status: true
    }
  ],

  // 4. PHIẾU NHẬP HÀNG (Imports)
  imports: [
    {
      id: "PN01",
      date: "2026-02-01",
      status: "done",
      items: [
        { prodId: "SP01", qty: 25, importPrice: 26000000 },
        { prodId: "SP02", qty: 20, importPrice: 17500000 },
        { prodId: "SP04", qty: 20, importPrice: 25000000 }
      ]
    },
    {
      id: "PN02",
      date: "2026-02-15",
      status: "done",
      items: [
        { prodId: "SP03", qty: 15, importPrice: 12000000 },
        { prodId: "SP06", qty: 30, importPrice: 8200000 },
        { prodId: "SP07", qty: 20, importPrice: 18500000 },
        { prodId: "SP08", qty: 40, importPrice: 5800000 }
      ]
    },
    {
      id: "PN03",
      date: "2026-03-05",
      status: "done",
      items: [
        { prodId: "SP05", qty: 10, importPrice: 31000000 },
        { prodId: "SP09", qty: 25, importPrice: 13500000 },
        { prodId: "SP10", qty: 30, importPrice: 6500000 },
        { prodId: "SP11", qty: 20, importPrice: 7800000 }
      ]
    },
    {
      id: "PN04",
      date: "2026-03-28",
      status: "draft",
      items: [
        { prodId: "SP01", qty: 10, importPrice: 26200000 },
        { prodId: "SP04", qty: 10, importPrice: 24800000 }
      ]
    }
  ],

  // 5. ĐƠN ĐẶT HÀNG (Orders)
  orders: [
    {
      id: "DH01",
      customerName: "Nguyễn Văn An",
      customerPhone: "0901234567",
      receiverName: "Nguyễn Văn An",
      address: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM",
      date: "2026-02-10",
      payment: "Tiền mặt (COD)",
      status: "delivered",
      items: [
        { prodId: "SP01", name: "iPhone 15 Pro Max 256GB", price: 29900000, qty: 1 }
      ],
      total: 29900000
    },
    {
      id: "DH02",
      customerName: "Trần Thị Bích",
      customerPhone: "0912345678",
      receiverName: "Trần Thị Bích",
      address: "456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM",
      date: "2026-02-25",
      payment: "Chuyển khoản",
      status: "delivered",
      items: [
        { prodId: "SP07", name: "Xiaomi 14 5G 512GB", price: 20720000, qty: 1 },
        { prodId: "SP08", name: "Xiaomi Redmi Note 13 Pro 4G", price: 6380000, qty: 2 }
      ],
      total: 33480000
    },
    {
      id: "DH03",
      customerName: "Phạm Minh Tuấn",
      customerPhone: "0933445566",
      receiverName: "Phạm Minh Tuấn",
      address: "102 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM",
      date: "2026-03-12",
      payment: "Tiền mặt (COD)",
      status: "delivered",
      items: [
        { prodId: "SP04", name: "Samsung Galaxy S24 Ultra 5G", price: 28000000, qty: 1 }
      ],
      total: 28000000
    },
    {
      id: "DH04",
      customerName: "Đặng Thu Thảo",
      customerPhone: "0977889900",
      receiverName: "Đặng Thu Thảo",
      address: "220 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM",
      date: "2026-03-22",
      payment: "Thanh toán trực tuyến",
      status: "processed",
      items: [
        { prodId: "SP09", name: "OPPO Reno11 Pro 5G", price: 14850000, qty: 1 }
      ],
      total: 14850000
    },
    {
      id: "DH05",
      customerName: "Nguyễn Văn An",
      customerPhone: "0901234567",
      receiverName: "Nguyễn Minh Khang (Nhận hộ)",
      address: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM",
      date: "2026-03-26",
      payment: "Tiền mặt (COD)",
      status: "new",
      items: [
        { prodId: "SP06", name: "Samsung Galaxy A55 5G", price: 9184000, qty: 2 }
      ],
      total: 18368000
    },
    {
      id: "DH06",
      customerName: "Trần Thị Bích",
      customerPhone: "0912345678",
      receiverName: "Trần Thị Bích",
      address: "456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM",
      date: "2026-03-27",
      payment: "Chuyển khoản",
      status: "cancelled", // Đơn đã hủy
      items: [
        { prodId: "SP02", name: "iPhone 15 128GB", price: 19950000, qty: 1 }
      ],
      total: 19950000
    }
  ]
};

// --- HÀM TỰ ĐỘNG NẠP VÀO LOCALSTORAGE NẾU CHƯA CÓ ---
function initDefaultData() {
  if (!localStorage.getItem("categories")) {
    localStorage.setItem("categories", JSON.stringify(SEED_DATA.categories));
  }
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(SEED_DATA.products));
  }
  const savedProducts = JSON.parse(localStorage.getItem("products") || "[]");
  const seedImages = Object.fromEntries(
    SEED_DATA.products
      .filter(product => product.img)
      .map(product => [product.id, product.img])
  );

  let imagesUpdated = false;

  savedProducts.forEach(product => {
    if (seedImages[product.id] && product.img !== seedImages[product.id]) {
      product.img = seedImages[product.id];
      imagesUpdated = true;
    }
  });

  if (imagesUpdated) {
    localStorage.setItem("products", JSON.stringify(savedProducts));
  }
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(SEED_DATA.users));
  }
  if (!localStorage.getItem("imports")) {
    localStorage.setItem("imports", JSON.stringify(SEED_DATA.imports));
  }
  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify(SEED_DATA.orders));
  }
}
initDefaultData();

// ==========================================================================
// CÁC HÀM TIỆN ÍCH DÙNG CHUNG PHÍA CLIENT (HEADER, FOOTER, GIỎ HÀNG)
// ==========================================================================

// Định dạng tiền tệ
function formatCurrency(num) {
  return Number(num || 0).toLocaleString("vi-VN") + " ₫";
}

// Lấy giỏ hàng từ localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("userCart") || "[]");
}

// Lưu giỏ hàng vào localStorage
function saveCart(cart) {
  localStorage.setItem("userCart", JSON.stringify(cart));
  updateCartBadge();
}

// Cập nhật số lượng sản phẩm trên icon giỏ hàng ở header
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  badge.textContent = totalQty;
}

// Kiểm tra phiên đăng nhập của khách hàng
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

// Render header dùng chung cho các trang khách hàng
function renderHeader() {
  const headerContainer = document.getElementById("site-header");
  if (!headerContainer) return;

  const currentUser = getCurrentUser();
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  headerContainer.innerHTML = `
    <header class="header">
      <div class="header-container">
        <a href="index.html" class="logo">📱 DiĐộng<span>Store</span></a>
        
        <nav class="main-nav">
          <a href="index.html">Trang chủ</a>
          <a href="products.html">Sản phẩm</a>
        </nav>

        <div class="header-actions">
          <a href="cart.html" class="cart-btn">
            🛒 Giỏ hàng (<span id="cart-count">${totalQty}</span>)
          </a>

          ${currentUser ? `
            <div class="user-menu">
              <span>👋 Chào, <b>${currentUser.name}</b></span>
              <a href="profile.html">Tài khoản</a>
              <a href="order-history.html">Lịch sử đơn</a>
              <button id="btn-user-logout" class="btn-logout-client">Đăng xuất</button>
            </div>
          ` : `
            <div class="auth-links">
              <a href="login.html" class="btn-login">Đăng nhập</a>
            </div>
          `}
        </div>
      </div>
    </header>
  `;

  // Xử lý sự kiện đăng xuất khách hàng
  document.getElementById("btn-user-logout")?.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    location.reload();
  });
}

// Tự động render Header khi tài liệu được tải xong 
document.addEventListener("DOMContentLoaded", function () {
  renderHeader();
  updateCartBadge();
});