// quangcao.js - Băng chuyền các mẫu điện thoại chạy liên tục (khối .qc-bang trong index.html)
// Chỉ ĐỌC dữ liệu có sẵn từ product.js (products, categories, getProductPrice) và main.js (formatCurrency).
// Bấm vào một mẫu = gọi renderDetail(id) có sẵn. Không sửa, không ghi đè bất kỳ hàm nào khác.
(function () {
  const day = document.getElementById("qcDay");
  if (!day || typeof products === "undefined" || typeof categories === "undefined") return;

  const GIAY_MOI_THE = 3.5;   // tốc độ: số giây để cuộn qua một thẻ (càng lớn càng chậm)
  const RONG_THE = 236;       // 220px thẻ + 16px khoảng cách

  // Cùng điều kiện hiển thị với danh sách sản phẩm: đang kinh doanh, hãng đang bật, có ảnh
  const hangDangBat = new Set(categories.filter(c => c.status !== false).map(c => String(c.id)));
  const tenHang = Object.fromEntries(categories.map(c => [String(c.id), c.name]));
  const danhSach = products.filter(p =>
    p.status !== false &&
    hangDangBat.has(String(p.catId)) &&
    Array.isArray(p.img) && p.img.length > 0
  );

  // Không có mẫu nào thì bỏ hẳn khối này
  if (!danhSach.length) {
    day.closest(".qc-bang")?.remove();
    return;
  }

  function taoThe(p, laBanSao) {
    const the = document.createElement("button");
    the.type = "button";
    the.className = "qc-the";

    const anh = document.createElement("img");
    anh.src = p.img[0];
    anh.alt = laBanSao ? "" : p.name;
    anh.loading = "lazy";
    anh.addEventListener("error", () => { anh.style.visibility = "hidden"; });

    const hang = document.createElement("span");
    hang.className = "qc-the-hang";
    hang.textContent = tenHang[String(p.catId)] || "";

    const ten = document.createElement("strong");
    ten.className = "qc-the-ten";
    ten.textContent = p.name;

    const gia = document.createElement("span");
    gia.className = "qc-the-gia";
    gia.textContent = formatCurrency(getProductPrice(p));

    const nut = document.createElement("span");
    nut.className = "qc-the-nut";
    nut.textContent = "Xem chi tiết";

    the.append(anh, hang, ten, gia, nut);
    the.addEventListener("click", e => {
      // Bấm bằng chuột/chạm thì bỏ focus để băng chuyền không bị kẹt ở trạng thái dừng sau khi đóng chi tiết
      // (e.detail = 0 là bấm bằng phím Enter: giữ focus để người dùng bàn phím không mất vị trí)
      if (e.detail > 0) the.blur();
      renderDetail(p.id);
    });

    // Bản sao chỉ để vòng lặp liền mạch: ẩn khỏi trình đọc màn hình và phím Tab
    if (laBanSao) {
      the.tabIndex = -1;
      the.setAttribute("aria-hidden", "true");
    }
    return the;
  }

  // Ít mẫu quá thì lặp lại cho đủ rộng hơn khung hiển thị, rồi nhân đôi để cuộn vô tận
  const soLan = Math.max(1, Math.ceil(1500 / (danhSach.length * RONG_THE)));
  const nhom = [];
  for (let i = 0; i < soLan; i++) danhSach.forEach(p => nhom.push(p));

  nhom.forEach(p => day.appendChild(taoThe(p, false)));
  nhom.forEach(p => day.appendChild(taoThe(p, true)));

  day.style.setProperty("--thoi-gian", Math.max(20, nhom.length * GIAY_MOI_THE) + "s");
})();

//Sửa ở đây
// Ba khối ưu đãi tự đổi sản phẩm theo từng nhịp (đọc products/categories, không sửa dữ liệu)
(function () {
  const luoi = document.querySelector(".qc-luoi");
  if (!luoi || typeof products === "undefined" || typeof categories === "undefined") return;

  const GIAY_MOI_NHIP = 5;   // số giây giữa hai lần đổi
  const NHAN_CHINH = ["Hàng mới về", "Bán chạy nhất", "Ưu đãi hot", "Chính hãng 100%"];
  const NHAN_PHU = ["Trả góp 0%", "Bán chạy tuần này", "Giá tốt hôm nay", "Giao nhanh miễn phí"];

  const hangDangBat = new Set(categories.filter(c => c.status !== false).map(c => String(c.id)));
  const tenHang = Object.fromEntries(categories.map(c => [String(c.id), c.name]));
  let ds = products.filter(p =>
    p.status !== false &&
    hangDangBat.has(String(p.catId)) &&
    Array.isArray(p.img) && p.img.length > 0
  );
  if (ds.length < 4) return;   // ít quá thì giữ nguyên 3 khối cố định

  // Đưa SP01, SP02, SP03 lên đầu để nhịp đầu tiên trùng với nội dung đang có trong index.html
  const dau = ["SP01", "SP02", "SP03"].map(id => ds.find(p => String(p.id) === id)).filter(Boolean);
  ds = dau.concat(ds.filter(p => !dau.includes(p)));

  const chinh = luoi.querySelector(".qc-chinh");
  const phu = Array.from(luoi.querySelectorAll(".qc-phu"));
  if (!chinh || phu.length < 2) return;

  const soNhip = Math.ceil(ds.length / 3);
  const layBo = n => [0, 1, 2].map(k => ds[(n * 3 + k) % ds.length]);
  const gia = p => formatCurrency(getProductPrice(p));
  const cat = (s, n) => (s.length > n ? s.slice(0, n).trim() + "…" : s);

  function napChinh(p, n) {
    chinh.querySelector(".qc-nhan").textContent = NHAN_CHINH[n % NHAN_CHINH.length];
    chinh.querySelector("h2").textContent = p.name;
    chinh.querySelector(".qc-giamgia").textContent = tenHang[String(p.catId)] || "";
    chinh.querySelector(".qc-thongso").textContent = p.desc ? cat(String(p.desc), 90) : "Chính hãng · Bảo hành 12 tháng";
    const g = chinh.querySelector(".qc-gia strong");
    g.textContent = gia(p);
    g.dataset.gia = p.id;
    chinh.querySelector(".qc-nut").onclick = () => renderDetail(p.id);
    const anh = chinh.querySelector(".qc-chinh-anh img");
    anh.src = p.img[0];
    anh.alt = p.name;
  }

  function napPhu(el, p, n) {
    el.querySelector(".qc-nhan-nho").textContent = NHAN_PHU[n % NHAN_PHU.length];
    el.querySelector("h3").textContent = p.name;
    const g = el.querySelector(".qc-gia-nho span");
    g.textContent = gia(p);
    g.dataset.gia = p.id;
    el.querySelector(".qc-nut-nho").onclick = () => renderDetail(p.id);
    const anh = el.querySelector("img");
    anh.src = p.img[0];
    anh.alt = p.name;
  }

  // Các chấm chỉ nhịp hiện tại, bấm để chuyển tay
  const chamBox = document.createElement("div");
  chamBox.className = "qc-cham";
  const cham = [];
  for (let i = 0; i < soNhip; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Nhóm ưu đãi " + (i + 1));
    b.addEventListener("click", () => { chuyen(i); khoiDong(); });
    chamBox.appendChild(b);
    cham.push(b);
  }
  luoi.after(chamBox);

  let nhip = 0;
  let timer = null;
  let dangDoi = false;

  function hienNhip(n) {
    const [a, b, c] = layBo(n);
    napChinh(a, n);
    napPhu(phu[0], b, n);
    napPhu(phu[1], c, n);
    cham.forEach((d, i) => d.classList.toggle("on", i === n));
  }

  function chuyen(n) {
    if (dangDoi || n === nhip) return;
    dangDoi = true;
    luoi.classList.add("qc-doi");          // mờ dần
    setTimeout(() => {
      nhip = n;
      hienNhip(nhip);
      luoi.classList.remove("qc-doi");     // hiện lại
      dangDoi = false;
    }, 350);
  }

  function dung() { clearInterval(timer); timer = null; }
  function khoiDong() {
    dung();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;  // người dùng tắt chuyển động
    timer = setInterval(() => chuyen((nhip + 1) % soNhip), GIAY_MOI_NHIP * 1000);
  }

  // Rê chuột, đang focus bàn phím hoặc chuyển tab khác thì dừng
  luoi.addEventListener("mouseenter", dung);
  luoi.addEventListener("mouseleave", khoiDong);
  luoi.addEventListener("focusin", dung);
  luoi.addEventListener("focusout", khoiDong);
  document.addEventListener("visibilitychange", () => (document.hidden ? dung() : khoiDong()));

  hienNhip(0);
  khoiDong();
})();