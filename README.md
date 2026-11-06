# 📱 Đồ án Website Quản lý Cửa hàng Điện thoại (Phone Store Management)

Đồ án xây dựng hệ thống website thương mại điện tử và quản trị cửa hàng kinh doanh điện thoại di động, được chia thành 2 phân hệ chính (mỗi phân hệ chiếm 5.0 điểm). Dữ liệu được lưu trữ và mô phỏng hoàn toàn trên `localStorage`.

---

## 🏗️ 1. Cấu trúc thư mục dự án

```text
Phone-store/
├── .vscode/                # Cấu hình môi trường Visual Studio Code
├── admin/                  # Phân hệ Quản trị (Admin)
│   ├── admin.html          # Trang quản trị chính (Dashboard & CRUD)
│   └── login-admin.html    # Trang đăng nhập dành riêng cho Admin
├── assets/                 # Tài nguyên tĩnh
│   ├── css/
│   │   ├── admin.css       # CSS bảng điều khiển quản trị
│   │   ├── login-admin.css # CSS trang đăng nhập quản trị
│   │   ├── shop.css        # CSS hiển thị danh sách cửa hàng & giỏ hàng
│   │   └── style.css       # CSS giao diện người dùng chung
│   ├── images/             # Hình ảnh sản phẩm, banner, icon
│   └── js/
│       ├── admin.js        # Logic phân hệ quản trị (Kho, Đơn hàng, SP, Khách hàng)
│       ├── auth.js         # Logic xác thực khách hàng (Đăng ký/Đăng nhập)
│       ├── cart-icon.js    # Logic hiển thị badge số lượng & tương tác icon giỏ hàng
│       ├── login-admin.js  # Logic xác thực đăng nhập tài khoản quản trị
│       ├── main.js         # Khởi tạo dữ liệu mẫu, điều hướng & tiện ích dùng chung
│       ├── product.js      # Xử lý chi tiết sản phẩm, lọc & phân trang
│       └── shop.js         # Xử lý giỏ hàng, cập nhật số lượng và đặt hàng
├── index.html              # Trang chủ mua sắm (Khách hàng)
├── login.html              # Trang đăng nhập / Đăng ký (Khách hàng)
└── README.md               # Tài liệu hướng dẫn đồ án
```

---

## ⚙️ 2. Chi tiết chức năng các phân hệ

### I. Phân hệ Quản trị (Admin - 5.0 điểm)
*Dành cho quản trị viên vận hành hệ thống:*
1. **Xác thực Admin (`login-admin.html`):** Trang đăng nhập riêng biệt; bảo vệ đường dẫn `admin.html` bằng cơ chế kiểm tra session token/localStorage (`currentAdmin`).
2. **Quản lý khách hàng:** Hiển thị danh sách tài khoản, hỗ trợ Reset mật khẩu và Khóa / Mở khóa trạng thái tài khoản.
3. **Quản lý loại sản phẩm:** Thêm, Sửa, Xóa hoặc Ẩn các thương hiệu điện thoại (Apple, Samsung, Xiaomi,...).
4. **Quản lý danh mục sản phẩm:** 
   - Thêm sản phẩm mới (Hãng, Mã, Tên, Hình ảnh, Cấu hình).
   - Chỉnh sửa thông tin sản phẩm trực quan.
   - Ẩn/Hiện sản phẩm trên giao diện bán hàng.
5. **Quản lý Nhập hàng:** Lập phiếu nhập (Ngày nhập, giá nhập, số lượng từng máy). Phiếu chỉ được chỉnh sửa trước khi bấm **"Hoàn thành"** (khóa cứng sau khi chốt đơn).
6. **Quản lý giá bán & Lợi nhuận:** Thiết lập tỉ lệ % lợi nhuận theo danh mục hoặc theo từng sản phẩm; tự động tính toán giá bán ra dựa trên giá vốn.
7. **Quản lý đơn hàng:** Tra cứu theo mốc thời gian và trạng thái; cập nhật tiến độ (*Mới đặt, Đã xử lý, Đã giao, Đã hủy*).
8. **Quản lý tồn kho & Báo cáo:** Cảnh báo các mặt hàng sắp hết hàng theo ngưỡng; lập báo cáo Xuất - Nhập - Tồn kho.

### II. Phân hệ Khách hàng (End-user - 5.0 điểm)
*Dành cho khách hàng tham quan mua sắm:*
1. **Tài khoản & Xác thực (`login.html`):** Đăng ký tài khoản, đăng nhập/đăng xuất, lưu thông tin phiên làm việc vào `currentUser`.
2. **Hiển thị & Tìm kiếm sản phẩm (`index.html`):** 
   - Danh sách sản phẩm có phân trang (Pagination).
   - Bộ lọc đa tiêu chí: Theo hãng, khoảng giá, từ khóa tìm kiếm.
   - Hộp thoại (Modal) hoặc khu vực xem chi tiết thông số kỹ thuật.
3. **Giỏ hàng & Đặt hàng (`shop.js`, `cart-icon.js`):** 
   - Thêm sản phẩm vào giỏ, điều chỉnh số lượng (có debounce/clamp giá trị), xóa mặt hàng.
   - Tự động cập nhật số lượng badge trên icon giỏ hàng theo thời gian thực.
   - Nhập thông tin giao hàng, chọn hình thức thanh toán COD và xác nhận lưu đơn hàng vào `localStorage`.

---

## 🔒 3. Nguyên lý bảo mật & Lưu trữ giả lập (Local-first)

* **Phân quyền truy cập:**
  * Trang `admin.html` kiểm tra khóa `currentAdmin` trong `localStorage`. Nếu không tồn tại hoặc không hợp lệ, hệ thống tự động chuyển hướng (`location.replace("login-admin.html")`).
  * Người dùng thông thường sau khi đăng nhập lưu thông tin vào `currentUser`.
* **Cơ chế lưu trữ:** Toàn bộ bảng dữ liệu danh mục sản phẩm, phiếu nhập, đơn hàng, tài khoản người dùng được khởi tạo và đồng bộ qua API `localStorage` của trình duyệt.

---

## 🚀 4. Hướng dẫn chạy đồ án

1. Mở thư mục `quan-ly-cua-hang-dien-thoai` bằng **Visual Studio Code**.
2. Cài đặt tiện ích mở rộng **Live Server** (của tác giả Ritwick Dey).
3. Trải nghiệm các phân hệ:
   - **Giao diện Khách hàng:** Click chuột phải vào `index.html` $\rightarrow$ chọn **Open with Live Server**.
   - **Giao diện Quản trị:** Click chuột phải vào `admin/login-admin.html` $\rightarrow$ chọn **Open with Live Server**.