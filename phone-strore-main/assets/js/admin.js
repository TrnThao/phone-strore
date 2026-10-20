// Khởi tạo tài khoản Admin mặc định trong localStorage nếu chưa có
function initAdminAccount() {
    if (!localStorage.getItem('admin')) {
        const defaultAdmin = { username: 'admin', password: '123' };
        localStorage.setItem('admin', JSON.stringify(defaultAdmin));
    }
}

// Kiểm tra xem Admin đã đăng nhập trước đó chưa
function checkExistingAdminSession() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentAdmin) {
        window.location.href = 'dashboard.html';
    }
}

// Chạy khởi tạo
initAdminAccount();
checkExistingAdminSession();

// Xử lý đăng nhập khi người dùng bấm nút submit
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value;
            const errorElement = document.getElementById('adminError');

            const adminAccount = JSON.parse(localStorage.getItem('admin'));

            if (username === adminAccount.username && password === adminAccount.password) {
                localStorage.setItem('currentAdmin', JSON.stringify({
                    username: username,
                    role: 'admin',
                    loginTime: new Date().toISOString()
                }));

                alert('Đăng nhập Quản trị thành công!');
                window.location.href = 'dashboard.html';
            } else {
                errorElement.innerText = 'Tài khoản hoặc mật khẩu Quản trị không chính xác!';
                errorElement.style.display = 'block';
            }
        });
    }
});