// ========================================
// shop.js - Giỏ hàng, Thanh toán, Đơn hàng, Tài khoản
// Dùng các hàm có sẵn của main.js: getCart, saveCart, formatCurrency, renderHeader, updateCartBadge
// Giao diện các hộp thoại nằm trong assets/css/shop.css
// Quy tắc: dữ liệu người dùng KHÔNG ghép vào chuỗi HTML, mà gán sau bằng .value / .textContent
// (hai thuộc tính này coi dữ liệu là chữ thường nên không cần làm sạch).
// ========================================
(function () {
  const SESSION = "currentUser";
  const PHONE = /^0\d{9}$/;
  const STATUS = { new: "Mới", processed: "Đã xử lý", delivered: "Đã giao", cancelled: "Đã hủy" };

  // ---------- Tiện ích ----------
  const load = (k, d) => JSON.parse(localStorage.getItem(k) || "null") ?? d;
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const today = () => new Date().toLocaleDateString("sv-SE");
  const row = (label, attrs) => `<label class="field">${label}<input ${attrs}></label>`;
  // Điền giá trị vào các ô nhập có name trùng với khóa của data
  const fill = (scope, data) => Object.entries(data).forEach(([k, v]) => {
    const input = scope.querySelector(`[name="${k}"]`);
    if (input) input.value = v ?? "";
  });
  // Gán chữ lần lượt cho các phần tử khớp selector
  const fillText = (scope, selector, texts) =>
    scope.querySelectorAll(selector).forEach((el, n) => el.textContent = texts[n]);
  const say = (scope, text, ok) => {
    const p = scope.querySelector(".msg");
    p.className = "msg " + (ok ? "ok" : "err");
    p.textContent = text;
  };
  // Mã tiếp theo, ví dụ DH06, KH06
  const nextId = (list, prefix) =>
    prefix + String(list.reduce((m, x) => Math.max(m, parseInt((x.id || "").replace(prefix, "")) || 0), 0) + 1).padStart(2, "0");

  // ---------- Dialog ----------
  function close() { document.getElementById("shop-dialog")?.remove(); }
  function show(title, html) {
    close();
    document.body.insertAdjacentHTML("beforeend",
      `<dialog id="shop-dialog">` +
      `<button type="button" class="x">X</button><h2>${title}</h2>${html}` +
      `</dialog>`);
    const dlg = document.getElementById("shop-dialog");
    dlg.querySelector(".x").onclick = close;
    dlg.onclose = close;
    dlg.showModal();
    return dlg;
  }

  // ---------- Phiên đăng nhập ----------
  // auth.js lưu ở sessionStorage, renderHeader() đọc localStorage -> ghi cả hai.
  const users = () => load("users", []);
  const same = (a, b) => (a.id || a.name) === (b.id || b.name);
  const refresh = () => { renderHeader(); updateCartBadge(); };

  function user() {
    const s = JSON.parse(sessionStorage.getItem(SESSION) || localStorage.getItem(SESSION) || "null");
    return s && users().find(u => same(u, s)) || null;
  }
  function login(u) {
    sessionStorage.setItem(SESSION, JSON.stringify(u));
    localStorage.setItem(SESSION, JSON.stringify(u));
    refresh();
  }
  function logout() {
    sessionStorage.removeItem(SESSION);
    localStorage.removeItem(SESSION);
    close();
    refresh();
  }
  // Chưa đăng nhập -> chuyển sang trang đăng nhập có sẵn (login.html, do auth.js xử lý)
  function goLogin() {
    document.getElementById("product-detail-dialog")?.close();
    alert("Vui lòng đăng nhập để tiếp tục.");
    location.href = "login.html";
  }
  // Đăng nhập từ login.html chỉ có sessionStorage -> chép sang localStorage cho header
  if (sessionStorage.getItem(SESSION) && !localStorage.getItem(SESSION)) {
    localStorage.setItem(SESSION, sessionStorage.getItem(SESSION));
  }

  // ---------- Giỏ hàng ----------
  const clamp = n => Math.min(99, Math.max(1, Math.floor(Number(n)) || 1));

  function addToCart(prodId) {
    if (!user()) {
      goLogin();
      return false;
    }
    const cart = getCart();
    const line = cart.find(i => i.prodId === prodId);
    if (line) line.qty = clamp(line.qty + 1);
    else cart.push({ prodId, qty: 1 });
    saveCart(cart);
    return true;
  }

  // Các dòng giỏ hàng kèm thông tin sản phẩm (bỏ sản phẩm đã ẩn)
  function cartRows() {
    return getCart()
      .map(i => ({ ...i, product: products.find(p => p.id === i.prodId && p.status !== false) }))
      .filter(i => i.product)
      .map(i => ({ ...i, price: getProductPrice(i.product) }));
  }
  const sum = rows => rows.reduce((s, i) => s + i.price * i.qty, 0);

  function openCart() {
    if (!user()) return goLogin();
    const rows = cartRows();
    if (!rows.length) return show("Giỏ hàng", `<p class="empty">Giỏ hàng đang trống.</p>`);

    const dlg = show("Giỏ hàng", `
      <div class="table-wrap">
        <table class="cart-table">
          <tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr>
          ${rows.map((i, n) => `
            <tr>
              <td class="name"></td>
              <td>${formatCurrency(i.price)}</td>
              <td><input type="number" min="1" max="99" value="${clamp(i.qty)}" data-n="${n}"></td>
              <td>${formatCurrency(i.price * i.qty)}</td>
              <td><button class="danger" data-del="${n}">Xóa</button></td>
            </tr>`).join("")}
        </table>
      </div>
      <h3 class="total">Tổng tiền: ${formatCurrency(sum(rows))}</h3>
      <div class="actions"><button class="pay">Thanh toán</button></div>`);

    fillText(dlg, ".name", rows.map(i => i.product.name));

    dlg.querySelectorAll("[data-n]").forEach(input => input.onchange = () => {
      const id = rows[input.dataset.n].prodId;
      saveCart(getCart().map(i => i.prodId === id ? { ...i, qty: clamp(input.value) } : i));
      openCart();
    });
    dlg.querySelectorAll("[data-del]").forEach(btn => btn.onclick = () => {
      const id = rows[btn.dataset.del].prodId;
      saveCart(getCart().filter(i => i.prodId !== id));
      openCart();
    });
    dlg.querySelector(".pay").onclick = openCheckout;
  }

  // ---------- Thanh toán ----------
  function openCheckout() {
    const u = user();
    if (!u) return goLogin();
    const rows = cartRows();
    if (!rows.length) return openCart();

    const dlg = show("Thông tin giao hàng", `
      <form>
        ${row("Họ tên người nhận", 'name="receiverName" required')}
        ${row("Số điện thoại", 'name="receiverPhone" type="tel" required')}
        ${row("Địa chỉ giao hàng", 'name="address" required')}
        <p class="pay-title">Hình thức thanh toán</p>
        <div class="pay-options">
          <label><input type="radio" name="payment" value="Tiền mặt (COD)" checked> Thanh toán khi nhận hàng (COD)</label>
          <label><input type="radio" name="payment" value="Chuyển khoản"> Chuyển khoản</label>
        </div>
        <h3 class="total">Tổng tiền: ${formatCurrency(sum(rows))}</h3>
        <p class="msg"></p>
        <div class="actions">
          <button type="button" class="back secondary">Quay lại giỏ hàng</button>
          <button>Xác nhận đặt hàng</button>
        </div>
      </form>`);

    fill(dlg, { receiverName: u.name, receiverPhone: u.phone, address: u.address });
    dlg.querySelector(".back").onclick = openCart;
    dlg.querySelector("form").onsubmit = e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      if (!PHONE.test(f.receiverPhone.trim())) return say(e.target, "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.");

      const orders = load("orders", []);
      // Cùng cấu trúc với SEED_DATA.orders (thêm userId để tra cứu lịch sử)
      const order = {
        id: nextId(orders, "DH"),
        userId: u.id || null,
        customerName: u.name,
        customerPhone: u.phone || f.receiverPhone.trim(),
        receiverName: f.receiverName.trim(),
        receiverPhone: f.receiverPhone.trim(),
        address: f.address.trim(),
        date: today(),
        payment: f.payment,
        status: "new",
        items: rows.map(i => ({ prodId: i.prodId, name: i.product.name, price: i.price, qty: i.qty })),
        total: sum(rows)
      };
      orders.push(order);
      save("orders", orders);
      saveCart([]);

      const done = show("Đặt hàng thành công", `
        <div class="center">
          <div class="success-icon">✓</div>
          <p>Mã đơn hàng: <b>${order.id}</b></p>
          <p>Tổng thanh toán: <b>${formatCurrency(order.total)}</b></p>
          <p>${f.payment === "Chuyển khoản"
            ? "Vui lòng chuyển khoản với nội dung: " + order.id + ". Đơn sẽ được xử lý sau khi cửa hàng xác nhận."
            : "Bạn thanh toán khi nhận hàng (COD)."}</p>
          <div class="actions"><button class="hist">Xem lịch sử mua hàng</button></div>
        </div>`);
      done.querySelector(".hist").onclick = openOrders;
    };
  }

  // ---------- Lịch sử mua hàng ----------
  function openOrders() {
    const u = user();
    if (!u) return goLogin();
    const mine = load("orders", [])
      .filter(o => (u.id && o.userId === u.id) || (u.phone && o.customerPhone === u.phone))
      .reverse();

    if (!mine.length) return show("Lịch sử mua hàng", `<p class="empty">Bạn chưa có đơn hàng nào.</p>`);

    // Vẽ khung từng đơn trước, nội dung chữ gán sau bằng textContent
    const dlg = show("Lịch sử mua hàng", mine.map(() => `
      <details class="order">
        <summary></summary>
        <div class="lines"></div>
      </details>`).join(""));

    const details = dlg.querySelectorAll("details");
    mine.forEach((o, n) => {
      const d = details[n];
      d.dataset.status = o.status; // dùng để tô màu viền theo trạng thái
      d.querySelector("summary").textContent = `${o.id} - ${o.date} - ${formatCurrency(o.total)} - ${STATUS[o.status] || o.status}`;
      const lines = [
        ...o.items.map(i => `${i.name} x ${i.qty} = ${formatCurrency(i.price * i.qty)}`),
        `Giao đến: ${o.receiverName}${o.receiverPhone ? ", " + o.receiverPhone : ""}, ${o.address}`,
        `Thanh toán: ${o.payment}`
      ];
      d.querySelector(".lines").innerHTML = lines.map(() => "<p></p>").join("");
      fillText(d, ".lines p", lines);
    });
  }

  // ---------- Hồ sơ cá nhân ----------
  function openProfile() {
    const u = user();
    if (!u) return goLogin();

    const dlg = show("Hồ sơ cá nhân", `
      <form id="pf">
        ${row("Họ tên", 'name="name" required')}
        ${row("Số điện thoại", 'name="phone" type="tel"')}
        ${row("Email", 'name="email" type="email"')}
        ${row("Địa chỉ", 'name="address"')}
        <p class="msg"></p>
        <div class="actions"><button>Lưu thông tin</button></div>
      </form>
      <hr>
      <h3>Đổi mật khẩu</h3>
      <form id="pw">
        ${row("Mật khẩu hiện tại", 'name="old" type="password" required')}
        ${row("Mật khẩu mới", 'name="new" type="password" required')}
        ${row("Nhập lại mật khẩu mới", 'name="confirm" type="password" required')}
        <p class="msg"></p>
        <div class="actions"><button>Đổi mật khẩu</button></div>
      </form>
      <hr>
      <div class="actions"><button class="logout danger">Đăng xuất</button></div>`);

    fill(dlg.querySelector("#pf"), u); // tên ô trùng tên khóa của user: name, phone, email, address
    dlg.querySelector(".logout").onclick = logout;

    dlg.querySelector("#pf").onsubmit = e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      const phone = f.phone.trim(), email = f.email.trim();
      if (phone && !PHONE.test(phone)) return say(e.target, "Số điện thoại không hợp lệ.");
      const list = users();
      if (list.some(x => !same(x, u) && ((phone && x.phone === phone) || (email && x.email === email)))) {
        return say(e.target, "Số điện thoại hoặc email đã được tài khoản khác sử dụng.");
      }
      const me = list.find(x => same(x, u));
      Object.assign(me, { name: f.name.trim(), phone, email, address: f.address.trim() });
      save("users", list);
      login(me);
      say(e.target, "Đã cập nhật hồ sơ.", true);
    };

    dlg.querySelector("#pw").onsubmit = e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      const list = users();
      const me = list.find(x => same(x, u));
      if (me.password !== f.old) return say(e.target, "Mật khẩu hiện tại không đúng.");
      if (f.new.length < 3) return say(e.target, "Mật khẩu mới tối thiểu 3 ký tự.");
      if (f.new !== f.confirm) return say(e.target, "Mật khẩu nhập lại không khớp.");
      me.password = f.new;
      save("users", list);
      login(me);
      e.target.reset();
      say(e.target, "Đã đổi mật khẩu.", true);
    };
  }

  // ---------- Gắn vào menu bên trái và header có sẵn ----------
  const views = { cart: openCart, orders: openOrders, profile: openProfile };
  const pages = { "cart.html": openCart, "order-history.html": openOrders, "profile.html": openProfile };

  // Bắt click ở cấp document vì header được vẽ lại bằng renderHeader()
  document.addEventListener("click", e => {
    if (e.target.closest("#btn-user-logout")) sessionStorage.removeItem(SESSION); // header chỉ xóa localStorage
    const a = e.target.closest("a");
    const open = a && (views[a.dataset.link] || pages[a.getAttribute("href")]);
    if (open) { e.preventDefault(); open(); }
  }, true);

  const view = new URLSearchParams(location.search).get("view");
  if (views[view]) views[view]();

  window.Shop = { addToCart };
})();
