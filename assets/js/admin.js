function formatMoney(num) {
  num = Number(num || 0);
  return num.toLocaleString("vi-VN") + " ₫";
}

function showTab() {
  var hash = location.hash;
  var id = hash ? hash.substring(1) : "dashboard";

  var tabs = document.getElementsByClassName("tab");
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].id === id) {
      tabs[i].style.display = "block";
    } else {
      tabs[i].style.display = "none";
    }
  }

  var menu = document.getElementById("admin-menu");
  if (menu) {
    var links = menu.getElementsByTagName("a");
    for (var j = 0; j < links.length; j++) {
      var a = links[j];
      var href = a.getAttribute("href");
      if (href && href.indexOf("#") === 0) {
        if (href === "#" + id) {
          a.className = "on";
        } else {
          a.className = "";
        }
      }
    }
  }

  try {
    if (id === "dashboard") {
      renderDashboard();
    } else if (id === "users") {
      users_render();
    } else if (id === "categories") {
      categories_render();
    } else if (id === "products") {
      updateCategoryDropdowns();
      products_render();
    } else if (id === "imports") {
      imports_render();
    } else if (id === "pricing") {
      pricing_render();
    } else if (id === "orders") {
      orders_render();
    } else if (id === "inventory") {
      inventory_render();
    }
  } catch (err) {
    console.error("Lỗi khi nạp dữ liệu tab " + id + ":", err);
  }
}
window.onhashchange = showTab;
showTab();


// Xử lý nút mở Modal
var openButtons = document.querySelectorAll("[data-open]");
for (var i = 0; i < openButtons.length; i++) {
  openButtons[i].onclick = function () {
    var dialogId = this.getAttribute("data-open");
    var dlg = document.getElementById(dialogId);
    if (dlg) {
      dlg.showModal();
    }
  };
}

var btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.onclick = function (e) {
    e.preventDefault();
    if (confirm("Bạn có muốn đăng xuất khỏi trang quản trị?")) {
      localStorage.removeItem("currentAdmin");
      location.href = "login-admin.html";
    }
  };
}

// ==========================================================================
// 1. TỔNG QUAN (DASHBOARD)
// ==========================================================================
function renderDashboard() {
  var users = JSON.parse(localStorage.getItem("users") || "[]");
  var products = JSON.parse(localStorage.getItem("products") || "[]");
  var orders = JSON.parse(localStorage.getItem("orders") || "[]");

  var statUsers = document.getElementById("stat-users");
  var statProducts = document.getElementById("stat-products");
  var statNewOrders = document.getElementById("stat-new-orders");
  var statRevenue = document.getElementById("stat-revenue");

  if (statUsers) statUsers.innerHTML = users.length;

  var activeProdCount = 0;
  for (var i = 0; i < products.length; i++) {
    if (products[i].status) activeProdCount++;
  }
  if (statProducts) statProducts.innerHTML = activeProdCount;

  var newOrderCount = 0;
  var totalRev = 0;
  for (var j = 0; j < orders.length; j++) {
    if (orders[j].status === "new") newOrderCount++;
    if (orders[j].status === "delivered") totalRev += (orders[j].total || 0);
  }
  if (statNewOrders) statNewOrders.innerHTML = newOrderCount;
  if (statRevenue) statRevenue.innerHTML = formatMoney(totalRev);

  // Bảng đơn hàng gần đây
  var orderBody = document.getElementById("dashboard-orders-body");
  if (orderBody) {
    var statusMap = { new: "Mới đặt", processed: "Đã xử lý", delivered: "Đã giao", cancelled: "Đã hủy" };
    var htmlOrders = "";
    var count = 0;
    for (var k = orders.length - 1; k >= 0; k--) {
      if (count >= 5) break;

      var o = orders[k];
      htmlOrders += "<tr>" +
        "<td><b>" + o.id + "</b></td>" +
        "<td>" + o.customerName + "</td>" +
        "<td>" + o.date + "</td>" +
        "<td><b>" + formatMoney(o.total) + "</b></td>" +
        "<td><span class=\"badge " + o.status + "\">" + (statusMap[o.status] || o.status) + "</span></td>" +
        "</tr>";
      count++;
    }
    orderBody.innerHTML = htmlOrders || "<tr><td colspan=\"5\" class=\"muted\" style=\"text-align:center;\">Chưa có đơn hàng nào</td></tr>";
  }

  // Bảng cảnh báo hết hàng
  var lowBody = document.getElementById("dashboard-low-body");
  if (lowBody) {
    var stockMap = calculateCurrentInventory();
    var htmlLow = "";
    for (var pIdx = 0; pIdx < products.length; pIdx++) {
      var p = products[pIdx];
      var qty = stockMap[p.id] || 0;
      if (qty <= 5) {
        htmlLow += "<tr class=\"low\">" +
          "<td><b>" + p.code + "</b></td>" +
          "<td>" + p.name + "</td>" +
          "<td><b style=\"color:red\">" + qty + "</b></td>" +
          "</tr>";
      }
    }
    lowBody.innerHTML = htmlLow || "<tr><td colspan=\"3\" class=\"muted\" style=\"text-align:center;\">Kho hàng đầy đủ</td></tr>";
  }
}

// ==========================================================================
// 2. QUẢN LÝ KHÁCH HÀNG (USERS)
// ==========================================================================
function users_render() {
  var users = JSON.parse(localStorage.getItem("users") || "[]");
  var inputSearch = document.getElementById("users-search");
  var keyword = inputSearch ? inputSearch.value.trim().toLowerCase() : "";
  var tbody = document.getElementById("users-body");
  if (!tbody) return;

  var html = "";
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var matchName = u.name.toLowerCase().indexOf(keyword) !== -1;
    var matchEmail = u.email.toLowerCase().indexOf(keyword) !== -1;
    var matchPhone = u.phone.indexOf(keyword) !== -1;

    if (matchName || matchEmail || matchPhone) {
      html += "<tr>" +
        "<td><b>" + u.id + "</b></td>" +
        "<td>" + u.name + "</td>" +
        "<td>" + u.email + "</td>" +
        "<td>" + u.phone + "</td>" +
        "<td>" + (u.registerDate || "---") + "</td>" +
        "<td><span class=\"badge " + (u.status ? "on" : "locked") + "\">" + (u.status ? "Hoạt động" : "Đã khóa") + "</span></td>" +
        "<td class=\"actions\">" +
        "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"users_toggleStatus('" + u.id + "')\">" + (u.status ? "Khóa" : "Mở") + "</button> " +
        "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"users_resetPassword('" + u.id + "')\">Reset Pass</button>" +
        "</td>" +
        "</tr>";
    }
  }
  tbody.innerHTML = html || "<tr><td colspan=\"7\" class=\"muted\" style=\"text-align:center;\">Không tìm thấy khách hàng nào</td></tr>";
}

var uSearch = document.getElementById("users-search");
if (uSearch) uSearch.oninput = users_render;

function users_toggleStatus(id) {
  var users = JSON.parse(localStorage.getItem("users") || "[]");
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      users[i].status = !users[i].status;
      break;
    }
  }
  localStorage.setItem("users", JSON.stringify(users));
  users_render();
}

function users_resetPassword(id) {
  var users = JSON.parse(localStorage.getItem("users") || "[]");
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      if (confirm("Reset mật khẩu cho \"" + users[i].name + "\" về mặc định \"123\"?")) {
        users[i].password = "123";
        localStorage.setItem("users", JSON.stringify(users));
        alert("Đã reset mật khẩu thành công!");
      }
      break;
    }
  }
}

// ==========================================================================
// 3. QUẢN LÝ HÃNG SẢN XUẤT (CATEGORIES)
// ==========================================================================
var editingCatId = null;

function categories_render() {
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  var tbody = document.getElementById("categories-body");
  if (!tbody) return;

  var html = "";
  for (var i = 0; i < cats.length; i++) {
    var c = cats[i];
    var count = 0;
    for (var j = 0; j < prods.length; j++) {
      if (prods[j].catId === c.id) count++;
    }

    html += "<tr>" +
      "<td><b>" + c.id + "</b></td>" +
      "<td><b>" + c.name + "</b></td>" +
      "<td>" + count + " sản phẩm</td>" +
      "<td><span class=\"badge " + (c.status ? "on" : "off") + "\">" + (c.status ? "Hiển thị" : "Đang ẩn") + "</span></td>" +
      "<td class=\"actions\">" +
      "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"categories_edit('" + c.id + "')\">Sửa</button> " +
      "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"categories_toggleStatus('" + c.id + "')\">" + (c.status ? "Ẩn" : "Hiện") + "</button> " +
      "<button type=\"button\" class=\"btn btn-sm btn-danger\" onclick=\"categories_delete('" + c.id + "')\">Xóa</button>" +
      "</td>" +
      "</tr>";
  }
  tbody.innerHTML = html || "<tr><td colspan=\"5\" class=\"muted\" style=\"text-align:center;\">Chưa có hãng nào</td></tr>";
  updateCategoryDropdowns();
}

function updateCategoryDropdowns() {
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  var selects = ["products-filter-cat", "p-cat", "pricing-filter-cat", "stock-cat", "report-cat"];

  for (var s = 0; s < selects.length; s++) {
    var el = document.getElementById(selects[s]);
    if (!el) continue;
    var currentVal = el.value;
    var isFilter = selects[s] !== "p-cat";
    var html = isFilter ? "<option value=\"\">Tất cả hãng</option>" : "<option value=\"\">-- Chọn hãng --</option>";

    for (var i = 0; i < cats.length; i++) {
      if (cats[i].status) {
        html += "<option value=\"" + cats[i].id + "\">" + cats[i].name + "</option>";
      }
    }
    el.innerHTML = html;
    el.value = currentVal;
  }
}

function categories_edit(id) {
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  for (var i = 0; i < cats.length; i++) {
    if (cats[i].id === id) {
      editingCatId = id;
      document.getElementById("cat-name").value = cats[i].name;
      document.getElementById("dlg-category").showModal();
      break;
    }
  }
}

function categories_delete(id) {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  for (var i = 0; i < prods.length; i++) {
    if (prods[i].catId === id) {
      alert("Không thể xóa hãng này vì đang có sản phẩm thuộc hãng!");
      return;
    }
  }

  if (confirm("Bạn có chắc chắn muốn xóa hãng này?")) {
    var cats = JSON.parse(localStorage.getItem("categories") || "[]");
    var newCats = [];
    for (var j = 0; j < cats.length; j++) {
      if (cats[j].id !== id) newCats.push(cats[j]);
    }
    localStorage.setItem("categories", JSON.stringify(newCats));
    categories_render();
  }
}

function categories_toggleStatus(id) {
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  for (var i = 0; i < cats.length; i++) {
    if (cats[i].id === id) {
      cats[i].status = !cats[i].status;
      break;
    }
  }
  localStorage.setItem("categories", JSON.stringify(cats));
  categories_render();
}

var formCat = document.querySelector("#dlg-category form");
if (formCat) {
  formCat.onsubmit = function (e) {
    e.preventDefault();
    var name = document.getElementById("cat-name").value.trim();
    if (!name) return;

    var cats = JSON.parse(localStorage.getItem("categories") || "[]");
    if (editingCatId) {
      for (var i = 0; i < cats.length; i++) {
        if (cats[i].id === editingCatId) {
          cats[i].name = name;
          break;
        }
      }
      editingCatId = null;
    } else {
      var newNum = cats.length + 1;
      var newId = "CAT" + (newNum < 10 ? "0" + newNum : newNum);
      cats.push({ id: newId, name: name, profitRate: 10, status: true });
    }
    localStorage.setItem("categories", JSON.stringify(cats));
    document.getElementById("dlg-category").close();
    formCat.reset();
    categories_render();
  };
}

// ==========================================================================
// 4. QUẢN LÝ SẢN PHẨM (PRODUCTS)
// ==========================================================================
var editingProdId = null;
var currentProdImgArray = [];

function getAdminImgSrc(rawSrc) {
  if (!rawSrc) return "";
  if (rawSrc.indexOf("data:") !== 0 && rawSrc.indexOf("http") !== 0 && rawSrc.indexOf("../") !== 0) {
    return "../" + rawSrc;
  }
  return rawSrc;
}

function products_render() {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  var catMap = {};
  for (var c = 0; c < cats.length; c++) {
    catMap[cats[c].id] = cats[c].name;
  }

  var searchInput = document.getElementById("products-search");
  var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
  var filterCatInput = document.getElementById("products-filter-cat");
  var filterCat = filterCatInput ? filterCatInput.value : "";
  var tbody = document.getElementById("products-body");
  if (!tbody) return;

  var html = "";
  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    var matchSearch = p.name.toLowerCase().indexOf(keyword) !== -1 || p.code.toLowerCase().indexOf(keyword) !== -1;
    var matchCat = (filterCat === "") || (p.catId === filterCat);

    if (matchSearch && matchCat) {
      var firstImg = (p.img && p.img.length) ? (Array.isArray(p.img) ? p.img[0] : p.img) : "";
      var imgSrc = getAdminImgSrc(firstImg);

      var imgHtml = imgSrc 
        ? "<img src=\"" + imgSrc + "\" class=\"thumb\" style=\"object-fit:cover;\">" 
        : "<div class=\"thumb\" style=\"display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;\">Không ảnh</div>";

      html += "<tr>" +
        "<td>" + imgHtml + "</td>" +
        "<td><b>" + p.code + "</b></td>" +
        "<td><b>" + p.name + "</b></td>" +
        "<td>" + (catMap[p.catId] || "Khác") + "</td>" +
        "<td><span class=\"badge " + (p.status ? "on" : "off") + "\">" + (p.status ? "Đang bán" : "Đã ẩn") + "</span></td>" +
        "<td class=\"actions\">" +
        "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"products_edit('" + p.id + "')\">Sửa</button> " +
        "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"products_toggleStatus('" + p.id + "')\">" + (p.status ? "Ẩn" : "Hiện") + "</button> " +
        "<button type=\"button\" class=\"btn btn-sm btn-danger\" onclick=\"products_delete('" + p.id + "')\">Xóa</button>" +
        "</td>" +
        "</tr>";
    }
  }
  tbody.innerHTML = html || "<tr><td colspan=\"6\" class=\"muted\" style=\"text-align:center;\">Không có sản phẩm nào</td></tr>";
}

var pSearch = document.getElementById("products-search");
if (pSearch) pSearch.oninput = products_render;
var pFilterCat = document.getElementById("products-filter-cat");
if (pFilterCat) pFilterCat.onchange = products_render;

// Chọn ảnh từ máy tính
var pImgInput = document.getElementById("p-img");
if (pImgInput) {
  pImgInput.onchange = function () {
    currentProdImgArray = [];
    var files = this.files;
    if (files && files.length > 0) {
      for (var f = 0; f < files.length; f++) {
        currentProdImgArray.push("assets/images/" + files[f].name);
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        var preview = document.getElementById("p-preview");
        if (preview) {
          preview.style.backgroundImage = "url(\"" + e.target.result + "\")";
          preview.style.backgroundSize = "cover";
          preview.style.backgroundPosition = "center";
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };
}

var btnOpenProd = document.querySelector('[data-open="dlg-product"]');
if (btnOpenProd) {
  btnOpenProd.onclick = function () {
    editingProdId = null;
    currentProdImgArray = [];
    updateCategoryDropdowns();

    var form = document.querySelector("#dlg-product form");
    if (form) form.reset();
    var preview = document.getElementById("p-preview");
    if (preview) preview.style.backgroundImage = "none";
    var dlg = document.getElementById("dlg-product");
    if (dlg) dlg.showModal();
  };
}

function products_edit(id) {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    if (p.id === id) {
      editingProdId = id;
      document.getElementById("p-cat").value = p.catId;
      document.getElementById("p-code").value = p.code;
      document.getElementById("p-name").value = p.name;
      document.getElementById("p-desc").value = p.desc || "";

      currentProdImgArray = Array.isArray(p.img) ? p.img : (p.img ? [p.img] : []);
      var fileInput = document.getElementById("p-img");
      if (fileInput) fileInput.value = "";

      var preview = document.getElementById("p-preview");
      if (preview) {
        var firstImg = currentProdImgArray[0] || "";
        var displayUrl = getAdminImgSrc(firstImg);
        preview.style.backgroundImage = displayUrl ? "url(\"" + displayUrl + "\")" : "none";
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
      }
      document.getElementById("dlg-product").showModal();
      break;
    }
  }
}

function products_toggleStatus(id) {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  for (var i = 0; i < prods.length; i++) {
    if (prods[i].id === id) {
      prods[i].status = !prods[i].status;
      break;
    }
  }
  localStorage.setItem("products", JSON.stringify(prods));
  products_render();
}

function products_delete(id) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
    var prods = JSON.parse(localStorage.getItem("products") || "[]");
    var newProds = [];
    for (var i = 0; i < prods.length; i++) {
      if (prods[i].id !== id) newProds.push(prods[i]);
    }
    localStorage.setItem("products", JSON.stringify(newProds));
    products_render();
  }
}

var formProd = document.querySelector("#dlg-product form");
if (formProd) {
  formProd.onsubmit = function (e) {
    e.preventDefault();
    var catId = document.getElementById("p-cat").value;
    var code = document.getElementById("p-code").value.trim();
    var name = document.getElementById("p-name").value.trim();
    var desc = document.getElementById("p-desc").value.trim();

    var prods = JSON.parse(localStorage.getItem("products") || "[]");
    if (editingProdId) {
      for (var i = 0; i < prods.length; i++) {
        if (prods[i].id === editingProdId) {
          prods[i].catId = catId;
          prods[i].code = code;
          prods[i].name = name;
          prods[i].desc = desc;
          if (currentProdImgArray.length > 0) {
            prods[i].img = currentProdImgArray;
          }
          break;
        }
      }
      editingProdId = null;
    } else {
      var newNum = prods.length + 1;
      var newId = "SP" + (newNum < 10 ? "0" + newNum : newNum);
      prods.push({
        id: newId,
        code: code,
        name: name,
        catId: catId,
        desc: desc,
        img: currentProdImgArray,
        customProfitRate: null,
        status: false // Mặc định ẩn
      });
    }

    localStorage.setItem("products", JSON.stringify(prods));
    document.getElementById("dlg-product").close();
    formProd.reset();
    currentProdImgArray = [];
    document.getElementById("p-preview").style.backgroundImage = "none";
    products_render();
  };
}

// ==========================================================================
// 5. QUẢN LÝ NHẬP HÀNG (IMPORTS)
// ==========================================================================
var editingImportId = null;

function imports_render() {
  var imports = JSON.parse(localStorage.getItem("imports") || "[]");
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  var prodMap = {};
  for (var p = 0; p < prods.length; p++) {
    prodMap[prods[p].id] = prods[p].name;
  }

  var searchIn = document.getElementById("imports-search");
  var keyword = searchIn ? searchIn.value.trim().toLowerCase() : "";
  var fromDate = document.getElementById("imports-from") ? document.getElementById("imports-from").value : "";
  var toInput = document.getElementById("imports-to");
  if (toInput && !toInput.value) {
    toInput.value = new Date().toISOString().split("T")[0];
  }
  var toDate = toInput ? toInput.value : "";
  var statusFilter = document.getElementById("imports-status") ? document.getElementById("imports-status").value : "";
  var tbody = document.getElementById("imports-body");
  if (!tbody) return;

  var html = "";
  for (var i = 0; i < imports.length; i++) {
    var imp = imports[i];
    var matchSearch = imp.id.toLowerCase().indexOf(keyword) !== -1;
    var prodSummaryList = [];
    var totalAmount = 0;

    for (var it = 0; it < imp.items.length; it++) {
      var item = imp.items[it];
      var pName = prodMap[item.prodId] || "SP";
      if (pName.toLowerCase().indexOf(keyword) !== -1) matchSearch = true;
      prodSummaryList.push(pName + " (x" + item.qty + ")");
      totalAmount += (item.qty * item.importPrice);
    }

    var matchFrom = !fromDate || imp.date >= fromDate;
    var matchTo = !toDate || imp.date <= toDate;
    var matchStatus = !statusFilter || imp.status === statusFilter;

    if (matchSearch && matchFrom && matchTo && matchStatus) {
      var actionBtns = (imp.status === "draft")
        ? "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"imports_edit('" + imp.id + "')\">Sửa</button> " +
          "<button type=\"button\" class=\"btn btn-sm btn-ghost\" style=\"color:var(--primary-color)\" onclick=\"imports_complete('" + imp.id + "')\">Hoàn thành</button>"
        : "<small class=\"muted\">Đã khóa cứng</small>";

      html += "<tr>" +
        "<td><b>" + imp.id + "</b></td>" +
        "<td>" + imp.date + "</td>" +
        "<td><small>" + prodSummaryList.join(", ") + "</small></td>" +
        "<td><b>" + formatMoney(totalAmount) + "</b></td>" +
        "<td><span class=\"badge " + imp.status + "\">" + (imp.status === "done" ? "Đã hoàn thành" : "Nháp") + "</span></td>" +
        "<td class=\"actions\">" + actionBtns + "</td>" +
        "</tr>";
    }
  }
  tbody.innerHTML = html || "<tr><td colspan=\"6\" class=\"muted\" style=\"text-align:center;\">Không có phiếu nhập nào</td></tr>";
}

var impFilterIds = ["imports-search", "imports-from", "imports-to", "imports-status"];
for (var ifi = 0; ifi < impFilterIds.length; ifi++) {
  var elImp = document.getElementById(impFilterIds[ifi]);
  if (elImp) {
    elImp.oninput = imports_render;
    elImp.onchange = imports_render;
  }
}

function imports_addLine(prodId, qty, price) {
  prodId = prodId || "";
  qty = qty || 1;
  price = price || 0;

  var container = document.getElementById("import-lines");
  var prods = JSON.parse(localStorage.getItem("products") || "[]");

  var div = document.createElement("div");
  div.className = "line";

  var selectHtml = "<select class=\"line-prod\" required><option value=\"\">-- Chọn sản phẩm --</option>";
  for (var i = 0; i < prods.length; i++) {
    selectHtml += "<option value=\"" + prods[i].id + "\"" + (prods[i].id === prodId ? " selected" : "") + ">" + prods[i].name + "</option>";
  }
  selectHtml += "</select>";

  div.innerHTML = selectHtml +
    "<input type=\"number\" class=\"line-qty\" min=\"1\" value=\"" + qty + "\" required placeholder=\"SL\">" +
    "<input type=\"number\" class=\"line-price\" min=\"0\" step=\"10000\" value=\"" + price + "\" required placeholder=\"Giá nhập\">" +
    "<button type=\"button\" class=\"btn btn-sm btn-danger line-remove\" style=\"padding:0;\">Xóa</button>";

  div.querySelector(".line-remove").onclick = function () {
    div.parentNode.removeChild(div);
  };
  container.appendChild(div);
}

var btnAddLine = document.getElementById("import-add-line");
if (btnAddLine) {
  btnAddLine.onclick = function () { imports_addLine(); };
}

var btnOpenImp = document.querySelector('[data-open="dlg-import"]');
if (btnOpenImp) {
  btnOpenImp.onclick = function () {
    editingImportId = null;
    var form = document.querySelector("#dlg-import form");
    if (form) form.reset();
    var container = document.getElementById("import-lines");
    if (container) container.innerHTML = "";
    document.getElementById("i-date").value = new Date().toISOString().split("T")[0];
    imports_addLine();

    var dlg = document.getElementById("dlg-import");
    if (dlg) dlg.showModal();
  };
}

function imports_edit(id) {
  var imports = JSON.parse(localStorage.getItem("imports") || "[]");
  for (var i = 0; i < imports.length; i++) {
    var imp = imports[i];
    if (imp.id === id && imp.status !== "done") {
      editingImportId = id;
      document.getElementById("i-date").value = imp.date;
      var container = document.getElementById("import-lines");
      container.innerHTML = "";
      for (var j = 0; j < imp.items.length; j++) {
        imports_addLine(imp.items[j].prodId, imp.items[j].qty, imp.items[j].importPrice);
      }
      document.getElementById("dlg-import").showModal();
      break;
    }
  }
}

function imports_complete(id) {
  if (confirm("Khóa cứng phiếu nhập này và cộng vào tồn kho?")) {
    var imports = JSON.parse(localStorage.getItem("imports") || "[]");
    for (var i = 0; i < imports.length; i++) {
      if (imports[i].id === id) {
        imports[i].status = "done";
        break;
      }
    }
    localStorage.setItem("imports", JSON.stringify(imports));
    imports_render();
  }
}

var formImp = document.querySelector("#dlg-import form");
if (formImp) {
  formImp.onsubmit = function (e) {
    e.preventDefault();
    var date = document.getElementById("i-date").value;
    var lines = document.querySelectorAll("#import-lines .line");
    var items = [];

    for (var i = 0; i < lines.length; i++) {
      var prodId = lines[i].querySelector(".line-prod").value;
      var qty = parseInt(lines[i].querySelector(".line-qty").value, 10) || 0;
      var price = parseFloat(lines[i].querySelector(".line-price").value) || 0;
      if (prodId && qty > 0) {
        items.push({ prodId: prodId, qty: qty, importPrice: price });
      }
    }

    if (items.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }

    var imports = JSON.parse(localStorage.getItem("imports") || "[]");
    if (editingImportId) {
      for (var j = 0; j < imports.length; j++) {
        if (imports[j].id === editingImportId) {
          imports[j].date = date;
          imports[j].items = items;
          break;
        }
      }
      editingImportId = null;
    } else {
      var newNum = imports.length + 1;
      var newId = "PN" + (newNum < 10 ? "0" + newNum : newNum);
      imports.push({ id: newId, date: date, status: "draft", items: items });
    }

    localStorage.setItem("imports", JSON.stringify(imports));
    document.getElementById("dlg-import").close();
    formImp.reset();
    imports_render();
  };
}

// ==========================================================================
// 6. QUẢN LÝ GIÁ BÁN & % LỢI NHUẬN (PRICING)
// ==========================================================================
function calculateCostPrices() {
  var imports = JSON.parse(localStorage.getItem("imports") || "[]");
  var costMap = {};

  for (var i = 0; i < imports.length; i++) {
    if (imports[i].status === "done") {
      for (var j = 0; j < imports[i].items.length; j++) {
        var it = imports[i].items[j];
        if (!costMap[it.prodId]) costMap[it.prodId] = { qty: 0, val: 0 };
        costMap[it.prodId].qty += it.qty;
        costMap[it.prodId].val += (it.qty * it.importPrice);
      }
    }
  }

  var avgCost = {};
  for (var prodId in costMap) {
    if (costMap.hasOwnProperty(prodId)) {
      avgCost[prodId] = costMap[prodId].qty > 0 ? (costMap[prodId].val / costMap[prodId].qty) : 0;
    }
  }
  return avgCost;
}

function pricing_render() {
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  var costPrices = calculateCostPrices();

  var catTbody = document.getElementById("pricing-cat-body");
  if (catTbody) {
    var catHtml = "";
    for (var i = 0; i < cats.length; i++) {
      catHtml += "<tr>" +
        "<td><b>" + cats[i].name + "</b></td>" +
        "<td><input type=\"number\" min=\"0\" max=\"100\" class=\"inline-input\" value=\"" + (cats[i].profitRate || 10) + "\" onchange=\"pricing_updateCatRate('" + cats[i].id + "', this.value)\"> %</td>" +
        "<td><small class=\"muted\">Áp dụng chung</small></td>" +
        "</tr>";
    }
    catTbody.innerHTML = catHtml;
  }

  var prodTbody = document.getElementById("pricing-prod-body");
  var pSearch = document.getElementById("pricing-search");
  var keyword = pSearch ? pSearch.value.trim().toLowerCase() : "";
  var pFilter = document.getElementById("pricing-filter-cat");
  var filterCat = pFilter ? pFilter.value : "";

  var catMap = {};
  for (var c = 0; c < cats.length; c++) {
    catMap[cats[c].id] = cats[c];
  }

  if (prodTbody) {
    var prodHtml = "";
    for (var j = 0; j < prods.length; j++) {
      var p = prods[j];
      var matchSearch = p.name.toLowerCase().indexOf(keyword) !== -1 || p.code.toLowerCase().indexOf(keyword) !== -1;
      var matchCat = !filterCat || p.catId === filterCat;

      if (matchSearch && matchCat) {
        var cat = catMap[p.catId] || { profitRate: 10, name: "Khác" };
        var hasCustom = (p.customProfitRate !== null && p.customProfitRate !== undefined && p.customProfitRate !== "");
        var appliedRate = hasCustom ? Number(p.customProfitRate) : Number(cat.profitRate || 10);
        var cost = costPrices[p.id] || 0;
        var retailPrice = cost * (1 + appliedRate / 100);

        var clearBtn = hasCustom
          ? "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"pricing_clearProdRate('" + p.id + "')\">Xóa % riêng</button>"
          : "";

        prodHtml += "<tr>" +
          "<td><b>" + p.code + "</b></td>" +
          "<td>" + p.name + "</td>" +
          "<td>" + cat.name + "</td>" +
          "<td><b>" + formatMoney(cost) + "</b></td>" +
          "<td><input type=\"number\" min=\"0\" max=\"100\" class=\"inline-input\" placeholder=\"" + cat.profitRate + "%\" value=\"" + (hasCustom ? p.customProfitRate : "") + "\" onchange=\"pricing_updateProdRate('" + p.id + "', this.value)\"> %</td>" +
          "<td><b style=\"color:var(--primary-color)\">" + appliedRate + "%</b></td>" +
          "<td><b style=\"color:#17693a;font-size:1rem;\">" + formatMoney(retailPrice) + "</b></td>" +
          "<td>" + clearBtn + "</td>" +
          "</tr>";
      }
    }
    prodTbody.innerHTML = prodHtml || "<tr><td colspan=\"8\" class=\"muted\" style=\"text-align:center;\">Không có sản phẩm nào</td></tr>";
  }
}

var prSearch = document.getElementById("pricing-search");
if (prSearch) prSearch.oninput = pricing_render;
var prFilterCat = document.getElementById("pricing-filter-cat");
if (prFilterCat) prFilterCat.onchange = pricing_render;

function pricing_updateCatRate(catId, val) {
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  for (var i = 0; i < cats.length; i++) {
    if (cats[i].id === catId) {
      cats[i].profitRate = parseFloat(val) || 0;
      break;
    }
  }
  localStorage.setItem("categories", JSON.stringify(cats));
  pricing_render();
}

function pricing_updateProdRate(prodId, val) {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  for (var i = 0; i < prods.length; i++) {
    if (prods[i].id === prodId) {
      prods[i].customProfitRate = val === "" ? null : parseFloat(val);
      break;
    }
  }
  localStorage.setItem("products", JSON.stringify(prods));
  pricing_render();
}

function pricing_clearProdRate(prodId) {
  pricing_updateProdRate(prodId, "");
}

// ==========================================================================
// 7. QUẢN LÝ ĐƠN HÀNG (ORDERS)
// ==========================================================================
var currentViewingOrderId = null;

function orders_render() {
  var orders = JSON.parse(localStorage.getItem("orders") || "[]");
  var fromDate = document.getElementById("orders-from") ? document.getElementById("orders-from").value : "";
  var toInput = document.getElementById("orders-to");
  if (toInput && !toInput.value) {
    toInput.value = new Date().toISOString().split("T")[0];
  }
  var toDate = toInput ? toInput.value : "";
  var statusFilter = document.getElementById("orders-status") ? document.getElementById("orders-status").value : "";
  var tbody = document.getElementById("orders-body");
  if (!tbody) return;

  var statusMap = { new: "Mới đặt", processed: "Đã xử lý", delivered: "Đã giao", cancelled: "Đã hủy" };
  var html = "";

  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    var matchFrom = !fromDate || o.date >= fromDate;
    var matchTo = !toDate || o.date <= toDate;
    var matchStatus = !statusFilter || o.status === statusFilter;

    if (matchFrom && matchTo && matchStatus) {
      html += "<tr>" +
        "<td><b>" + o.id + "</b></td>" +
        "<td>" + o.customerName + "</td>" +
        "<td>" + o.date + "</td>" +
        "<td><b>" + formatMoney(o.total) + "</b></td>" +
        "<td><span class=\"badge " + o.status + "\">" + (statusMap[o.status] || o.status) + "</span></td>" +
        "<td class=\"actions\">" +
        "<button type=\"button\" class=\"btn btn-sm btn-ghost\" onclick=\"orders_viewDetail('" + o.id + "')\">Chi tiết</button>" +
        "</td>" +
        "</tr>";
    }
  }
  tbody.innerHTML = html || "<tr><td colspan=\"6\" class=\"muted\" style=\"text-align:center;\">Không có đơn hàng nào phù hợp</td></tr>";
}

var ordFilters = ["orders-from", "orders-to", "orders-status"];
for (var ofi = 0; ofi < ordFilters.length; ofi++) {
  var elOrd = document.getElementById(ordFilters[ofi]);
  if (elOrd) elOrd.onchange = orders_render;
}

function orders_viewDetail(id) {
  var orders = JSON.parse(localStorage.getItem("orders") || "[]");
  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    if (o.id === id) {
      currentViewingOrderId = id;
      document.getElementById("order-title").innerHTML = "Chi tiết đơn hàng #" + o.id;
      document.getElementById("order-customer").innerHTML = o.customerName + " (" + (o.customerPhone || "---") + ")";
      document.getElementById("order-date").innerHTML = o.date;
      document.getElementById("order-receiver").innerHTML = o.receiverName || o.customerName;
      document.getElementById("order-payment").innerHTML = o.payment || "Tiền mặt (COD)";
      document.getElementById("order-address").innerHTML = o.address || "Tại cửa hàng";

      var itemsBody = document.getElementById("order-items");
      var htmlItems = "";
      for (var j = 0; j < (o.items || []).length; j++) {
        var it = o.items[j];
        htmlItems += "<tr>" +
          "<td>" + it.name + "</td>" +
          "<td>" + formatMoney(it.price) + "</td>" +
          "<td>" + it.qty + "</td>" +
          "<td><b>" + formatMoney(it.price * it.qty) + "</b></td>" +
          "</tr>";
      }
      itemsBody.innerHTML = htmlItems;

      var statusSelect = document.getElementById("order-status-select");
      statusSelect.innerHTML =
        "<option value=\"new\"" + (o.status === "new" ? " selected" : "") + ">Mới đặt</option>" +
        "<option value=\"processed\"" + (o.status === "processed" ? " selected" : "") + ">Đã xử lý</option>" +
        "<option value=\"delivered\"" + (o.status === "delivered" ? " selected" : "") + ">Đã giao</option>" +
        "<option value=\"cancelled\"" + (o.status === "cancelled" ? " selected" : "") + ">Đã hủy</option>";

      document.getElementById("dlg-order").showModal();
      break;
    }
  }
}

var formOrd = document.querySelector("#dlg-order form");
if (formOrd) {
  formOrd.onsubmit = function (e) {
    e.preventDefault();
    var newStatus = document.getElementById("order-status-select").value;
    if (currentViewingOrderId) {
      var orders = JSON.parse(localStorage.getItem("orders") || "[]");
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id === currentViewingOrderId) {
          orders[i].status = newStatus;
          break;
        }
      }
      localStorage.setItem("orders", JSON.stringify(orders));
      orders_render();
      renderDashboard();
    }
    document.getElementById("dlg-order").close();
  };
}

// ==========================================================================
// 8. QUẢN LÝ TỒN KHO & BÁO CÁO XUẤT NHẬP TỒN (INVENTORY)
// ==========================================================================
function calculateCurrentInventory(upToDate) {
  upToDate = upToDate || null;
  var imports = JSON.parse(localStorage.getItem("imports") || "[]");
  var orders = JSON.parse(localStorage.getItem("orders") || "[]");
  var stockMap = {};

  for (var i = 0; i < imports.length; i++) {
    if (imports[i].status === "done" && (!upToDate || imports[i].date <= upToDate)) {
      for (var j = 0; j < imports[i].items.length; j++) {
        var it = imports[i].items[j];
        stockMap[it.prodId] = (stockMap[it.prodId] || 0) + it.qty;
      }
    }
  }

  for (var o = 0; o < orders.length; o++) {
    if (orders[o].status === "delivered" && (!upToDate || orders[o].date <= upToDate)) {
      for (var k = 0; k < orders[o].items.length; k++) {
        var oItem = orders[o].items[k];
        stockMap[oItem.prodId] = (stockMap[oItem.prodId] || 0) - oItem.qty;
      }
    }
  }

  return stockMap;
}

function inventory_render() {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  var threshInput = document.getElementById("inventory-threshold");
  var threshold = threshInput ? (parseInt(threshInput.value, 10) || 5) : 5;
  var currentStock = calculateCurrentInventory();
  var lowTbody = document.getElementById("inventory-low-body");

  if (lowTbody) {
    var htmlLow = "";
    for (var i = 0; i < prods.length; i++) {
      var p = prods[i];
      var qty = currentStock[p.id] || 0;
      if (qty <= threshold) {
        htmlLow += "<tr class=\"low\">" +
          "<td><b>" + p.code + "</b></td>" +
          "<td>" + p.name + "</td>" +
          "<td><b style=\"color:red\">" + qty + "</b></td>" +
          "</tr>";
      }
    }
    lowTbody.innerHTML = htmlLow || "<tr><td colspan=\"3\" class=\"muted\" style=\"text-align:center;\">Không có sản phẩm dưới ngưỡng cảnh báo</td></tr>";
  }

  inventory_renderStockAtDate();
  inventory_renderReport();
}

var invThresh = document.getElementById("inventory-threshold");
if (invThresh) invThresh.oninput = inventory_render;

function inventory_renderStockAtDate() {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  var cats = JSON.parse(localStorage.getItem("categories") || "[]");
  var catMap = {};
  for (var c = 0; c < cats.length; c++) {
    catMap[cats[c].id] = cats[c].name;
  }

  var sSearch = document.getElementById("stock-search");
  var keyword = sSearch ? sSearch.value.trim().toLowerCase() : "";
  var sCat = document.getElementById("stock-cat");
  var catFilter = sCat ? sCat.value : "";

  var dateInput = document.getElementById("stock-date");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
  var targetDate = dateInput ? dateInput.value : null;

  var stockMap = calculateCurrentInventory(targetDate);
  var tbody = document.getElementById("inventory-stock-body");
  if (!tbody) return;

  var html = "";
  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    var matchSearch = p.name.toLowerCase().indexOf(keyword) !== -1 || p.code.toLowerCase().indexOf(keyword) !== -1;
    var matchCat = !catFilter || p.catId === catFilter;

    if (matchSearch && matchCat) {
      html += "<tr>" +
        "<td><b>" + p.code + "</b></td>" +
        "<td>" + p.name + "</td>" +
        "<td>" + (catMap[p.catId] || "---") + "</td>" +
        "<td><b>" + (stockMap[p.id] || 0) + "</b></td>" +
        "</tr>";
    }
  }
  tbody.innerHTML = html || "<tr><td colspan=\"4\" class=\"muted\" style=\"text-align:center;\">Không tìm thấy sản phẩm</td></tr>";
}

var stockFilterIds = ["stock-search", "stock-cat", "stock-date"];
for (var sfi = 0; sfi < stockFilterIds.length; sfi++) {
  var elStk = document.getElementById(stockFilterIds[sfi]);
  if (elStk) {
    elStk.oninput = inventory_renderStockAtDate;
    elStk.onchange = inventory_renderStockAtDate;
  }
}

function inventory_renderReport() {
  var prods = JSON.parse(localStorage.getItem("products") || "[]");
  var rSearch = document.getElementById("report-search");
  var keyword = rSearch ? rSearch.value.trim().toLowerCase() : "";
  var rCat = document.getElementById("report-cat");
  var catFilter = rCat ? rCat.value : "";
  var fromDate = document.getElementById("report-from") ? document.getElementById("report-from").value : "";

  var toInput = document.getElementById("report-to");
  if (toInput && !toInput.value) {
    toInput.value = new Date().toISOString().split("T")[0];
  }
  var toDate = toInput ? toInput.value : "";

  var tbody = document.getElementById("inventory-report-body");
  if (!tbody) return;

  var imports = JSON.parse(localStorage.getItem("imports") || "[]");
  var orders = JSON.parse(localStorage.getItem("orders") || "[]");

  var html = "";
  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    var matchSearch = p.name.toLowerCase().indexOf(keyword) !== -1 || p.code.toLowerCase().indexOf(keyword) !== -1;
    var matchCat = !catFilter || p.catId === catFilter;

    if (matchSearch && matchCat) {
      var startStock = 0;
      var periodImport = 0;
      var periodExport = 0;

      // Tính nhập
      for (var m = 0; m < imports.length; m++) {
        var imp = imports[m];
        if (imp.status === "done") {
          for (var mi = 0; mi < imp.items.length; mi++) {
            if (imp.items[mi].prodId === p.id) {
              if (fromDate && imp.date < fromDate) {
                startStock += imp.items[mi].qty;
              }
              if ((!fromDate || imp.date >= fromDate) && (!toDate || imp.date <= toDate)) {
                periodImport += imp.items[mi].qty;
              }
            }
          }
        }
      }

      // Tính xuất
      for (var o = 0; o < orders.length; o++) {
        var ord = orders[o];
        if (ord.status === "delivered") {
          for (var oi = 0; oi < ord.items.length; oi++) {
            if (ord.items[oi].prodId === p.id) {
              if (fromDate && ord.date < fromDate) {
                startStock -= ord.items[oi].qty;
              }
              if ((!fromDate || ord.date >= fromDate) && (!toDate || ord.date <= toDate)) {
                periodExport += ord.items[oi].qty;
              }
            }
          }
        }
      }

      var endStock = startStock + periodImport - periodExport;

      html += "<tr>" +
        "<td><b>" + p.code + "</b></td>" +
        "<td>" + p.name + "</td>" +
        "<td>" + startStock + "</td>" +
        "<td style=\"color:#17693a\">+" + periodImport + "</td>" +
        "<td style=\"color:red\">-" + periodExport + "</td>" +
        "<td><b>" + endStock + "</b></td>" +
        "</tr>";
    }
  }
  tbody.innerHTML = html || "<tr><td colspan=\"6\" class=\"muted\" style=\"text-align:center;\">Không có dữ liệu báo cáo</td></tr>";
}

var repFilterIds = ["report-search", "report-cat", "report-from", "report-to"];
for (var rfi = 0; rfi < repFilterIds.length; rfi++) {
  var elRep = document.getElementById(repFilterIds[rfi]);
  if (elRep) {
    elRep.oninput = inventory_renderReport;
    elRep.onchange = inventory_renderReport;
  }
}

updateCategoryDropdowns();
showTab();
renderDashboard();