// Danh sách hãng (dùng cho nút lọc và chi tiết sản phẩm)
const categoryFilter = document.getElementById("categoryFilter");
const categories = JSON.parse(localStorage.getItem("categories") || "[]");
const products = JSON.parse(localStorage.getItem("products") || "[]");
const imports = JSON.parse(localStorage.getItem("imports") || "[]").filter(importRecord => importRecord.status === "done");

const productContainer = document.getElementById("productContainer");

// 1. TẠO THẺ SẢN PHẨM (Chỉ tạo sản phẩm đang kinh doanh và hãng đang BẬT)
if (productContainer) {
  const danhSachHangHoatDong = new Set(
    categories
      .filter(c => c.status !== false)
      .map(c => String(c.id))
  );

  products
    .filter(product => product.status !== false && danhSachHangHoatDong.has(String(product.catId)))
    .forEach(product => {
      const productBox = document.createElement("div");
      productBox.className = "sanpham";

      const productList = document.createElement("div");
      productList.className = "productList";
      productList.dataset.productId = String(product.id);

      if (product.img && product.img.length > 0) {
        const image = document.createElement("img");
        image.src = product.img[0];
        image.alt = product.name;
        image.className = "pic";
        productBox.appendChild(image);
      }

      productBox.appendChild(productList);
      productContainer.appendChild(productBox);
    });
}

// 2. TÍNH GIÁ BÁN
function getProductPrice(product) {
  const category = categories.find(item => String(item.id) === String(product.catId));
  const importItem = imports
    .flatMap(record => record.items || [])
    .find(item => String(item.prodId) === String(product.id));

  const importPrice = importItem?.importPrice ?? 0;
  const profitRate = Number(product.customProfitRate ?? category?.profitRate ?? 10);

  return importPrice * (1 + profitRate / 100);
}

// 3. VẼ NỘI DUNG VÀ NÚT BẤM CHO TỪNG CARD
document.querySelectorAll(".productList").forEach(productList => {
  const selectedId = productList.dataset.productId;
  const product = products.find(item => String(item.id) === String(selectedId));

  if (!product) return;

  const card = document.createElement("form");
  card.className = "product-card";

  const name = document.createElement("h2");
  name.textContent = product.name;

  const price = document.createElement("h3");
  price.textContent = typeof formatCurrency === "function" ? formatCurrency(getProductPrice(product)) : getProductPrice(product).toLocaleString("vi-VN") + " ₫";

  const detailButton = document.createElement("button");
  detailButton.type = "button";
  detailButton.textContent = "Chi tiết";
  detailButton.addEventListener("click", () => renderDetail(product.id));

  productList.appendChild(card);
  card.append(name, price, detailButton);
});

// 4. QUẢN LÝ PHÂN TRANG VÀ HIỂN THỊ
const maxsp = 12;
const cacSanPham = Array.from(
  document.querySelectorAll("#productContainer .sanpham")
);
let sanPhamPhuHop = [...cacSanPham];
let trangHienTai = 0;
const pagination = document.getElementById("pagination");

function hienTrang() {
  const batDau = trangHienTai * maxsp;
  const sanPhamTrangNay = sanPhamPhuHop.slice(batDau, batDau + maxsp);

  cacSanPham.forEach(sanPham => {
    sanPham.hidden = !sanPhamTrangNay.includes(sanPham);
  });

  if (!pagination) return;
  pagination.innerHTML = "";
  const sotrang = Math.ceil(sanPhamPhuHop.length / maxsp);

  for (let i = 0; i < sotrang; i++) {
    const nutTrang = document.createElement("button");
    nutTrang.type = "button";
    nutTrang.textContent = i + 1;

    if (i === trangHienTai) nutTrang.classList.add("active");
    if (sotrang === 1) nutTrang.style.display = "none";

    nutTrang.addEventListener("click", () => {
      trangHienTai = i;
      hienTrang();
    });
    pagination.appendChild(nutTrang);
  }
}

// 5. LỌC THEO TỪ KHÓA VÀ KHOẢNG GIÁ
const norm = s => String(s || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/đ/g, "d")
  .trim();

function loc() {
const qcl = document.querySelector(".qc");
if (qcl) qcl.classList.add("qcl");
  hangDangChon = categoryFilter
    ? Array.from(categoryFilter.querySelectorAll("input:checked")).map(o => o.value)
    : [];

  const inputQ = document.getElementById("fQ");
  const keyword = inputQ ? norm(inputQ.value) : "";
  const priceMin = document.getElementById("price-min")?.value;
  const priceMax = document.getElementById("price-max")?.value;
  const min = (priceMin === "" || priceMin == null) ? null : Number(priceMin);
  const max = (priceMax === "" || priceMax == null) ? null : Number(priceMax);

  // Lấy các hãng hợp lệ
  const danhSachHangHoatDong = new Set(
    categories.filter(c => c.status !== false).map(c => String(c.id))
  );

  sanPhamPhuHop = cacSanPham.filter(card => {
    const productList = card.querySelector(".productList");
    if (!productList) return false;

    const product = products.find(
      item => String(item.id) === String(productList.dataset.productId)
    );
    if (!product) return false;

    // Phải là hãng đang bật
    if (!danhSachHangHoatDong.has(String(product.catId))) return false;

    // Lọc theo từ khóa tên
    const matchName = norm(product.name).includes(keyword);

    // Lọc theo nút hãng đang bấm (nếu có chọn)
    const matchHang = hangDangChon.length === 0 || hangDangChon.includes(String(product.catId));

    // Lọc theo khoảng giá
    const price = getProductPrice(product);
    const matchPrice =
      (min === null || price >= min) &&
      (max === null || price <= max);

    return matchName && matchHang && matchPrice;
  });
  trangHienTai = 0;
  hienTrang();
}

// 6. LỌC THEO HÃNG BẰNG NÚT BẤM
let hangDangChon = [];
function locTheoHang(catId) {
  hangDangChon = Array.isArray(catId) ? catId : (catId ? [String(catId)] : []);
  const danhSachHangHoatDong = new Set(
    categories
      .filter(c => c.status !== false)
      .map(c => String(c.id))
  );

  sanPhamPhuHop = cacSanPham.filter(card => {
    const productList = card.querySelector(".productList");
    if (!productList) return false;

    const product = products.find(
      item => String(item.id) === String(productList.dataset.productId)
    );
    if (!product) return false;

    // Chỉ lấy sản phẩm có hãng đang mở
    if (!danhSachHangHoatDong.has(String(product.catId))) return false;

    // Nếu có chọn một hãng cụ thể
    if (hangDangChon.length > 0) {
      return hangDangChon.includes(String(product.catId))
    }

    return true;
  });

  trangHienTai = 0;
  hienTrang();
}

// 7. KHỞI TẠO NÚT BẤM DANH MỤC HÃNG
function khoiTaoNutHang() {
  if (!categoryFilter) return;

  categoryFilter.innerHTML = "";

  categories
    .filter(category => category.status !== false)
    .forEach(category => {
      const label = document.createElement("label");
      label.className = "nut-hang";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "hang";
      checkbox.value = String(category.id);

      label.append(checkbox, document.createTextNode(category.name));
      categoryFilter.appendChild(label);
    });
}

// 8. CHI TIẾT SẢN PHẨM
function renderDetail(id) {
  const product = products.find(item => String(item.id) === String(id));
  if (!product) return;

  document.getElementById("product-detail-dialog")?.remove();

  const category = categories.find(item => String(item.id) === String(product.catId));

  const dialog = document.createElement("dialog");
  dialog.id = "product-detail-dialog";
  const closeButton = document.createElement("button");
  closeButton.className = "close";
  closeButton.type = "button";
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => dialog.close());

  const addCart = document.createElement("button");
  addCart.className = "cart";
  addCart.type = "button";
  addCart.textContent = "Thêm vào giỏ hàng";
  addCart.addEventListener("click", function () {
    if (window.Shop && typeof window.Shop.addToCart === "function") {
      window.Shop.addToCart(product.id);
      addCart.textContent = "Đã thêm";
    }
  });

  const btnNext = document.createElement("button");
  const btnPrev = document.createElement("button");
  btnNext.className = "slide-next";
  btnPrev.className = "slide-prev";
  btnNext.type = "button";
  btnPrev.type = "button";
  btnNext.textContent = ">";
  btnPrev.textContent = "<";
  btnNext.addEventListener("click", nextImg);
  btnPrev.addEventListener("click", preImg);

  let currentIndex = 0;

  const title = document.createElement("h2");
  const image = document.createElement("img");
  const imgs = Array.isArray(product.img) ? product.img : (product.img ? [product.img] : []);
  image.src = imgs[currentIndex] || "";
  image.alt = product.name || "Ảnh sản phẩm";
  title.textContent = product.name || "Chi tiết sản phẩm";

  function nextImg() {
    if (!imgs.length) return;
    currentIndex++;
    if (currentIndex >= imgs.length) currentIndex = 0;
    image.src = imgs[currentIndex];
  }
  function preImg() {
    if (!imgs.length) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = imgs.length - 1;
    image.src = imgs[currentIndex];
  }

  dialog.append(closeButton, addCart, btnPrev, image, btnNext, title);

  const details = [
    `Mã sản phẩm: ${product.code || "Chưa cập nhật"}`,
    `Hãng: ${category?.name || "Chưa cập nhật"}`,
    `Giá bán: ${typeof formatCurrency === "function" ? formatCurrency(getProductPrice(product)) : getProductPrice(product).toLocaleString("vi-VN") + " ₫"}`,
    `Mô tả: ${product.desc || "Chưa có mô tả"}`
  ];
  details.forEach(text => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    dialog.appendChild(paragraph);
  });

  document.body.appendChild(dialog);
  dialog.showModal();
}

khoiTaoNutHang();
locTheoHang("");