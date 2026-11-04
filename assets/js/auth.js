if (!localStorage.getItem('users')) {
  if (typeof SEED_DATA !== 'undefined' && SEED_DATA.users) {
    localStorage.setItem('users', JSON.stringify(SEED_DATA.users));
  }
}
const DangNhap = document.querySelector('.dangki-login');
if (DangNhap) {
  DangNhap.addEventListener('submit', function (e) {
    e.preventDefault();

    const userName = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => (u.phone === userName || u.email === userName) && u.password === password);

    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      if (user.quyen === 'admin') {
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
  const nutDangKi = document.getElementById('dangki');
  const trang = document.querySelector('.container');

  if (nutDangKi) {
    nutDangKi.addEventListener('click', function(e) {
      e.preventDefault();
      trang.innerHTML = `
      <form class="dangki-login" id="dangki-login">
        <h1>Đăng kí</h1>
        <div class="dangki-login-form">
          <input type="text" id="ten" name="ten" placeholder="Họ và Tên">
        </div>
        <div class="dangki-login-form">
          <input type="text" id="username" name="username" placeholder="Nhập email hoặc số điện thoại">
        </div>
        <div class="dangki-login-form">
          <input type="password" id="password" name="password" placeholder="Mật khẩu">
        </div>
        <div class="dangki-login-form">
          <input type="text" id="diachi" name="diachi" placeholder="Địa chỉ">
        </div>
        <div class="dangki-login-form">
          <input type="text" id="sodienthoai" name="sodienthoai" placeholder="Số điện thoại">
        </div>
        
        <button type="submit" id="xacnhandangki">Đăng kí ngay</button>
        <button id="quaylaidangnhap" type="button">Quay lại đăng nhập</button>
      </form>`;

      const quayLai = document.getElementById('quaylaidangnhap');
      if (quayLai) {
        quayLai.addEventListener('click', function() {
          window.location.reload();
        });
      }


      const formDK = document.getElementById('dangki-login');
      if (formDK) {
        formDK.onsubmit = function(suKien) {
          suKien.preventDefault(); // Chặn tải lại trang
          
          const ten = document.getElementById('ten').value.trim();
          const email = document.getElementById('username').value.trim(); 
          const password = document.getElementById('password').value.trim();
          const diachi = document.getElementById('diachi').value.trim();
          const sodienthoai = document.getElementById('sodienthoai').value.trim();

          if(!ten || !email || !password || !sodienthoai) {
             alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
             return;
          }

          const danhsachUser = JSON.parse(localStorage.getItem('users')) || [];

          const kiemtra = danhsachUser.some(u => u.email === email || u.phone === sodienthoai);
          if (kiemtra) {
            alert('Email hoặc Số điện thoại này đã được đăng ký. Vui lòng đăng nhập!');
            return;
          }

          const newId = "KH" + (danhsachUser.length + 1).toString().padStart(2, '0');
          const homNay = new Date().toISOString().split('T')[0];

          const userNew = {
            id: newId,
            name: ten,
            email: email, 
            phone: sodienthoai,        
            password: password,
            address: diachi, 
            registerDate: homNay,
            status: true,
            quyen: "user"
          };
          
          // Thêm và lưu
          danhsachUser.push(userNew);
          localStorage.setItem('users', JSON.stringify(danhsachUser));
          
          alert("Chúc mừng bạn đã đăng ký thành công! Hãy đăng nhập nhé.");
          window.location.reload();
        };
      }
    });
  }
});

