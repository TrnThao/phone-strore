# 📱 Đồ án Website Quản lý Cửa hàng Điện thoại (Phone Store Management)

Đồ án xây dựng hệ thống website thương mại điện tử và quản trị cửa hàng kinh doanh điện thoại di động, được chia thành 2 phân hệ chính (mỗi phân hệ chiếm 5.0 điểm).

---

## 🏗️ 1. Cấu trúc thư mục dự án (Front-end Prototype)

```text
quan-ly-cua-hang-dien-thoai/
├── index.html              # Trang chủ (Khách hàng)
├── login.html              # Trang đăng nhập / Đăng ký (Khách hàng)
├── profile.html            # Trang thông tin cá nhân khách hàng
├── products.html           # Trang danh sách sản phẩm & Tìm kiếm (có phân trang)
├── product-detail.html     # Trang chi tiết sản phẩm
├── cart.html               # Trang giỏ hàng & Thanh toán
├── order-history.html      # Trang xem lại lịch sử đơn hàng của khách
├── admin/                  # Thư mục riêng cho phân hệ Quản trị
│   ├── login.html          # Trang đăng nhập Admin (riêng biệt)
│   ├── dashboard.html      # Trang chủ Admin / Tổng quan
│   ├── users.html          # Quản lý khách hàng (Khóa/mở, reset mật khẩu)
│   ├── categories.html     # Quản lý loại sản phẩm (Thêm, sửa, xóa)
│   ├── products.html       # Quản lý danh mục sản phẩm (CRUD điện thoại)
│   ├── imports.html        # Quản lý Nhập sản phẩm & Chi tiết phiếu nhập
│   ├── pricing.html        # Quản lý giá bán & % lợi nhuận
│   ├── orders.html         # Quản lý đơn hàng & Cập nhật trạng thái
│   └── inventory.html      # Quản lý tồn kho, cảnh báo hết hàng, báo cáo X-N-T
└── assets/                 # Tài nguyên tĩnh chung
    ├── css/
    │   ├── style.css       # CSS chung cho phía khách hàng
    │   └── admin.css       # CSS riêng cho giao diện trang quản trị
    ├── js/
    │   ├── main.js         # Xử lý logic chung, render header/footer, giỏ hàng
    │   ├── auth.js         # Xử lý đăng nhập/đăng ký phía client
    │   ├── product.js      # Xử lý hiển thị, tìm kiếm, phân trang sản phẩm
    │   └── admin.js        # Xử lý toàn bộ logic bảng quản trị (dùng localStorage)
    └── images/             # Thư mục chứa ảnh minh họa điện thoại, banner,...
⚙️ 2. Chi tiết chức năng các phân hệ
I. Phân hệ Quản trị (Admin - 5.0 điểm)
Dành cho chủ cửa hàng/quản lý để vận hành hệ thống:

Giao diện Admin: Trang đăng nhập riêng biệt hoàn toàn với khách hàng; tích hợp bảng điều khiển (Dashboard) và menu điều hướng trực quan.

Quản lý khách hàng: Hiển thị danh sách tài khoản, hỗ trợ Reset mật khẩu và Khóa/Mở khóa trạng thái tài khoản.

Quản lý loại sản phẩm: Thêm, Sửa, Xóa hoặc Ẩn các hãng điện thoại (ví dụ: Apple, Samsung, Xiaomi,...).

Quản lý danh mục sản phẩm (Điện thoại):

Thêm sản phẩm mới (Loại, Mã, Tên, Hình ảnh, Mô tả cấu hình).

Sửa sản phẩm (form điền sẵn thông tin cũ).

Xóa / Ẩn sản phẩm khỏi danh sách bán hàng.

Quản lý Nhập sản phẩm: Quản lý phiếu nhập (Ngày nhập, giá nhập, số lượng cho từng sản phẩm - không quản lý nhà cung cấp). Phiếu nhập chỉ được sửa trước khi bấm "Hoàn thành" (khóa cứng sau khi hoàn thành).

Quản lý giá bán: Thiết lập tỉ lệ % lợi nhuận theo loại hoặc từng sản phẩm; tra cứu nhanh giá vốn, % lợi nhuận và giá bán thực tế.

Quản lý đơn đặt hàng: Tra cứu theo khoảng thời gian và tình trạng đơn; xem chi tiết và cập nhật trạng thái (Mới đặt, Đã xử lý, Đã giao, Hủy).

Quản lý tồn kho & Báo cáo: Tra cứu tồn kho theo sản phẩm/loại sản phẩm; cơ chế cảnh báo hàng sắp hết (dưới ngưỡng giới hạn); báo cáo Xuất - Nhập - Tồn theo khoảng thời gian tùy chọn.

II. Phân hệ Khách hàng (End-user - 5.0 điểm)
Dành cho khách truy cập website mua sắm:

Tài khoản & Xác thực: Đăng ký, Đăng nhập/Đăng xuất (hiển thị tên tài khoản khi đăng nhập thành công), trang quản lý và cập nhật thông tin cá nhân.

Hiển thị & Tìm kiếm sản phẩm:

Trang chủ/Danh sách có phân trang (Pagination).

Trang chi tiết sản phẩm hiển thị đầy đủ hình ảnh, thông số cấu hình.

Tìm kiếm cơ bản theo tên hoặc tìm kiếm nâng cao kết hợp nhiều tiêu chí (Tên + Hãng + Khoảng giá).

Giỏ hàng & Mua hàng: Thêm sản phẩm vào giỏ hàng, tùy chỉnh số lượng hoặc xóa sản phẩm. Chọn/nhập địa chỉ nhận hàng, chọn hình thức thanh toán (mặc định COD - Tiền mặt khi nhận hàng) và bước xác nhận đơn hàng tổng quan.

Lịch sử mua hàng: Trang tra cứu toàn bộ các đơn hàng cá nhân đã đặt thành công.

🔗 3. Nguyên lý liên kết & Bảo mật giả lập
Điều hướng Khách hàng: Từ index.html chọn sản phẩm chuyển hướng sang product-detail.html?id=xxx. Hoàn tất đơn hàng ở cart.html sẽ đẩy dữ liệu vào localStorage và chuyển đến order-history.html.

Phân quyền bảo mật giả lập (Client-side): Sử dụng localStorage.getItem('currentUser') hoặc localStorage.getItem('currentAdmin') thông qua JavaScript ở đầu mỗi trang. Nếu chưa đăng nhập mà truy cập profile.html hoặc admin/dashboard.html, hệ thống tự động điều hướng (window.location.href) ép về trang đăng nhập tương ứng.

🚀 4. Hướng dẫn chạy đồ án
Clone hoặc tải mã nguồn về máy.

Mở thư mục dự án bằng Visual Studio Code.

Cài đặt extension Live Server.

Click chuột phải vào file index.html (phía khách hàng) hoặc admin/login.html (phía quản trị) và chọn Open with Live Server để trải nghiệm.