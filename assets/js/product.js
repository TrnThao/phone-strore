// Hiển thị, tìm kiếm, phân trang sản phẩm
// ==========================================================================
// assets/js/product.js - XỬ LÝ HIỂN THỊ, TÌM KIẾM VÀ PHÂN TRANG SẢN PHẨM
// ==========================================================================

let currentPage = 1;
const itemsPerPage = 6; // Số sản phẩm trên mỗi trang

// Tính giá bán thực tế của sản phẩm dựa trên giá vốn từ phiếu nhập (done) và % lợi nhuận hãng/sản phẩm
function calculateProductPrices() {
  const imports = JSON.parse(localStorage.getItem("imports") || "[]").filter(i => i.status === "done");
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  
  const catRateMap = Object.fromEntries(categories.map(c => [c.id, c.profitRate || 10]));

  // Tính giá vốn trung bình
  const costMap = {};
  imports.forEach(imp => {
    imp.items.forEach(it => {
      if (!costMap[it.prodId]) costMap[it.prodId] = { qty: 0, val: 0 };
      costMap[it.prodId].qty += it.qty;
      costMap[it.prodId].val += (it.qty * it.importPrice);
    });
  });

  const productPrices = {};
  products.forEach(p => {
    const costData = costMap[p.id];
    const cost = costData && costData.qty > 0 ? (costData.val / costData.qty) : 5000000; // Giá mặc định nếu chưa nhập kho
    
    const rate = (p.customProfitRate !== null && p.customProfitRate !== undefined && p.customProfitRate !== "")
      ? Number(p.customProfitRate)
      : Number(catRateMap[p.catId] || 10);

    const retailPrice = cost * (1 + rate / 100);
    productPrices[p.id] = Math.round(retailPrice);
  });

  return productPrices;
}

// Khởi tạo danh mục hãng vào dropdown tìm kiếm nâng cao
function initCategoryFilter() {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]").filter(c => c.status);
  const select = document.getElementById("filter-cat");
  if (!select) return;

  select.innerHTML = '<option value="">Tất cả hãng</option>' + 
    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

// Render danh sách sản phẩm theo trang và bộ lọc tìm kiếm
function renderProducts() {
  const products = JSON.parse(localStorage.getItem("products") || "[]").filter(p => p.status); // Chỉ hiển thị SP đang bán
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const prices = calculateProductPrices();

  // Lấy giá trị từ bộ lọc tìm kiếm
  const keyword = (document.getElementById("search-name")?.value || "").trim().toLowerCase();
  const catId = document.getElementById("filter-cat")?.value || "";
  const priceFrom = parseFloat(document.getElementById("price-from")?.value) || 0;
  const priceTo = parseFloat(document.getElementById("price-to")?.value) || Infinity;

  // Lọc danh sách (Tìm kiếm cơ bản + nâng cao kết hợp)
  const filtered = products.filter(p => {
    const price = prices[p.id] || 0;
    const matchName = p.name.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword);
    const matchCat = !catId || p.catId === catId;
    const matchPrice = price >= priceFrom && price <= priceTo;
    return matchName && matchCat && matchPrice;
  });

  // Phân trang
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(start, start + itemsPerPage);

  // Hiển thị ra lưới sản phẩm
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  if (paginatedItems.length === 0) {
    grid.innerHTML = `<p class="muted" style="grid-column: 1 / -1; text-align:center; padding: 30px;">Không tìm thấy sản phẩm nào phù hợp.</p>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  grid.innerHTML = paginatedItems.map(p => {
    const price = prices[p.id] || 0;
    return `
      <div class="product-card" style="background:#fff; border:1px solid var(--line); border-radius:8px; padding:15px; display:flex; flex-direction:column; justify-content:space-between; transition: box-shadow 0.2s;">
        <div>
          <div class="product-img" style="width:100%; height:160px; background:#eef0f4; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; overflow:hidden;">
            ${p.img ? `<img src="${p.img}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="color:var(--muted); font-size:0.9rem;">📱 ${p.code}</span>`}
          </div>
          <span style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:700;">${catMap[p.catId] || "Điện thoại"}</span>
          <h3 style="font-size:1rem; margin:4px 0 8px 0; color:var(--text); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; height:2.8em;">${p.name}</h3>
          <div style="color:var(--accent); font-weight:700; font-size:1.05rem; margin-bottom:12px;">${formatCurrency(price)}</div>
        </div>
        <div style="display:flex; gap:8px;">
          <a href="product-detail.html?id=${p.id}" class="btn" style="flex:1; text-align:center; background:transparent; border:1px solid var(--line); color:var(--text); padding:6px; border-radius:6px; text-decoration:none; font-size:0.85rem; font-weight:600;">Chi tiết</a>
          <button onclick="quickAddToCart('${p.id}')" class="btn" style="background:var(--accent); color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem;">🛒 Mua</button>
        </div>
      </div>
    `;
  }).join("");

  // Render các nút phân trang
  renderPagination(totalPages);
}

// Render phân trang
function renderPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button onclick="changePage(${i})" style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${i === currentPage ? 'var(--accent)' : 'var(--line)'}; background: ${i === currentPage ? 'var(--accent)' : '#fff'}; color: ${i === currentPage ? '#fff' : 'var(--text)'}; cursor: pointer; font-weight: 600;">
        ${i}
      </button>
    `;
  }
  paginationContainer.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  renderProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Thêm sản phẩm nhanh vào giỏ hàng từ trang danh sách
function quickAddToCart(prodId) {
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const p = products.find(x => x.id === prodId);
  if (!p) return;

  const prices = calculateProductPrices();
  const price = prices[prodId] || 0;

  let cart = getCart();
  const existing = cart.find(item => item.id === prodId);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({
      id: p.id,
      code: p.code,
      name: p.name,
      price: price,
      img: p.img || "",
      qty: 1
    });
  }

  saveCart(cart);
  alert(`Đã thêm sản phẩm "${p.name}" vào giỏ hàng!`);
}

// Gắn sự kiện tìm kiếm
document.getElementById("btn-search")?.addEventListener("click", function() {
  currentPage = 1;
  renderProducts();
});

document.getElementById("search-name")?.addEventListener("input", function() {
  currentPage = 1;
  renderProducts();
});

document.getElementById("filter-cat")?.addEventListener("change", function() {
  currentPage = 1;
  renderProducts();
});

document.getElementById("btn-reset")?.addEventListener("click", function() {
  document.getElementById("search-name").value = "";
  document.getElementById("filter-cat").value = "";
  document.getElementById("price-from").value = "";
  document.getElementById("price-to").value = "";
  currentPage = 1;
  renderProducts();
});

// Chạy khởi tạo khi tải xong trang
document.addEventListener("DOMContentLoaded", function() {
  initCategoryFilter();
  renderProducts();
});

// Chỉnh sửa 23/10/2026
// ==========================================================================
//                        XỬ LÝ CHI TIẾT SẢN PHẨM
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const prodId = urlParams.get("id");
  
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  if (!prodId) {
    container.innerHTML = `
      <p style="text-align:center; color:var(--danger);">Không tìm thấy mã sản phẩm yêu cầu!</p>
      <p style="text-align:center; margin-top:15px;">
        <a href="products.html" class="btn" style="background:var(--accent); color:#fff; padding:8px 16px; border-radius:6px; text-decoration:none;">Quay lại danh sách sản phẩm</a>
      </p>`;
    return;
  }

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  
  // Gọi hàm calculateProductPrices từ product.js để tính giá bán thực tế chính xác
  const prices = typeof calculateProductPrices === "function" ? calculateProductPrices() : {};

  const p = products.find(x => x.id === prodId);
  if (!p) {
    container.innerHTML = `
      <p style="text-align:center; color:var(--danger);">Sản phẩm không tồn tại hoặc đã bị xóa!</p>
      <p style="text-align:center; margin-top:15px;">
        <a href="products.html" class="btn" style="background:var(--accent); color:#fff; padding:8px 16px; border-radius:6px; text-decoration:none;">Quay lại danh sách sản phẩm</a>
      </p>`;
    return;
  }

  const price = prices[p.id] || 0;
  const catName = catMap[p.catId] || "Điện thoại";

  container.innerHTML = `
    <div style="display: flex; gap: 30px; flex-wrap: wrap;">
      <!-- Hình ảnh sản phẩm -->
      <div style="flex: 1; min-width: 280px; max-width: 400px; background: #eef0f4; border-radius: 8px; height: 350px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        ${p.img ? `<img src="${p.img}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="color:var(--muted); font-size:1.2rem;">📱 ${p.code}</span>`}
      </div>

      <!-- Thông tin cấu hình & Mua hàng -->
      <div style="flex: 2; min-width: 300px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; font-weight:700;">Hãng: ${catName} | Mã: ${p.code}</span>
          <h2 style="font-size:1.6rem; margin: 8px 0 12px 0; color:var(--text);">${p.name}</h2>
          <div style="font-size:1.5rem; font-weight:700; color:var(--accent); margin-bottom: 20px;">${formatCurrency(price)}</div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="font-size:1rem; margin-bottom: 6px; color:var(--text);">Mô tả cấu hình & chi tiết:</h4>
            <p style="color:var(--muted); line-height: 1.6; background:var(--bg); padding: 12px; border-radius: 6px; border:1px solid var(--line);">${p.desc || "Đang cập nhật thông tin cấu hình chi tiết cho sản phẩm này."}</p>
          </div>
        </div>

        <!-- Chọn số lượng & Nút thêm vào giỏ hàng -->
        <div style="display: flex; gap: 15px; align-items: center; border-top: 1px solid var(--line); padding-top: 20px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-weight:600; font-size:0.9rem;">Số lượng:</label>
            <input type="number" id="detail-qty" value="1" min="1" max="99" style="width: 70px; text-align: center;" class="form-control">
          </div>
          <button onclick="addToCartDetail('${p.id}')" class="btn" style="background: var(--accent); color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 1rem;">
            🛒 Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  `;
});

// Hàm xử lý thêm vào giỏ hàng từ trang chi tiết
function addToCartDetail(prodId) {
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const p = products.find(x => x.id === prodId);
  if (!p) return;

  const qtyInput = document.getElementById("detail-qty");
  const qty = parseInt(qtyInput?.value) || 1;

  const prices = typeof calculateProductPrices === "function" ? calculateProductPrices() : {};
  const price = prices[prodId] || 0;

  let cart = getCart();
  const existing = cart.find(item => item.id === prodId);
  if (existing) {
    existing.qty = (existing.qty || 1) + qty;
  } else {
    cart.push({
      id: p.id,
      code: p.code,
      name: p.name,
      price: price,
      img: p.img || "",
      qty: qty
    });
  }

  saveCart(cart);
  alert(`Đã thêm thành công ${qty} sản phẩm "${p.name}" vào giỏ hàng!`);
}