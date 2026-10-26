// Hiển thị hãng trong danh sách chọn
const categoryFilter = document.getElementById("categoryFilter");
const categories = JSON.parse(localStorage.getItem("categories") || "[]");

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


document.querySelectorAll(".productList").forEach(productList => {
  const selectedId = productList.dataset.productId;
  const product = products.find(item => item.id === selectedId);

  if (!product) return;

  const categorie = categories.find(category => category.id === product.catId);
  const importItem = imports
  .flatMap(record => record.items)
  .find(
  item => item.prodId === product.id
);


  const importPrice = importItem?.importPrice ?? 0;
  const profitRate = categorie?.profitRate ?? 10;


  const card = document.createElement("form");
  card.className = "product-card";

  const name = document.createElement("h2");
  name.textContent = product.name;

  const code = document.createElement("p");
  code.textContent = `Mã: ${product.code}`;


  const price = document.createElement("h3");
  price.textContent = formatCurrency(importPrice * (1 + profitRate / 100));

  card.append(name, code ,price);
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

  document.querySelectorAll(".productList").forEach(productList => {
    const product = products.find(
      item => item.id === productList.dataset.productId
    );
    const card = productList.closest(".sanpham");

    if (!product || !card) return;

    const matchName = norm(product.name).includes(keyword);
    const matchCategory =
      !selectedCategory || product.catId === selectedCategory;

    card.hidden = !(matchName && matchCategory);
  });
}