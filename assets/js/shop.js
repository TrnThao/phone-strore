// ========================================
// shop.js - Giỏ hàng, Thanh toán, Đơn hàng, Tài khoản
// ========================================
(function () {
  const USERS_KEY = "users";
  const SESSION_KEY = "currentUser";
  const ORDERS_KEY = "orders";

  const STATUS_LABEL = { new: "Mới", processed: "Đã xử lý", delivered: "Đã giao", cancelled: "Đã hủy" };
  const PAY_COD = "Tiền mặt (COD)";
  const PAY_BANK = "Chuyển khoản";

  // ---------- Tiện ích ----------
  const load = (k, fb) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const pad2 = n => String(n).padStart(2, "0");

  function h(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k === "style") e.style.cssText = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e[k] = v;
    }
    for (const c of kids.flat()) if (c != null) e.append(c);
    return e;
  }

  // ---------- Phiên đăng nhập ----------
  const getUsers = () => load(USERS_KEY, []);
  const sameUser = (a, b) => (a.id || b.id) ? a.id === b.id : a.name === b.name;

  function currentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      return getUsers().find(u => sameUser(u, s)) || null;
    } catch { return null; }
  }
  // auth.js dùng sessionStorage, renderHeader() của main.js lại đọc localStorage -> ghi cả hai cho đồng bộ.
  function setSession(u) {
    const s = JSON.stringify(u);
    sessionStorage.setItem(SESSION_KEY, s);
    localStorage.setItem(SESSION_KEY, s);
    refreshHeader();
  }
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
  function refreshHeader() {
    if (typeof renderHeader === "function") renderHeader();
    if (typeof updateCartBadge === "function") updateCartBadge();
  }
  function logout() {
    clearSession();
    closeDialog();
    refreshHeader();
  }

  // Đăng nhập ở login.html (auth.js) chỉ ghi sessionStorage -> chép sang localStorage để header hiện đúng tên.
  if (sessionStorage.getItem(SESSION_KEY) && !localStorage.getItem(SESSION_KEY)) {
    localStorage.setItem(SESSION_KEY, sessionStorage.getItem(SESSION_KEY));
  }

  // ---------- Dialog chung ----------
  function closeDialog() {
    document.getElementById("shop-dialog")?.remove();
  }
  function openDialog(title, ...body) {
    closeDialog();
    const dlg = h("dialog", { id: "shop-dialog", style: "max-width:720px;width:92%;padding:16px" },
      h("button", { type: "button", textContent: "X", style: "float:right", onclick: closeDialog }),
      h("h2", { textContent: title }),
      ...body);
    dlg.addEventListener("close", () => dlg.remove());
    document.body.appendChild(dlg);
    dlg.showModal();
    return dlg;
  }
  const field = (label, input) => h("label", { style: "display:block;margin:8px 0" }, label, h("br"), input);
  const msgBox = () => h("p", { style: "color:#c00;min-height:1.2em", role: "alert" });

  // ---------- Giỏ hàng (dùng getCart/saveCart của main.js, khóa "userCart") ----------
  const clampQty = n => Math.min(99, Math.max(1, Math.floor(Number(n)) || 1));

  function addToCart(prodId, qty = 1) {
    if (!currentUser()) {
      document.getElementById("product-detail-dialog")?.close();
      openLogin(() => addToCart(prodId, qty));
      return false;
    }
    const cart = getCart();
    const line = cart.find(i => String(i.prodId) === String(prodId));
    if (line) line.qty = clampQty(line.qty + qty);
    else cart.push({ prodId, qty: clampQty(qty) });
    saveCart(cart);
    return true;
  }

  function cartDetail() {
    // Bỏ qua sản phẩm đã bị ẩn / xóa
    return getCart()
      .map(i => ({ ...i, product: products.find(p => String(p.id) === String(i.prodId) && p.status !== false) }))
      .filter(i => i.product)
      .map(i => ({ ...i, price: getProductPrice(i.product) }));
  }

  function openCart() {
    if (!currentUser()) return openLogin(openCart);
    const rows = cartDetail();
    // Dọn các dòng không còn bán khỏi giỏ
    if (rows.length !== getCart().length) saveCart(rows.map(i => ({ prodId: i.prodId, qty: i.qty })));

    if (!rows.length) return openDialog("Giỏ hàng", h("p", { textContent: "Giỏ hàng đang trống." }));

    const total = rows.reduce((s, i) => s + i.price * i.qty, 0);
    const table = h("table", { style: "width:100%;border-collapse:collapse" },
      h("tr", {}, ...["Sản phẩm", "Đơn giá", "Số lượng", "Thành tiền", ""].map(t => h("th", { textContent: t, style: "text-align:left" }))),
      ...rows.map(i => h("tr", {},
        h("td", { textContent: i.product.name }),
        h("td", { textContent: formatCurrency(i.price) }),
        h("td", {}, h("input", {
          type: "number", min: 1, max: 99, value: i.qty, style: "width:64px",
          onchange: e => {
            const cart = getCart();
            const line = cart.find(x => String(x.prodId) === String(i.prodId));
            if (line) line.qty = clampQty(e.target.value);
            saveCart(cart);
            openCart();
          }
        })),
        h("td", { textContent: formatCurrency(i.price * i.qty) }),
        h("td", {}, h("button", {
          type: "button", textContent: "Xóa",
          onclick: () => {
            saveCart(getCart().filter(x => String(x.prodId) !== String(i.prodId)));
            openCart();
          }
        }))
      )));

    openDialog("Giỏ hàng", table,
      h("h3", { textContent: "Tổng tiền: " + formatCurrency(total) }),
      h("button", { type: "button", textContent: "Thanh toán", onclick: openCheckout }));
  }

  // ---------- Thanh toán ----------
  function nextOrderId(orders) {
    const max = orders.reduce((m, o) => {
      const r = /^DH(\d+)$/.exec(o.id || "");
      return r ? Math.max(m, Number(r[1])) : m;
    }, 0);
    return "DH" + pad2(max + 1);
  }

  function openCheckout() {
    const user = currentUser();
    if (!user) return openLogin(openCheckout);
    const rows = cartDetail();
    if (!rows.length) return openCart();
    const total = rows.reduce((s, i) => s + i.price * i.qty, 0);

    const name = h("input", { type: "text", required: true, value: user.name || "" });
    const phone = h("input", { type: "tel", required: true, value: user.phone || "", placeholder: "0912345678" });
    const address = h("input", { type: "text", required: true, value: user.address || "" });
    const pay = value => h("input", { type: "radio", name: "payment", value, checked: value === PAY_COD });
    const err = msgBox();

    const form = h("form", {
      onsubmit: e => {
        e.preventDefault();
        if (!/^0\d{9}$/.test(phone.value.trim())) { err.textContent = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0."; return; }
        const payment = form.querySelector("input[name=payment]:checked").value;
        const orders = load(ORDERS_KEY, []);
        // Cùng cấu trúc với đơn mẫu trong SEED_DATA.orders (thêm userId để tra cứu lịch sử)
        const order = {
          id: nextOrderId(orders),
          userId: user.id || null,
          customerName: user.name,
          customerPhone: user.phone || phone.value.trim(),
          receiverName: name.value.trim(),
          receiverPhone: phone.value.trim(),
          address: address.value.trim(),
          date: new Date().toLocaleDateString("sv-SE"),
          payment,
          status: "new",
          items: rows.map(i => ({ prodId: i.prodId, name: i.product.name, price: i.price, qty: i.qty })),
          total
        };
        orders.push(order);
        save(ORDERS_KEY, orders);
        saveCart([]);
        openDialog("Đặt hàng thành công",
          h("p", { textContent: "Mã đơn hàng: " + order.id }),
          h("p", { textContent: "Tổng thanh toán: " + formatCurrency(total) }),
          payment === PAY_BANK
            ? h("p", { textContent: "Vui lòng chuyển khoản với nội dung: " + order.id + ". Đơn sẽ được xử lý sau khi cửa hàng xác nhận." })
            : h("p", { textContent: "Bạn thanh toán khi nhận hàng (COD)." }),
          h("button", { type: "button", textContent: "Xem lịch sử mua hàng", onclick: openOrders }));
      }
    },
      field("Họ tên người nhận", name),
      field("Số điện thoại", phone),
      field("Địa chỉ giao hàng", address),
      h("div", { style: "margin:8px 0" }, "Hình thức thanh toán",
        h("br"),
        h("label", {}, pay(PAY_COD), " Thanh toán khi nhận hàng (COD) "),
        h("label", {}, pay(PAY_BANK), " Chuyển khoản")),
      h("h3", { textContent: "Tổng tiền: " + formatCurrency(total) }),
      err,
      h("button", { type: "submit", textContent: "Xác nhận đặt hàng" }),
      " ",
      h("button", { type: "button", textContent: "Quay lại giỏ hàng", onclick: openCart }));

    openDialog("Thông tin giao hàng", form);
  }

  // ---------- Lịch sử mua hàng ----------
  function openOrders() {
    const user = currentUser();
    if (!user) return openLogin(openOrders);
    const mine = load(ORDERS_KEY, [])
      .filter(o => (user.id && o.userId === user.id) || (user.phone && o.customerPhone === user.phone))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id)));

    if (!mine.length) return openDialog("Lịch sử mua hàng", h("p", { textContent: "Bạn chưa có đơn hàng nào." }));

    openDialog("Lịch sử mua hàng", ...mine.map(o => h("details", { style: "margin:8px 0;border:1px solid #ccc;padding:8px" },
      h("summary", { textContent: `${o.id} - ${o.date} - ${formatCurrency(o.total)} - ${STATUS_LABEL[o.status] || o.status}` }),
      ...o.items.map(i => h("p", { textContent: `${i.name} x ${i.qty} = ${formatCurrency(i.price * i.qty)}`, style: "margin:4px 0" })),
      h("p", { textContent: `Giao đến: ${o.receiverName}${o.receiverPhone ? ", " + o.receiverPhone : ""}, ${o.address}` }),
      h("p", { textContent: "Thanh toán: " + o.payment }))));
  }

  // ---------- Đăng nhập / Đăng ký ----------
  function openLogin(onDone, mode = "login") {
    const err = msgBox();
    const ident = h("input", { type: "text", required: true, autocomplete: "username", placeholder: "Tên, số điện thoại hoặc email" });
    const password = h("input", { type: "password", required: true, autocomplete: mode === "login" ? "current-password" : "new-password" });
    const extra = [];
    let fullName, phone, email, address, confirm;
    if (mode === "register") {
      fullName = h("input", { type: "text", required: true });
      phone = h("input", { type: "tel", required: true, placeholder: "0912345678" });
      email = h("input", { type: "email" });
      address = h("input", { type: "text", required: true });
      confirm = h("input", { type: "password", required: true });
      extra.push(field("Họ tên", fullName), field("Số điện thoại", phone), field("Email (không bắt buộc)", email),
        field("Địa chỉ", address), field("Nhập lại mật khẩu", confirm));
    }

    const form = h("form", {
      onsubmit: e => {
        e.preventDefault();
        const users = getUsers();
        if (mode === "login") {
          const key = ident.value.trim();
          // Cùng điều kiện với auth.js: tên / số điện thoại / email + mật khẩu
          const u = users.find(x => (x.name === key || x.phone === key || x.email === key) && x.password === password.value);
          if (!u) { err.textContent = "Sai thông tin đăng nhập hoặc mật khẩu."; return; }
          if (u.status === false) { err.textContent = "Tài khoản đã bị khóa."; return; }
          setSession(u);
        } else {
          const ph = phone.value.trim();
          const em = email.value.trim();
          if (!/^0\d{9}$/.test(ph)) { err.textContent = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0."; return; }
          if (password.value.length < 3) { err.textContent = "Mật khẩu tối thiểu 3 ký tự."; return; }
          if (password.value !== confirm.value) { err.textContent = "Mật khẩu nhập lại không khớp."; return; }
          if (users.some(x => x.phone === ph || (em && x.email === em))) { err.textContent = "Số điện thoại hoặc email đã được đăng ký."; return; }
          const maxId = users.reduce((m, x) => {
            const r = /^KH(\d+)$/.exec(x.id || "");
            return r ? Math.max(m, Number(r[1])) : m;
          }, 0);
          const u = {
            id: "KH" + pad2(maxId + 1),
            name: fullName.value.trim(),
            email: em,
            phone: ph,
            password: password.value,
            address: address.value.trim(),
            registerDate: new Date().toLocaleDateString("sv-SE"),
            status: true
          };
          users.push(u);
          save(USERS_KEY, users);
          setSession(u);
        }
        closeDialog();
        (onDone || (() => { }))();
      }
    },
      mode === "login" ? field("Tên đăng nhập / SĐT / Email", ident) : null,
      mode === "login" ? field("Mật khẩu", password) : null,
      ...(mode === "register" ? [...extra.slice(0, 3), field("Mật khẩu", password), ...extra.slice(3)] : []),
      err,
      h("button", { type: "submit", textContent: mode === "login" ? "Đăng nhập" : "Đăng ký" }),
      " ",
      h("button", {
        type: "button",
        textContent: mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập",
        onclick: () => openLogin(onDone, mode === "login" ? "register" : "login")
      }));

    openDialog(mode === "login" ? "Đăng nhập" : "Đăng ký tài khoản", form);
  }

  // ---------- Hồ sơ cá nhân ----------
  function openProfile() {
    const user = currentUser();
    if (!user) return openLogin(openProfile);

    const name = h("input", { type: "text", required: true, value: user.name || "" });
    const phone = h("input", { type: "tel", value: user.phone || "" });
    const email = h("input", { type: "email", value: user.email || "" });
    const address = h("input", { type: "text", value: user.address || "" });
    const err1 = msgBox();

    const profileForm = h("form", {
      onsubmit: e => {
        e.preventDefault();
        err1.style.color = "#c00";
        const ph = phone.value.trim();
        const em = email.value.trim();
        if (ph && !/^0\d{9}$/.test(ph)) { err1.textContent = "Số điện thoại không hợp lệ."; return; }
        const users = getUsers();
        if (users.some(x => !sameUser(x, user) && ((ph && x.phone === ph) || (em && x.email === em)))) {
          err1.textContent = "Số điện thoại hoặc email đã được tài khoản khác sử dụng."; return;
        }
        const u = users.find(x => sameUser(x, user));
        u.name = name.value.trim(); u.phone = ph; u.email = em; u.address = address.value.trim();
        save(USERS_KEY, users);
        setSession(u);
        err1.style.color = "green";
        err1.textContent = "Đã cập nhật hồ sơ.";
      }
    },
      field("Họ tên", name), field("Số điện thoại", phone), field("Email", email), field("Địa chỉ", address),
      err1,
      h("button", { type: "submit", textContent: "Lưu thông tin" }));

    const oldPw = h("input", { type: "password", required: true, autocomplete: "current-password" });
    const newPw = h("input", { type: "password", required: true, autocomplete: "new-password" });
    const cfPw = h("input", { type: "password", required: true, autocomplete: "new-password" });
    const err2 = msgBox();

    const pwForm = h("form", {
      onsubmit: e => {
        e.preventDefault();
        err2.style.color = "#c00";
        const users = getUsers();
        const u = users.find(x => sameUser(x, user));
        if (u.password !== oldPw.value) { err2.textContent = "Mật khẩu hiện tại không đúng."; return; }
        if (newPw.value.length < 3) { err2.textContent = "Mật khẩu mới tối thiểu 3 ký tự."; return; }
        if (newPw.value !== cfPw.value) { err2.textContent = "Mật khẩu nhập lại không khớp."; return; }
        u.password = newPw.value;
        save(USERS_KEY, users);
        setSession(u);
        pwForm.reset();
        err2.style.color = "green";
        err2.textContent = "Đã đổi mật khẩu.";
      }
    },
      field("Mật khẩu hiện tại", oldPw), field("Mật khẩu mới", newPw), field("Nhập lại mật khẩu mới", cfPw),
      err2,
      h("button", { type: "submit", textContent: "Đổi mật khẩu" }));

    openDialog("Hồ sơ cá nhân", profileForm, h("hr"), h("h3", { textContent: "Đổi mật khẩu" }), pwForm, h("hr"),
      h("button", { type: "button", textContent: "Đăng xuất", onclick: logout }));
  }

  // ---------- Gắn vào menu bên trái và header có sẵn (giữ nguyên giao diện) ----------
  const views = { cart: openCart, orders: openOrders, profile: openProfile };
  const hrefViews = { "cart.html": openCart, "order-history.html": openOrders, "profile.html": openProfile };

  // Bắt click ở cấp document vì header được vẽ lại bằng renderHeader()
  document.addEventListener("click", e => {
    const logoutBtn = e.target.closest?.("#btn-user-logout");
    if (logoutBtn) { sessionStorage.removeItem(SESSION_KEY); return; } // handler của header chỉ xóa localStorage

    const a = e.target.closest?.("a");
    if (!a) return;
    const open = views[a.dataset.link] || hrefViews[a.getAttribute("href")];
    if (open) { e.preventDefault(); open(); }
  }, true);

  const initial = new URLSearchParams(location.search).get("view");
  if (views[initial]) views[initial]();

  window.Shop = { addToCart, openCart, openOrders, openProfile, openLogin, logout, currentUser };
})();
