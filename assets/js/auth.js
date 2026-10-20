if (!localStorage.getItem('users')) {
  if (typeof SEED_DATA !== 'undefined' && SEED_DATA.users) {
    localStorage.setItem('users', JSON.stringify(SEED_DATA.users));
  }
}
const DangNhap = document.querySelector('.login');
if (DangNhap) {
  DangNhap.addEventListener('submit', function (e) {
    e.preventDefault();

    const userName = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => (u.name === userName || u.phone === userName || u.email === userName) && u.password === password);

    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      if (user.name === 'admin') {
        window.location.href = 'admin/admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      alert("Đăng nhập thất bại!");
    }
  });
}
document.addEventListener('DOMContentLoaded', function () {
  const userDangNhap = sessionStorage.getItem('currentUser');
  const nutDangNhap = document.getElementById('dangnhap');
  const hienThiND = document.getElementById('HienThiND');
  const nutDangXuat = document.getElementById('DangXuat');
  const hienThiTen = document.getElementById('HienThiTen');

  if (userDangNhap && nutDangNhap && hienThiND && hienThiTen) {
    const current = JSON.parse(userDangNhap); 

    nutDangNhap.style.display = 'none';
    hienThiND.style.display = 'inline-block';

    hienThiTen.textContent = current.name || current.username;
  }

  if (nutDangXuat) {
    nutDangXuat.addEventListener('click', function () {
    sessionStorage.removeItem('currentUser');
    alert('Đã đăng xuất thành công!');
    window.location.reload();
    });
  }
});


