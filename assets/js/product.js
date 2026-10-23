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
document.querySelectorAll(".productList").forEach(productList => {
  const selectedId = productList.dataset.productId;
  const product = products.find(item => item.id === selectedId);

  if (!product) return;

  const card = document.createElement("div");
  card.className = "product-card";

  const name = document.createElement("h2");
  name.textContent = product.name;

  const code = document.createElement("p");
  code.textContent = `Mã: ${product.code}`;

  const description = document.createElement("p");
  description.textContent = product.desc;

  card.append(name, code, description);
  productList.appendChild(card);
});

// 1. Hàm bỏ dấu tiếng Việt để tìm "dien thoai" vẫn ra "điện thoại"
const norm = s => String(s || '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();

// 2. Gửi form: đưa giá trị lên URL
document.getElementById('filterForm').addEventListener('submit', e => {
  e.preventDefault();
  const u = new URLSearchParams();
  const q = document.getElementById('fQ').value.trim();
  const cat = document.getElementById('fCat').value;
  const min = document.getElementById('fMin').value;
  const max = document.getElementById('fMax').value;
  if (q) u.set('q', q);
  if (cat) u.set('cat', cat);
  if (min) u.set('min', min);
  if (max) u.set('max', max);
  location.search = u.toString();      // tải lại trang với tham số mới
});

// 3. Đọc tham số và lọc
const params = new URLSearchParams(location.search);
const q = params.get('q') || '';
const cat = params.get('cat') || '';
const min = +params.get('min') || 0;
const max = +params.get('max') || Infinity;

const ketQua = getVisibleProducts().filter(p => {
  const gia = priceOf(p);
  return norm(p.name).includes(norm(q))      // khớp tên
    && (!cat || p.categoryId === cat)      // khớp hãng (bỏ trống = tất cả)
    && gia >= min && gia <= max;           // khớp khoảng giá
});

// 4. Hiển thị
document.getElementById('productList').innerHTML =
  ketQua.length ? ketQua.map(productCard).join('') : '<p>Không tìm thấy sản phẩm</p>';
