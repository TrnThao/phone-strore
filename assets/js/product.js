// Hiển thị hãng trong danh sách chọn
const categoryFilter = document.getElementById("categoryFilter");
const categories = JSON.parse(localStorage.getItem("categories") || "[]")


if (categoryFilter) {
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Chọn hãng";
  categoryFilter.appendChild(placeholder);

  categories
    .filter(category => category.status !== false)
    .forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });
}



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
        image.src = product.img;
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
  const profitRate = category?.profitRate ?? 10;

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


  card.append(name, price, detailButton);
  productList.appendChild(card);




});






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


  document.querySelectorAll(".productList").forEach(productList => {
    const product = products.find(
      item => item.id === productList.dataset.productId
    );
    const card = productList.closest(".sanpham");

    if (!product || !card) return;

    const matchName = norm(product.name).includes(keyword);
    const matchCategory =
      !selectedCategory || product.catId === selectedCategory;

    const min = priceMin === "" ? null: Number(priceMin);
    const max = priceMax === "" ? null: Number(priceMax);
    const price = getProductPrice(product);
    const matchPrice =
        (min === null || price >= min) && 
        (max === null || price <=max);
    card.hidden = !(matchName && matchCategory && matchPrice);


  });

}


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
 // addCart.addEventListener("click", ());


  const title = document.createElement("h2");
  const image = document.createElement("img");
  image.src = product.img;
  image.alt = product.name || "Ảnh sản phẩm";
  title.textContent = product.name || "Chi tiết sản phẩm";

  dialog.append(closeButton,addCart ,image, title);

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