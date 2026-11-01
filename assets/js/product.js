// Danh sách hãng (dùng cho nút lọc và chi tiết sản phẩm)
const categoryFilter = document.getElementById("categoryFilter");
const categories = JSON.parse(localStorage.getItem("categories") || "[]");



const products = JSON.parse(localStorage.getItem("products") || "[]");
const imports = JSON.parse(localStorage.getItem("imports") || "[]").filter(importRecord => importRecord.status === "done");


const productContainer = document.getElementById("productContainer");

if (productContainer) {
  products
    .filter(product => product.status !== false)
    .forEach(product => {
      const productBox = document.createElement("div");
      productBox.className = "sanpham";

      const productList = document.createElement("div");
      productList.className = "productList";
      productList.dataset.productId = product.id;

      if (product.img) {
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


function getProductPrice(product) {
  const category = categories.find(item => item.id === product.catId);
  const importItem = imports
    .flatMap(record => record.items)
    .find(item => item.prodId === product.id);

  const importPrice = importItem?.importPrice ?? 0;
  const profitRate = Number(product.customProfitRate ?? category?.profitRate ?? 10);
  // const profitRate = category?.profitRate ?? 10;

  return importPrice * (1 + profitRate / 100);
}



document.querySelectorAll(".productList").forEach(productList => {
  const selectedId = productList.dataset.productId;
  const product = products.find(item => item.id === selectedId);

  if (!product) return;


  const card = document.createElement("form");
  card.className = "product-card";

  const name = document.createElement("h2");
  name.textContent = product.name;




  const price = document.createElement("h3");
  price.textContent = formatCurrency(getProductPrice(product));

  const detailButton = document.createElement("button");
  detailButton.type = "button";
  detailButton.textContent = "Chi tiết";
  detailButton.addEventListener("click", () => renderDetail(product.id));

  productList.appendChild(card);
  card.append(name, price, detailButton);
});




const maxsp = 9;
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
  pagination.innerHTML = "";
  const sotrang = Math.ceil(sanPhamPhuHop.length / 9);


for (let i = 0; i < sotrang; i++) {
  const nutTrang = document.createElement("button");
  nutTrang.type = "button";
  nutTrang.textContent = i + 1;

  if (i === trangHienTai) nutTrang.classList.add("active");


  nutTrang.addEventListener("click", () => {
    trangHienTai = i;
    hienTrang();
  });
  pagination.appendChild(nutTrang);
}
}
hienTrang();
// 1. Hàm bỏ dấu tiếng Việt để tìm "dien thoai" vẫn ra "điện thoại"
const norm = s => String(s || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/đ/g, "d")
  .trim();

function loc() {
  const keyword = norm(document.getElementById("fQ").value);
  const selectedCategory = document.getElementById("categoryFilter").value;

  const priceMin = (document.getElementById("price-min").value);
  const priceMax = (document.getElementById("price-max").value);
  const min = priceMin === "" ? null : Number(priceMin);
  const max = priceMax === "" ? null : Number(priceMax);

  sanPhamPhuHop = cacSanPham.filter(card => {
    const productList = card.querySelector(".productList");

    const product = products.find(
      item => item.id === productList.dataset.productId
    );
    card = productList.closest(".sanpham");

    if (!product || !card) return;

    const matchName = norm(product.name).includes(keyword);
    const matchCategory =
      !selectedCategory || product.catId === selectedCategory;



    const price = getProductPrice(product);
    const matchPrice =
      (min === null || price >= min) &&
      (max === null || price <= max);

      return matchName && matchCategory && matchPrice;

  });
  trangHienTai = 0;
  hienTrang();
}
hienTrang();


// ========================================
// 5. LỌC THEO HÃNG (Apple, Samsung, Xiaomi, Oppo, Vivo)
// Hàm mới, không đụng tới hàm loc() ở trên
// ========================================

// Hãng đang được chọn ("" = hiển thị tất cả)
let hangDangChon = "";

// Chỉ lọc theo hãng rồi hiển thị lại danh sách + phân trang
function locTheoHang(catId) {
  hangDangChon = catId;

  sanPhamPhuHop = cacSanPham.filter(card => {
    // Không chọn hãng nào thì hiện tất cả
    if (!hangDangChon) return true;

    const productList = card.querySelector(".productList");
    if (!productList) return false;

    const product = products.find(
      item => String(item.id) === String(productList.dataset.productId)
    );
    if (!product) return false;

    return String(product.catId) === String(hangDangChon);
  });

  trangHienTai = 0; // quay về trang đầu
  hienTrang();
}

// Tạo các nút hãng và gắn sự kiện click
function khoiTaoNutHang() {
  if (!categoryFilter) return;

  categoryFilter.innerHTML = "";

  categories
    .filter(category => category.status !== false)
    .forEach(category => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nut-hang";
      btn.dataset.id = category.id;
      btn.textContent = category.name;

      btn.addEventListener("click", () => {
        // Bấm lại đúng nút đang chọn thì bỏ lọc
        const idMoi = hangDangChon === String(category.id) ? "" : String(category.id);

        // Tô sáng nút đang chọn
        categoryFilter.querySelectorAll("button").forEach(b => {
          b.classList.toggle("active", idMoi !== "" && b.dataset.id === idMoi);
        });

        locTheoHang(idMoi);
      });

      categoryFilter.appendChild(btn);
    });
}

khoiTaoNutHang();


// ========================================
// 6. CHI TIẾT SẢN PHẨM
// ========================================

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
  addCart.addEventListener("click", function(){
    window.Shop.addToCart(product.id);
    addCart.textContent = "Đã thêm"
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
  image.src = product.img[currentIndex];
  image.alt = product.name || "Ảnh sản phẩm";
  title.textContent = product.name || "Chi tiết sản phẩm";


  function nextImg(index) {
    currentIndex++;
    if (currentIndex >= product.img.length) {
      currentIndex = 0;
    }
    image.src = product.img[currentIndex];
  }
  function preImg(index) {
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = product.img.length - 1;
    }
    image.src = product.img[currentIndex];
  }

  dialog.append(closeButton, addCart, btnPrev, image, btnNext, title);

  const details = [
    `Mã sản phẩm: ${product.code || "Chưa cập nhật"}`,
    `Hãng: ${category?.name || "Chưa cập nhật"}`,
    `Giá bán: ${formatCurrency(getProductPrice(product))}`,
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
