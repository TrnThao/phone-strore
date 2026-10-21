// ==========================================================================
// assets/js/admin.js - TOÀN BỘ CHỨC NĂNG QUẢN TRỊ
// ==========================================================================

// --- TIỆN ÍCH DÙNG CHUNG ---
function formatMoney(num) {
  return Number(num || 0).toLocaleString("vi-VN") + " ₫";
}

// Chuyển tab và tự động render dữ liệu của tab đó
function showTab() {
  const id = location.hash.slice(1) || "dashboard";
  document.querySelectorAll(".tab").forEach(function (s) { s.hidden = s.id !== id; });
  document.querySelectorAll("#admin-menu a[href^='#']").forEach(function (a) {
    a.classList.toggle("on", a.getAttribute("href") === "#" + id);
  });

  // Tự động kích hoạt hàm render tương ứng khi chuyển tab
  if (id === "dashboard") renderDashboard();
  else if (id === "users") users_render();
  else if (id === "categories") categories_render();
  else if (id === "products") {
    updateCategoryDropdowns(); 
    products_render();}
  else if (id === "imports") imports_render();
  else if (id === "pricing") pricing_render();
  else if (id === "orders") orders_render();
  else if (id === "inventory") inventory_render();
}
window.addEventListener("hashchange", showTab);

// Mở hộp thoại (dialog HTML5)
document.addEventListener("click", function (e) {
  const b = e.target.closest("[data-open]");
  if (b) {
    const dlg = document.getElementById(b.dataset.open);
    if (dlg) dlg.showModal();
  }
});

// Đăng xuất
document.getElementById("btn-logout")?.addEventListener("click", function (e) {
  e.preventDefault();
  if (confirm("Bạn có muốn đăng xuất khỏi trang quản trị?")) {
    localStorage.removeItem("currentAdmin");
    location.href = "../../login.html";
  }
});

// ==========================================================================
// 1. TỔNG QUAN (DASHBOARD)
// ==========================================================================
function renderDashboard() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");

  // Đếm các con số tổng quan
  const statUsers = document.getElementById("stat-users");
  const statProducts = document.getElementById("stat-products");
  const statNewOrders = document.getElementById("stat-new-orders");
  const statRevenue = document.getElementById("stat-revenue");

  if (statUsers) statUsers.textContent = users.length;
  if (statProducts) statProducts.textContent = products.filter(p => p.status).length;
  if (statNewOrders) statNewOrders.textContent = orders.filter(o => o.status === "new").length;

  const totalRev = orders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  if (statRevenue) statRevenue.textContent = formatMoney(totalRev);

  // Đơn hàng gần đây
  const orderBody = document.getElementById("dashboard-orders-body");
  if (orderBody) {
    const statusMap = { new: "Mới đặt", processed: "Đã xử lý", delivered: "Đã giao", cancelled: "Đã hủy" };
    orderBody.innerHTML = orders.slice(-5).reverse().map(o => `
      <tr>
        <td><b>${o.id}</b></td>
        <td>${o.customerName}</td>
        <td>${o.date}</td>
        <td><b>${formatMoney(o.total)}</b></td>
        <td><span class="badge ${o.status}">${statusMap[o.status] || o.status}</span></td>
      </tr>
    `).join("") || "<tr><td colspan='5' class='muted' style='text-align:center;'>Chưa có đơn hàng nào</td></tr>";
  }

  // Cảnh báo hết hàng (tồn <= 5)
  const lowBody = document.getElementById("dashboard-low-body");
  if (lowBody) {
    const stockMap = calculateCurrentInventory();
    const lowProds = products.filter(p => (stockMap[p.id] || 0) <= 5);
    lowBody.innerHTML = lowProds.map(p => `
      <tr class="low">
        <td><b>${p.code}</b></td>
        <td>${p.name}</td>
        <td><b style="color:var(--danger)">${stockMap[p.id] || 0}</b></td>
      </tr>
    `).join("") || "<tr><td colspan='3' class='muted' style='text-align:center;'>Kho hàng đầy đủ</td></tr>";
  }
}

// ==========================================================================
// 2. QUẢN LÝ KHÁCH HÀNG (USERS)
// ==========================================================================
function users_render() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const keyword = (document.getElementById("users-search")?.value || "").trim().toLowerCase();
  const tbody = document.getElementById("users-body");
  if (!tbody) return;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(keyword) ||
    u.email.toLowerCase().includes(keyword) ||
    u.phone.includes(keyword)
  );

  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td><b>${u.id}</b></td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td>${u.registerDate || "---"}</td>
      <td><span class="badge ${u.status ? 'on' : 'locked'}">${u.status ? 'Hoạt động' : 'Đã khóa'}</span></td>
      <td class="actions">
        <button class="btn btn-sm btn-ghost" onclick="users_toggleStatus('${u.id}')">${u.status ? '🔒 Khóa' : '🔓 Mở'}</button>
        <button class="btn btn-sm btn-ghost" onclick="users_resetPassword('${u.id}')">🔑 Reset Pass</button>
      </td>
    </tr>
  `).join("") || "<tr><td colspan='7' class='muted' style='text-align:center;'>Không tìm thấy khách hàng nào</td></tr>";
}
document.getElementById("users-search")?.addEventListener("input", users_render);

function users_toggleStatus(id) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const u = users.find(x => x.id === id);
  if (u) {
    u.status = !u.status;
    localStorage.setItem("users", JSON.stringify(users));
    users_render();
  }
}

function users_resetPassword(id) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const u = users.find(x => x.id === id);
  if (u && confirm(`Reset mật khẩu cho "${u.name}" về mặc định "123"?`)) {
    u.password = "123";
    localStorage.setItem("users", JSON.stringify(users));
    alert("Đã reset mật khẩu thành công!");
  }
}

// ==========================================================================
// 3. QUẢN LÝ HÃNG SẢN XUẤT (CATEGORIES)
// ==========================================================================
let editingCatId = null;

function categories_render() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const tbody = document.getElementById("categories-body");
  if (!tbody) return;

  tbody.innerHTML = cats.map(c => {
    const count = prods.filter(p => p.catId === c.id).length;
    return `
      <tr>
        <td><b>${c.id}</b></td>
        <td><b>${c.name}</b></td>
        <td>${count} sản phẩm</td>
        <td><span class="badge ${c.status ? 'on' : 'off'}">${c.status ? 'Hiển thị' : 'Đang ẩn'}</span></td>
        <td class="actions">
          <button class="btn btn-sm btn-ghost" onclick="categories_edit('${c.id}')">✏️ Sửa</button>
          <button class="btn btn-sm btn-ghost" onclick="categories_toggleStatus('${c.id}')">${c.status ? '👁️ Ẩn' : '👁️ Hiện'}</button>
          <button class="btn btn-sm btn-danger" onclick="categories_delete('${c.id}')">🗑️ Xóa</button>
        </td>
      </tr>
    `;
  }).join("") || "<tr><td colspan='5' class='muted' style='text-align:center;'>Chưa có hãng nào</td></tr>";

  updateCategoryDropdowns();
}

function updateCategoryDropdowns() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]").filter(c => c.status);
  const selects = ["products-filter-cat", "p-cat", "pricing-filter-cat", "stock-cat", "report-cat"];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const currentVal = el.value;
    const isFilter = id !== "p-cat";
    let html = isFilter ? '<option value="">Tất cả hãng</option>' : '<option value="">-- Chọn hãng --</option>';
    html += cats.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    el.innerHTML = html;
    el.value = currentVal;
  });
}

function categories_edit(id) {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const c = cats.find(x => x.id === id);
  if (c) {
    editingCatId = id;
    document.getElementById("cat-name").value = c.name;
    document.getElementById("dlg-category").showModal();
  }
}

function categories_delete(id) {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  if (prods.some(p => p.catId === id)) {
    alert("Không thể xóa hãng này vì đang có sản phẩm thuộc hãng!");
    return;
  }
  if (confirm("Bạn có chắc chắn muốn xóa hãng này?")) {
    let cats = JSON.parse(localStorage.getItem("categories") || "[]");
    cats = cats.filter(x => x.id !== id);
    localStorage.setItem("categories", JSON.stringify(cats));
    categories_render();
  }
}

function categories_toggleStatus(id) {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const c = cats.find(x => x.id === id);
  if (c) {
    c.status = !c.status;
    localStorage.setItem("categories", JSON.stringify(cats));
    categories_render();
  }
}

document.querySelector("#dlg-category form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("cat-name").value.trim();
  if (!name) return;

  let cats = JSON.parse(localStorage.getItem("categories") || "[]");
  if (editingCatId) {
    const c = cats.find(x => x.id === editingCatId);
    if (c) c.name = name;
    editingCatId = null;
  } else {
    const newId = "CAT" + String(cats.length + 1).padStart(2, "0");
    cats.push({ id: newId, name: name, profitRate: 10, status: true });
  }
  localStorage.setItem("categories", JSON.stringify(cats));
  document.getElementById("dlg-category").close();
  this.reset();
  categories_render();
});

// ==========================================================================
// 4. QUẢN LÝ SẢN PHẨM (PRODUCTS)
// ==========================================================================
let editingProdId = null;
let currentProdImgBase64 = "";

function products_render() {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));

  const keyword = (document.getElementById("products-search")?.value || "").trim().toLowerCase();
  const filterCat = document.getElementById("products-filter-cat")?.value || "";
  const tbody = document.getElementById("products-body");
  if (!tbody) return;

  const filtered = prods.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword);
    const matchCat = filterCat === "" || p.catId === filterCat;
    return matchSearch && matchCat;
  });

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>${p.img ? `<img src="${p.img}" class="thumb" style="object-fit:cover;">` : `<div class="thumb" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;">Ảnh</div>`}</td>
      <td><b>${p.code}</b></td>
      <td><b>${p.name}</b></td>
      <td>${catMap[p.catId] || "Khác"}</td>
      <td><span class="badge ${p.status ? 'on' : 'off'}">${p.status ? 'Đang bán' : 'Đã ẩn'}</span></td>
      <td class="actions">
        <button class="btn btn-sm btn-ghost" onclick="products_edit('${p.id}')">✏️ Sửa</button>
        <button class="btn btn-sm btn-ghost" onclick="products_toggleStatus('${p.id}')">${p.status ? '👁️ Ẩn' : '👁️ Hiện'}</button>
        <button class="btn btn-sm btn-danger" onclick="products_delete('${p.id}')">🗑️ Xóa</button>
      </td>
    </tr>
  `).join("") || "<tr><td colspan='6' class='muted' style='text-align:center;'>Không có sản phẩm nào</td></tr>";
}
document.getElementById("products-search")?.addEventListener("input", products_render);
document.getElementById("products-filter-cat")?.addEventListener("change", products_render);

document.getElementById("p-img")?.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      currentProdImgBase64 = e.target.result;
      const preview = document.getElementById("p-preview");
      if (preview) {
        preview.style.backgroundImage = `url(${currentProdImgBase64})`;
        preview.style.backgroundSize = "cover";
      }
    };
    reader.readAsDataURL(file);
  }
});

document.querySelector('[data-open="dlg-product"]')?.addEventListener("click", function () {
  editingProdId = null;
  currentProdImgBase64 = "";
  
  updateCategoryDropdowns();

  const form = document.querySelector("#dlg-product form");
  if (form) form.reset();

  const preview = document.getElementById("p-preview");
  if (preview) {
    preview.style.backgroundImage = "none";
  }
});

function products_edit(id) {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const p = prods.find(x => x.id === id);
  if (p) {
    editingProdId = id;
    document.getElementById("p-cat").value = p.catId;
    document.getElementById("p-code").value = p.code;
    document.getElementById("p-name").value = p.name;
    document.getElementById("p-desc").value = p.desc || "";
    currentProdImgBase64 = p.img || "";

    const preview = document.getElementById("p-preview");
    if (preview) {
      preview.style.backgroundImage = p.img ? `url(${p.img})` : "none";
      preview.style.backgroundSize = "cover";
    }
    document.getElementById("dlg-product").showModal();
  }
}

function products_toggleStatus(id) {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const p = prods.find(x => x.id === id);
  if (p) {
    p.status = !p.status;
    localStorage.setItem("products", JSON.stringify(prods));
    products_render();
  }
}

function products_delete(id) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
    let prods = JSON.parse(localStorage.getItem("products") || "[]");
    prods = prods.filter(x => x.id !== id);
    localStorage.setItem("products", JSON.stringify(prods));
    products_render();
  }
}

document.querySelector("#dlg-product form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const catId = document.getElementById("p-cat").value;
  const code = document.getElementById("p-code").value.trim();
  const name = document.getElementById("p-name").value.trim();
  const desc = document.getElementById("p-desc").value.trim();

  let prods = JSON.parse(localStorage.getItem("products") || "[]");
  if (editingProdId) {
    const p = prods.find(x => x.id === editingProdId);
    if (p) {
      p.catId = catId;
      p.code = code;
      p.name = name;
      p.desc = desc;
      if (currentProdImgBase64) p.img = currentProdImgBase64;
    }
    editingProdId = null;
  } else {
    const newId = "SP" + String(prods.length + 1).padStart(2, "0");
    prods.push({
      id: newId,
      code: code,
      name: name,
      catId: catId,
      desc: desc,
      img: currentProdImgBase64,
      customProfitRate: null,
      status: true
    });
  }

  localStorage.setItem("products", JSON.stringify(prods));
  document.getElementById("dlg-product").close();
  this.reset();
  currentProdImgBase64 = "";
  document.getElementById("p-preview").style.backgroundImage = "none";
  products_render();
});

// ==========================================================================
// 5. QUẢN LÝ NHẬP HÀNG (IMPORTS)
// ==========================================================================
let editingImportId = null;

function imports_render() {
  const imports = JSON.parse(localStorage.getItem("imports") || "[]");
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const prodMap = Object.fromEntries(prods.map(p => [p.id, p.name]));

  const keyword = (document.getElementById("imports-search")?.value || "").trim().toLowerCase();
  const fromDate = document.getElementById("imports-from")?.value;

  const toInput = document.getElementById("imports-to");
  if (toInput && !toInput.value) {
    toInput.value = new Date().toISOString().split("T")[0];
  }
  const toDate = toInput?.value;

  const statusFilter = document.getElementById("imports-status")?.value;
  const tbody = document.getElementById("imports-body");
  if (!tbody) return;

  const filtered = imports.filter(imp => {
    const matchSearch = imp.id.toLowerCase().includes(keyword) ||
      imp.items.some(it => (prodMap[it.prodId] || "").toLowerCase().includes(keyword));
    const matchFrom = !fromDate || imp.date >= fromDate;
    const matchTo = !toDate || imp.date <= toDate;
    const matchStatus = !statusFilter || imp.status === statusFilter;
    return matchSearch && matchFrom && matchTo && matchStatus;
  });

  tbody.innerHTML = filtered.map(imp => {
    const totalAmount = imp.items.reduce((sum, it) => sum + (it.qty * it.importPrice), 0);
    const prodSummary = imp.items.map(it => `${prodMap[it.prodId] || "SP"} (x${it.qty})`).join(", ");

    return `
      <tr>
        <td><b>${imp.id}</b></td>
        <td>${imp.date}</td>
        <td><small>${prodSummary}</small></td>
        <td><b>${formatMoney(totalAmount)}</b></td>
        <td><span class="badge ${imp.status}">${imp.status === "done" ? "Đã hoàn thành" : "Nháp"}</span></td>
        <td class="actions">
          ${imp.status === "draft" ? `
            <button class="btn btn-sm btn-ghost" onclick="imports_edit('${imp.id}')">✏️ Sửa</button>
            <button class="btn btn-sm btn-ghost" style="color:var(--accent)" onclick="imports_complete('${imp.id}')">✔️ Hoàn thành</button>
          ` : `<small class="muted">Đã khóa cứng</small>`}
        </td>
      </tr>
    `;
  }).join("") || "<tr><td colspan='6' class='muted' style='text-align:center;'>Không có phiếu nhập nào</td></tr>";
}
["imports-search", "imports-from", "imports-to", "imports-status"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", imports_render);
  document.getElementById(id)?.addEventListener("change", imports_render);
});

function imports_addLine(prodId = "", qty = 1, price = 0) {
  const container = document.getElementById("import-lines");
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const line = document.createElement("div");
  line.className = "line";
  line.innerHTML = `
    <select class="line-prod" required>
      <option value="">-- Chọn sản phẩm --</option>
      ${prods.map(p => `<option value="${p.id}" ${p.id === prodId ? "selected" : ""}>${p.name}</option>`).join("")}
    </select>
    <input type="number" class="line-qty" min="1" value="${qty}" required placeholder="SL">
    <input type="number" class="line-price" min="0" step="10000" value="${price}" required placeholder="Giá nhập">
    <button type="button" class="btn btn-sm btn-danger line-remove" style="padding:0;display:flex;align-items:center;justify-content:center;">✕</button>
  `;
  line.querySelector(".line-remove").addEventListener("click", () => line.remove());
  container.appendChild(line);
}
document.getElementById("import-add-line")?.addEventListener("click", () => imports_addLine());

document.querySelector('[data-open="dlg-import"]')?.addEventListener("click", () => {
  editingImportId = null;
  const form = document.querySelector("#dlg-import form");
  if (form) form.reset();
  const container = document.getElementById("import-lines");
  if (container) container.innerHTML = "";
  document.getElementById("i-date").value = new Date().toISOString().split("T")[0];
  imports_addLine();
});

function imports_edit(id) {
  const imports = JSON.parse(localStorage.getItem("imports") || "[]");
  const imp = imports.find(x => x.id === id);
  if (!imp || imp.status === "done") return;

  editingImportId = id;
  document.getElementById("i-date").value = imp.date;
  const container = document.getElementById("import-lines");
  container.innerHTML = "";
  imp.items.forEach(it => imports_addLine(it.prodId, it.qty, it.importPrice));
  document.getElementById("dlg-import").showModal();
}

function imports_complete(id) {
  if (confirm("Khóa cứng phiếu nhập này và cộng tồn kho?")) {
    const imports = JSON.parse(localStorage.getItem("imports") || "[]");
    const imp = imports.find(x => x.id === id);
    if (imp) {
      imp.status = "done";
      localStorage.setItem("imports", JSON.stringify(imports));
      imports_render();
    }
  }
}

document.querySelector("#dlg-import form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const date = document.getElementById("i-date").value;
  const lines = document.querySelectorAll("#import-lines .line");
  const items = [];

  lines.forEach(l => {
    const prodId = l.querySelector(".line-prod").value;
    const qty = parseInt(l.querySelector(".line-qty").value) || 0;
    const importPrice = parseFloat(l.querySelector(".line-price").value) || 0;
    if (prodId && qty > 0) items.push({ prodId, qty, importPrice });
  });

  if (items.length === 0) {
    alert("Vui lòng chọn ít nhất 1 sản phẩm!");
    return;
  }

  let imports = JSON.parse(localStorage.getItem("imports") || "[]");
  if (editingImportId) {
    const imp = imports.find(x => x.id === editingImportId);
    if (imp) {
      imp.date = date;
      imp.items = items;
    }
    editingImportId = null;
  } else {
    const newId = "PN" + String(imports.length + 1).padStart(2, "0");
    imports.push({ id: newId, date: date, status: "draft", items: items });
  }

  localStorage.setItem("imports", JSON.stringify(imports));
  document.getElementById("dlg-import").close();
  this.reset();
  imports_render();
});

// ==========================================================================
// 6. QUẢN LÝ GIÁ BÁN & % LỢI NHUẬN (PRICING)
// ==========================================================================
function calculateCostPrices() {
  const imports = JSON.parse(localStorage.getItem("imports") || "[]").filter(i => i.status === "done");
  const costMap = {};
  imports.forEach(imp => {
    imp.items.forEach(it => {
      if (!costMap[it.prodId]) costMap[it.prodId] = { qty: 0, val: 0 };
      costMap[it.prodId].qty += it.qty;
      costMap[it.prodId].val += (it.qty * it.importPrice);
    });
  });
  const avgCost = {};
  for (const [prodId, data] of Object.entries(costMap)) {
    avgCost[prodId] = data.qty > 0 ? (data.val / data.qty) : 0;
  }
  return avgCost;
}

function pricing_render() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const costPrices = calculateCostPrices();

  // Bảng % của hãng
  const catTbody = document.getElementById("pricing-cat-body");
  if (catTbody) {
    catTbody.innerHTML = cats.map(c => `
      <tr>
        <td><b>${c.name}</b></td>
        <td>
          <input type="number" min="0" max="100" class="inline-input" value="${c.profitRate || 10}" 
            onchange="pricing_updateCatRate('${c.id}', this.value)"> %
        </td>
        <td><small class="muted">Áp dụng chung</small></td>
      </tr>
    `).join("");
  }

  // Bảng giá bán theo sản phẩm
  const prodTbody = document.getElementById("pricing-prod-body");
  const keyword = (document.getElementById("pricing-search")?.value || "").trim().toLowerCase();
  const filterCat = document.getElementById("pricing-filter-cat")?.value || "";
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]));

  if (prodTbody) {
    const filtered = prods.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword);
      const matchCat = !filterCat || p.catId === filterCat;
      return matchSearch && matchCat;
    });

    prodTbody.innerHTML = filtered.map(p => {
      const cat = catMap[p.catId] || { profitRate: 10, name: "Khác" };
      const appliedRate = (p.customProfitRate !== null && p.customProfitRate !== undefined && p.customProfitRate !== "") 
        ? Number(p.customProfitRate) 
        : Number(cat.profitRate || 10);
      const cost = costPrices[p.id] || 0;
      const retailPrice = cost * (1 + appliedRate / 100);

      return `
        <tr>
          <td><b>${p.code}</b></td>
          <td>${p.name}</td>
          <td>${cat.name}</td>
          <td><b>${formatMoney(cost)}</b></td>
          <td>
            <input type="number" min="0" max="100" class="inline-input" placeholder="${cat.profitRate}%"
              value="${p.customProfitRate !== null && p.customProfitRate !== undefined ? p.customProfitRate : ''}" 
              onchange="pricing_updateProdRate('${p.id}', this.value)"> %
          </td>
          <td><b style="color:var(--accent)">${appliedRate}%</b></td>
          <td><b style="color:#17693a;font-size:1rem;">${formatMoney(retailPrice)}</b></td>
          <td>
            ${p.customProfitRate !== null && p.customProfitRate !== undefined ? `
              <button class="btn btn-sm btn-ghost" onclick="pricing_clearProdRate('${p.id}')">Xóa % riêng</button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join("") || "<tr><td colspan='8' class='muted' style='text-align:center;'>Không có sản phẩm nào</td></tr>";
  }
}
document.getElementById("pricing-search")?.addEventListener("input", pricing_render);
document.getElementById("pricing-filter-cat")?.addEventListener("change", pricing_render);

function pricing_updateCatRate(catId, val) {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const c = cats.find(x => x.id === catId);
  if (c) {
    c.profitRate = parseFloat(val) || 0;
    localStorage.setItem("categories", JSON.stringify(cats));
    pricing_render();
  }
}

function pricing_updateProdRate(prodId, val) {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const p = prods.find(x => x.id === prodId);
  if (p) {
    p.customProfitRate = val === "" ? null : parseFloat(val);
    localStorage.setItem("products", JSON.stringify(prods));
    pricing_render();
  }
}

function pricing_clearProdRate(prodId) {
  pricing_updateProdRate(prodId, "");
}

// ==========================================================================
// 7. QUẢN LÝ ĐƠN HÀNG (ORDERS)
// ==========================================================================
let currentViewingOrderId = null;

function orders_render() {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const fromDate = document.getElementById("orders-from")?.value;

  const toInput = document.getElementById("orders-to");
  if (toInput && !toInput.value) {
    toInput.value = new Date().toISOString().split("T")[0];
  }
  const toDate = toInput?.value;

  const statusFilter = document.getElementById("orders-status")?.value;
  const tbody = document.getElementById("orders-body");
  if (!tbody) return;

  const filtered = orders.filter(o => {
    const matchFrom = !fromDate || o.date >= fromDate;
    const matchTo = !toDate || o.date <= toDate;
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchFrom && matchTo && matchStatus;
  });

  const statusMap = { new: "Mới đặt", processed: "Đã xử lý", delivered: "Đã giao", cancelled: "Đã hủy" };

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><b>${o.id}</b></td>
      <td>${o.customerName}</td>
      <td>${o.date}</td>
      <td><b>${formatMoney(o.total)}</b></td>
      <td><span class="badge ${o.status}">${statusMap[o.status] || o.status}</span></td>
      <td class="actions">
        <button class="btn btn-sm btn-ghost" onclick="orders_viewDetail('${o.id}')">🔍 Chi tiết</button>
      </td>
    </tr>
  `).join("") || "<tr><td colspan='6' class='muted' style='text-align:center;'>Không có đơn hàng nào phù hợp</td></tr>";
}
["orders-from", "orders-to", "orders-status"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", orders_render);
});

function orders_viewDetail(id) {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const o = orders.find(x => x.id === id);
  if (!o) return;

  currentViewingOrderId = id;
  document.getElementById("order-title").textContent = `Chi tiết đơn hàng #${o.id}`;
  document.getElementById("order-customer").textContent = `${o.customerName} (${o.customerPhone || "---"})`;
  document.getElementById("order-date").textContent = o.date;
  document.getElementById("order-receiver").textContent = o.receiverName || o.customerName;
  document.getElementById("order-payment").textContent = o.payment || "Tiền mặt (COD)";
  document.getElementById("order-address").textContent = o.address || "Tại cửa hàng";

  const itemsBody = document.getElementById("order-items");
  itemsBody.innerHTML = (o.items || []).map(it => `
    <tr>
      <td>${it.name}</td>
      <td>${formatMoney(it.price)}</td>
      <td>${it.qty}</td>
      <td><b>${formatMoney(it.price * it.qty)}</b></td>
    </tr>
  `).join("");

  const statusSelect = document.getElementById("order-status-select");
  statusSelect.innerHTML = `
    <option value="new" ${o.status === "new" ? "selected" : ""}>Mới đặt</option>
    <option value="processed" ${o.status === "processed" ? "selected" : ""}>Đã xử lý</option>
    <option value="delivered" ${o.status === "delivered" ? "selected" : ""}>Đã giao</option>
    <option value="cancelled" ${o.status === "cancelled" ? "selected" : ""}>Đã hủy</option>
  `;

  document.getElementById("dlg-order").showModal();
}

document.querySelector("#dlg-order form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const newStatus = document.getElementById("order-status-select").value;
  if (currentViewingOrderId) {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const o = orders.find(x => x.id === currentViewingOrderId);
    if (o) {
      o.status = newStatus;
      localStorage.setItem("orders", JSON.stringify(orders));
      orders_render();
      renderDashboard();
    }
  }
  document.getElementById("dlg-order").close();
});

// ==========================================================================
// 8. QUẢN LÝ TỒN KHO & BÁO CÁO X-N-T (INVENTORY)
// ==========================================================================
function calculateCurrentInventory(upToDate = null) {
  const imports = JSON.parse(localStorage.getItem("imports") || "[]").filter(i => i.status === "done");
  const orders = JSON.parse(localStorage.getItem("orders") || "[]").filter(o => o.status === "delivered");
  const stockMap = {};

  imports.forEach(imp => {
    if (!upToDate || imp.date <= upToDate) {
      imp.items.forEach(it => {
        stockMap[it.prodId] = (stockMap[it.prodId] || 0) + it.qty;
      });
    }
  });

  orders.forEach(o => {
    if (!upToDate || o.date <= upToDate) {
      o.items.forEach(it => {
        stockMap[it.prodId] = (stockMap[it.prodId] || 0) - it.qty;
      });
    }
  });

  return stockMap;
}

function inventory_render() {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const threshold = parseInt(document.getElementById("inventory-threshold")?.value) || 5;
  const currentStock = calculateCurrentInventory();
  const lowTbody = document.getElementById("inventory-low-body");

  if (lowTbody) {
    const lowList = prods.filter(p => (currentStock[p.id] || 0) <= threshold);
    lowTbody.innerHTML = lowList.map(p => `
      <tr class="low">
        <td><b>${p.code}</b></td>
        <td>${p.name}</td>
        <td><b style="color:var(--danger)">${currentStock[p.id] || 0}</b></td>
      </tr>
    `).join("") || "<tr><td colspan='3' class='muted' style='text-align:center;'>Không có sản phẩm dưới ngưỡng cảnh báo</td></tr>";
  }

  inventory_renderStockAtDate();
  inventory_renderReport();
}
document.getElementById("inventory-threshold")?.addEventListener("input", inventory_render);

function inventory_renderStockAtDate() {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));

  const keyword = (document.getElementById("stock-search")?.value || "").trim().toLowerCase();
  const catFilter = document.getElementById("stock-cat")?.value;
  const targetDate = dateInput?.value;

  const dateInput = document.getElementById("stock-date");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  const stockMap = calculateCurrentInventory(targetDate || null);
  const tbody = document.getElementById("inventory-stock-body");
  if (!tbody) return;

  const filtered = prods.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword);
    const matchCat = !catFilter || p.catId === catFilter;
    return matchSearch && matchCat;
  });

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><b>${p.code}</b></td>
      <td>${p.name}</td>
      <td>${catMap[p.catId] || "---"}</td>
      <td><b>${stockMap[p.id] || 0}</b></td>
    </tr>
  `).join("") || "<tr><td colspan='4' class='muted' style='text-align:center;'>Không tìm thấy sản phẩm</td></tr>";
}
["stock-search", "stock-cat", "stock-date"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", inventory_renderStockAtDate);
  document.getElementById(id)?.addEventListener("change", inventory_renderStockAtDate);
});

function inventory_renderReport() {
  const prods = JSON.parse(localStorage.getItem("products") || "[]");
  const keyword = (document.getElementById("report-search")?.value || "").trim().toLowerCase();
  const catFilter = document.getElementById("report-cat")?.value;
  const fromDate = document.getElementById("report-from")?.value;

  const toInput = document.getElementById("report-to");
  if (toInput && !toInput.value) {
    toInput.value = new Date().toISOString().split("T")[0];
  }
  const toDate = toInput?.value;

  const tbody = document.getElementById("inventory-report-body");
  if (!tbody) return;

  const imports = JSON.parse(localStorage.getItem("imports") || "[]").filter(i => i.status === "done");
  const orders = JSON.parse(localStorage.getItem("orders") || "[]").filter(o => o.status === "delivered");

  const filtered = prods.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword);
    const matchCat = !catFilter || p.catId === catFilter;
    return matchSearch && matchCat;
  });

  tbody.innerHTML = filtered.map(p => {
    let startStock = 0;
    if (fromDate) {
      imports.filter(i => i.date < fromDate).forEach(imp => {
        imp.items.filter(it => it.prodId === p.id).forEach(it => startStock += it.qty);
      });
      orders.filter(o => o.date < fromDate).forEach(ord => {
        ord.items.filter(it => it.prodId === p.id).forEach(it => startStock -= it.qty);
      });
    }

    let periodImport = 0;
    imports.filter(i => (!fromDate || i.date >= fromDate) && (!toDate || i.date <= toDate)).forEach(imp => {
      imp.items.filter(it => it.prodId === p.id).forEach(it => periodImport += it.qty);
    });

    let periodExport = 0;
    orders.filter(o => (!fromDate || o.date >= fromDate) && (!toDate || o.date <= toDate)).forEach(ord => {
      ord.items.filter(it => it.prodId === p.id).forEach(it => periodExport += it.qty);
    });

    const endStock = startStock + periodImport - periodExport;

    return `
      <tr>
        <td><b>${p.code}</b></td>
        <td>${p.name}</td>
        <td>${startStock}</td>
        <td style="color:#17693a">+${periodImport}</td>
        <td style="color:var(--danger)">-${periodExport}</td>
        <td><b>${endStock}</b></td>
      </tr>
    `;
  }).join("") || "<tr><td colspan='6' class='muted' style='text-align:center;'>Không có dữ liệu báo cáo</td></tr>";
}
["report-search", "report-cat", "report-from", "report-to"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", inventory_renderReport);
  document.getElementById(id)?.addEventListener("change", inventory_renderReport);
});

// ==========================================================================
// TỰ ĐỘNG CHẠY KHI MỞ TRANG
// ==========================================================================
updateCategoryDropdowns();
showTab();
renderDashboard();