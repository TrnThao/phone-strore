
/* Shared product catalog and persistent storage for the customer app. */

export const KEY = {
  products: 'phoneStoreProducts',
  users: 'phoneStoreUsers',
  user: 'currentUser',
  carts: 'phoneStoreCarts',
  orders: 'phoneStoreOrders'
};

export const SEED = [
  {
    id: 'SP01',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 28990000,
    image: 'assets/images/ip15prmm.png',
    spec: '256GB · 6.7 inch · A17 Pro'
  },
  {
    id: 'SP02',
    name: 'iPhone 15',
    brand: 'Apple',
    price: 17990000,
    image: 'assets/images/ip15.png',
    spec: '128GB · 6.1 inch · A16 Bionic'
  },
  {
    id: 'SP03',
    name: 'iPhone 13',
    brand: 'Apple',
    price: 11990000,
    image: 'assets/images/ip13.png',
    spec: '128GB · 6.1 inch · A15 Bionic'
  },
  {
    id: 'SP04',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 26990000,
    image: 'assets/images/s24ultra.png',
    spec: '256GB · 6.8 inch · Snapdragon 8 Gen 3'
  },
  {
    id: 'SP05',
    name: 'Samsung Galaxy Z Fold5',
    brand: 'Samsung',
    price: 25990000,
    image: 'assets/images/zfold5.jpg',
    spec: '256GB · Màn hình gập 7.6 inch'
  },
  {
    id: 'SP06',
    name: 'Samsung Galaxy A55',
    brand: 'Samsung',
    price: 8990000,
    image: 'assets/images/a55.png',
    spec: '128GB · 6.6 inch'
  },
  {
    id: 'SP07',
    name: 'Xiaomi 14',
    brand: 'Xiaomi',
    price: 16990000,
    image: 'assets/images/xom14.png',
    spec: '256GB · 6.36 inch · Snapdragon 8 Gen 3'
  }
];

export function get(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

export function put(key, v) {
  localStorage.setItem(key, JSON.stringify(v));
}

if (!localStorage.getItem(KEY.products)) {
  put(KEY.products, SEED);
}

export const money = n =>
  Number(n).toLocaleString('vi-VN') + ' ₫';

export const esc = s =>
  String(s ?? '').replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c])
  );

export const user = () => get(KEY.user, null);

export const products = () => get(KEY.products, SEED);

export const cartId = () => user()?.id || 'guest';

export const cart = () =>
  get(KEY.carts, {})[cartId()] || [];

export function setCart(items) {
  const all = get(KEY.carts, {});
  all[cartId()] = items;
  put(KEY.carts, all);
}

export const product = id =>
  products().find(p => String(p.id) === String(id));
