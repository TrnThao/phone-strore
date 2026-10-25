
const params = new URLSearchParams(location.search);

let register = params.get('mode') === 'register';

const f = document.querySelector('#auth');

function draw() {
  document.querySelector('#title').textContent =
    register ? 'Đăng ký' : 'Đăng nhập';

  document.querySelector('#submit').textContent =
    register ? 'Tạo tài khoản' : 'Đăng nhập';

  document.querySelector('#extra').hidden = !register;

  f.elements.name.required = register;
  f.elements.phone.required = register;

  document.querySelector('#switch').innerHTML = register
    ? 'Đã có tài khoản? <a href="login.html">Đăng nhập</a>'
    : 'Chưa có tài khoản? <a href="login.html?mode=register">Đăng ký</a>';
}

draw();

f.addEventListener('submit', e => {
  e.preventDefault();

  const email = f.elements.email.value.trim().toLowerCase();
  const password = f.elements.password.value;

  const users = JSON.parse(
    localStorage.getItem('phoneStoreUsers') || '[]'
  );

  const msg = document.querySelector('#msg');

  let u;

  if (register) {
    const name = f.elements.name.value.trim();
    const phone = f.elements.phone.value.trim();

    if (!name || !/^[0-9]{9,11}$/.test(phone)) {
      msg.textContent =
        'Vui lòng nhập họ tên và số điện thoại hợp lệ';
      return;
    }

    if (users.some(x => x.email.toLowerCase() === email)) {
      msg.textContent = 'Email đã tồn tại';
      return;
    }

    u = {
      id: 'U-' + Date.now(),
      name,
      email,
      phone,
      address: '',
      password
    };

    users.push(u);

    localStorage.setItem(
      'phoneStoreUsers',
      JSON.stringify(users)
    );

  } else {
    u = users.find(
      x =>
        x.email.toLowerCase() === email &&
        x.password === password
    );

    if (!u) {
      msg.textContent =
        'Thông tin đăng nhập không chính xác';
      return;
    }
  }

  localStorage.setItem(
    'currentUser',
    JSON.stringify({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address
    })
  );

  const wanted = params.get('return');

  const target =
    wanted &&
    /^products\.html\?view=(cart|orders|profile|products)(?:&|$)/.test(wanted)
      ? wanted
      : 'products.html?view=products';

  location.href = target;
});
