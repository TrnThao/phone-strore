
'use strict';

// Ứng dụng demo tự chứa: không cần tải JS/CSS từ bên ngoài.
import {
  KEY, get, put, money, esc,
  user, products, cart, setCart, product
} from "../core/store.js";

// ========================================
// 1. THÔNG BÁO
// ========================================

function feedback(message, bad = false) {
  const el = document.querySelector('#feedback');

  el.innerHTML = `
    <p class="notice ${bad ? 'error' : ''}">
      ${esc(message)}
    </p>
  `;

  setTimeout(() => {
    if (el.textContent === message) {
      el.innerHTML = '';
    }
  }, 5000);
}

// ========================================
// 2. ĐIỀU HƯỚNG
// ========================================

function go(view, id) {
  const url = new URL(location.href);

  url.searchParams.set('view', view);

  if (id) {
    url.searchParams.set('id', id);
  } else {
    url.searchParams.delete('id');
  }

  history.pushState({}, '', url);
  route();
}

// ========================================
// 3. HEADER VÀ GIỎ HÀNG
// ========================================

function header() {
  const u = user();

  document.querySelector('#user-status').innerHTML = u
    ? `<a href="?view=profile">
         ${esc(u.name || u.email || 'Tài khoản')}
       </a>`
    : '<a href="login.html">Đăng nhập</a>';

  document.querySelector('#logout').hidden = !u;

  document.querySelector('#cart-count').textContent =
    cart().reduce((s, i) => s + i.qty, 0);
}

// ========================================
// 4. ROUTER
// ========================================

function route() {
  const q = new URLSearchParams(location.search);

  let view = q.get('view') || 'products';

  if (
    !['products', 'detail', 'cart', 'orders', 'profile']
      .includes(view)
  ) {
    view = 'products';
  }

  if (
    ['orders', 'profile'].includes(view) &&
    !user()
  ) {
    location.href =
      'login.html?return=' +
      encodeURIComponent('products.html?view=' + view);
    return;
  }

  document.querySelectorAll(
    'main section[id^="view-"]'
  ).forEach(s => {
    s.hidden = s.id !== 'view-' + view;
  });

  document.querySelectorAll('[data-link]').forEach(a => {
    const active =
      a.dataset.link ===
      (view === 'detail' ? 'products' : view);

    a.classList.toggle('active', active);

    if (active) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });

  header();

  if (view === 'products') renderProducts();
  if (view === 'detail') renderDetail(q.get('id'));
  if (view === 'cart') renderCart();
  if (view === 'orders') renderOrders();
  if (view === 'profile') renderProfile();
}

// ========================================
// 5. DANH SÁCH VÀ TÌM KIẾM SẢN PHẨM
// ========================================

let page = 1;

const PAGE_SIZE = 6;

function renderProducts() {
  const q = document.querySelector('#fQ')
    .value.trim().toLowerCase();

  const brand =
    document.querySelector('#categoryFilter').value;

  const min = Number(
    document.querySelector('#price-min').value || 0
  );

  const maxRaw =
    document.querySelector('#price-max').value;

  const max =
    maxRaw === '' ? Infinity : Number(maxRaw);

  const result = products().filter(p =>
    p.name.toLowerCase().includes(q) &&
    (!brand || p.brand === brand) &&
    p.price >= min &&
    p.price <= max
  );

  const pages = Math.max(
    1,
    Math.ceil(result.length / PAGE_SIZE)
  );

  page = Math.min(page, pages);

  document.querySelector('#product-list').innerHTML =
    result.length
      ? result
          .slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE
          )
          .map(p => `
            <article class="product">
              <div class="product-image">
                <img
                  src="${esc(p.image)}"
                  alt="${esc(p.name)}"
                  loading="lazy"
                >
              </div>

              <h3>${esc(p.name)}</h3>

              <div class="muted">
                ${esc(p.brand)}
              </div>

              <div class="price">
                ${money(p.price)}
              </div>

              <div class="actions">
                <button class="btn alt"
                        data-detail="${esc(p.id)}">
                  Chi tiết
                </button>

                <button class="btn"
                        data-add="${esc(p.id)}">
                  Thêm giỏ
                </button>
              </div>
            </article>
          `)
          .join('')
      : `<div class="empty">
           Không tìm thấy sản phẩm phù hợp.
         </div>`;

  document.querySelector('#pager').innerHTML = `
    <button class="btn alt" id="prev"
            ${page <= 1 ? 'disabled' : ''}>
      Trước
    </button>

    <span>
      Trang ${page}/${pages} · ${result.length} sản phẩm
    </span>

    <button class="btn alt" id="next"
            ${page >= pages ? 'disabled' : ''}>
      Sau
    </button>
  `;
}

// ========================================
// 6. CHI TIẾT SẢN PHẨM
// ========================================

function renderDetail(id) {
  const p = product(id);

  document.querySelector(
    '#product-detail-container'
  ).innerHTML = p
    ? `
      <div class="detail">
        <div class="product-image detail-image">
          <img
            src="${esc(p.image)}"
            alt="${esc(p.name)}"
          >
        </div>

        <div>
          <h1>${esc(p.name)}</h1>

          <p>
            Hãng:
            <strong>${esc(p.brand)}</strong>
          </p>

          <p class="price">${money(p.price)}</p>

          <h2>Cấu hình</h2>

          <p>${esc(p.spec || 'Đang cập nhật')}</p>

          <button class="btn"
                  data-add="${esc(p.id)}">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    `
    : `
      <div class="empty">
        Không tìm thấy sản phẩm.
        <a href="?view=products">Quay lại</a>
      </div>
    `;
}

// ========================================
// 7. THÊM SẢN PHẨM VÀO GIỎ
// ========================================

function add(id) {
  const p = product(id);

  if (!p) {
    return feedback('Sản phẩm không tồn tại', true);
  }

  const items = cart();
  const found = items.find(i => i.id === id);

  if (found) {
    found.qty = Math.min(99, found.qty + 1);
  } else {
    items.push({ id, qty: 1 });
  }

  setCart(items);
  header();

  feedback('Đã thêm sản phẩm vào giỏ hàng');
}

// ========================================
// 8. HIỂN THỊ GIỎ HÀNG
// ========================================

function renderCart() {
  const items = cart().filter(i => product(i.id));

  const total = items.reduce(
    (s, i) => s + product(i.id).price * i.qty,
    0
  );

  document.querySelector('#cart-list').innerHTML =
    items.length
      ? `
        <div class="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              ${items.map(i => {
                const p = product(i.id);

                return `
                  <tr>
                    <td>${esc(p.name)}</td>

                    <td>${money(p.price)}</td>

                    <td>
                      <input
                        class="input quantity"
                        data-qty="${esc(i.id)}"
                        type="number"
                        min="1"
                        max="99"
                        value="${i.qty}"
                      >
                    </td>

                    <td>${money(p.price * i.qty)}</td>

                    <td>
                      <button class="btn danger"
                              data-remove="${esc(i.id)}">
                        Xóa
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <strong>Tổng cộng: ${money(total)}</strong>
        </div>
      `
      : `
        <div class="empty">
          Giỏ hàng đang trống.
          <a href="?view=products">Xem sản phẩm</a>
        </div>
      `;

  document.querySelector('#checkout-form').hidden =
    !items.length;

  const u = user();
  const form = document.querySelector('#checkout-form');

  if (u && !form.dataset.filled) {
    form.elements.recipient.value = u.name || '';
    form.elements.phone.value = u.phone || '';
    form.elements.address.value = u.address || '';

    form.dataset.filled = '1';
  }
}

// ========================================
// 9. LỊCH SỬ ĐƠN HÀNG
// ========================================

function renderOrders() {
  const uid = user()?.id;

  const entries = get(KEY.orders, [])
    .filter(o => o.userId === uid)
    .sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

  document.querySelector('#order-list').innerHTML =
    entries.length
      ? entries.map(o => `
        <article class="order">
          <p>
            <strong>${esc(o.id)}</strong>
            <span class="tag">${esc(o.status)}</span>
          </p>

          <p class="muted">
            ${new Date(o.createdAt).toLocaleString('vi-VN')}
          </p>

          <p>
            ${o.items.map(i =>
              `${esc(i.name)} × ${i.qty}`
            ).join(' · ')}
          </p>

          <p>
            Người nhận:
            ${esc(o.recipient)} · ${esc(o.phone)}
          </p>

          <p>
            Địa chỉ: ${esc(o.address)}
          </p>

          <strong>${money(o.total)}</strong>
          · ${esc(o.payment)}
        </article>
      `).join('')
      : `
        <div class="empty">
          Bạn chưa có đơn hàng nào.
        </div>
      `;
}

// ========================================
// 10. HIỂN THỊ HỒ SƠ CÁ NHÂN
// ========================================

function renderProfile() {
  const u = user();

  if (!u) return;

  const f = document.querySelector('#profile-form');

  for (const k of [
    'name', 'email', 'phone', 'address'
  ]) {
    f.elements[k].value = u[k] || '';
  }

  f.elements.oldPassword.value = '';
  f.elements.newPassword.value = '';
}

// ========================================
// 11. KHỞI TẠO ỨNG DỤNG
// ========================================

function init() {
  const brands = [
    ...new Set(products().map(p => p.brand))
  ];

  document.querySelector('#categoryFilter')
    .insertAdjacentHTML(
      'beforeend',
      brands.map(b => `
        <option value="${esc(b)}">
          ${esc(b)}
        </option>
      `).join('')
    );

  // Tìm kiếm và lọc
  document.querySelector('#filter-form')
    .addEventListener('submit', e => {
      e.preventDefault();

      const min = Number(
        document.querySelector('#price-min').value || 0
      );

      const max =
        document.querySelector('#price-max').value;

      if (max !== '' && min > Number(max)) {
        return feedback(
          'Giá từ không thể lớn hơn giá đến',
          true
        );
      }

      page = 1;
      renderProducts();
    });

  // Xóa bộ lọc
  document.querySelector('#filter-reset')
    .addEventListener('click', () => {
      document.querySelector('#filter-form').reset();

      page = 1;
      renderProducts();
    });

  // Quay về danh sách sản phẩm
  document.querySelector('#back-products').onclick =
    () => go('products');

  // Đăng xuất
  document.querySelector('#logout').onclick = () => {
    localStorage.removeItem(KEY.user);
    location.href = 'index.html';
  };

  // ========================================
  // 12. XỬ LÝ SỰ KIỆN CLICK
  // ========================================

  document.addEventListener('click', e => {

    // Điều hướng giữa các view
    const a = e.target.closest('a[href^="?view="]');

    if (a) {
      e.preventDefault();

      const p = new URL(a.href);

      go(
        p.searchParams.get('view') || 'products',
        p.searchParams.get('id')
      );
      return;
    }

    // Xem chi tiết sản phẩm
    const d = e.target.closest('[data-detail]');

    if (d) {
      return go('detail', d.dataset.detail);
    }

    // Thêm vào giỏ hàng
    const addBtn = e.target.closest('[data-add]');

    if (addBtn) {
      return add(addBtn.dataset.add);
    }

    // Phân trang
    if (e.target.id === 'prev' && page > 1) {
      page--;
      renderProducts();
    }

    if (e.target.id === 'next') {
      page++;
      renderProducts();
    }

    // Xóa sản phẩm khỏi giỏ hàng
    const remove = e.target.closest('[data-remove]');

    if (remove) {
      setCart(
        cart().filter(
          i => i.id !== remove.dataset.remove
        )
      );

      header();
      renderCart();
    }
  });

  // ========================================
  // 13. THAY ĐỔI SỐ LƯỢNG GIỎ HÀNG
  // ========================================

  document.addEventListener('change', e => {
    if (e.target.matches('[data-qty]')) {
      const qty = Number(e.target.value);

      if (
        !Number.isInteger(qty) ||
        qty < 1 ||
        qty > 99
      ) {
        feedback(
          'Số lượng phải từ 1 đến 99',
          true
        );

        return renderCart();
      }

      const items = cart();

      const it = items.find(
        i => i.id === e.target.dataset.qty
      );

      if (it) {
        it.qty = qty;

        setCart(items);
        header();
        renderCart();
      }
    }
  });

  // ========================================
  // 14. THANH TOÁN VÀ TẠO ĐƠN HÀNG
  // ========================================

  document.querySelector('#checkout-form')
    .addEventListener('submit', e => {
      e.preventDefault();

      const u = user();

      if (!u) {
        location.href =
          'login.html?return=' +
          encodeURIComponent(
            'products.html?view=cart'
          );
        return;
      }

      const f = e.currentTarget;

      const recipient =
        f.elements.recipient.value.trim();

      const phone =
        f.elements.phone.value.trim();

      const address =
        f.elements.address.value.trim();

      if (
        !recipient ||
        !/^[0-9]{9,11}$/.test(phone) ||
        !address
      ) {
        return feedback(
          'Kiểm tra lại thông tin giao hàng',
          true
        );
      }

      const items = cart()
        .filter(i => product(i.id))
        .map(i => ({
          id: i.id,
          name: product(i.id).name,
          price: product(i.id).price,
          qty: i.qty
        }));

      if (!items.length) {
        return feedback('Giỏ hàng đang trống', true);
      }

      const total = items.reduce(
        (s, i) => s + i.price * i.qty,
        0
      );

      const confirmed = confirm(
        `Xác nhận đặt ${
          items.reduce((s, i) => s + i.qty, 0)
        } sản phẩm, tổng ${money(total)}?`
      );

      if (!confirmed) return;

      const order = {
        id: 'DH-' + Date.now(),
        userId: u.id,
        createdAt: new Date().toISOString(),
        recipient,
        phone,
        address,
        payment: 'COD',
        items,
        total,
        status: 'Mới đặt'
      };

      put(
        KEY.orders,
        [...get(KEY.orders, []), order]
      );

      setCart([]);
      header();

      delete f.dataset.filled;
      f.reset();

      go('orders');

      feedback('Đặt hàng thành công!');
    });

  // ========================================
  // 15. CẬP NHẬT HỒ SƠ VÀ ĐỔI MẬT KHẨU
  // ========================================

  document.querySelector('#profile-form')
    .addEventListener('submit', e => {
      e.preventDefault();

      const u = user();

      if (!u) return;

      const f = e.currentTarget;

      const name = f.elements.name.value.trim();

      const email = f.elements.email.value
        .trim().toLowerCase();

      const phone = f.elements.phone.value.trim();

      const address =
        f.elements.address.value.trim();

      const old = f.elements.oldPassword.value;
      const pwd = f.elements.newPassword.value;

      if (
        !name ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !/^[0-9]{9,11}$/.test(phone)
      ) {
        return feedback(
          'Thông tin cá nhân không hợp lệ',
          true
        );
      }

      const users = get(KEY.users, []);

      const idx = users.findIndex(
        x => x.id === u.id
      );

      if (idx < 0) {
        return feedback(
          'Không tìm thấy tài khoản; vui lòng đăng nhập lại',
          true
        );
      }

      if (
        users.some(
          x =>
            x.id !== u.id &&
            x.email.toLowerCase() === email
        )
      ) {
        return feedback(
          'Email đã được sử dụng',
          true
        );
      }

      if (
        pwd &&
        (!old || old !== users[idx].password)
      ) {
        return feedback(
          'Mật khẩu hiện tại không đúng',
          true
        );
      }

      Object.assign(users[idx], {
        name,
        email,
        phone,
        address
      });

      if (pwd) {
        users[idx].password = pwd;
      }

      put(KEY.users, users);

      put(KEY.user, {
        id: u.id,
        name,
        email,
        phone,
        address
      });

      header();
      renderProfile();

      feedback('Đã cập nhật hồ sơ');
    });

  // ========================================
  // 16. BACK / FORWARD TRÌNH DUYỆT
  // ========================================

  window.addEventListener('popstate', route);

  route();
}

// Khởi động ứng dụng
init();
