# 📱 Đồ án Website Quản lý Cửa hàng Điện thoại (Phone Store Management)

## Giới thiệu

Đồ án xây dựng nguyên mẫu website thương mại điện tử và quản trị cửa hàng kinh doanh điện thoại di động, gồm hai phân hệ: **Khách hàng (End-user – 5,0 điểm)** và **Quản trị (Admin – 5,0 điểm)**.

Tài liệu này chuẩn hóa cấu trúc **End-user** theo mô hình **3 trang HTML (Shell) + các module JavaScript**. Những chức năng trước đây đặt trong các trang HTML độc lập sẽ được chuyển thành các vùng hiển thị bên trong `products.html`. Phân hệ Admin vẫn được giữ trong phạm vi yêu cầu, nhưng không phân tích chi tiết mã nguồn tại đây.

> **Trạng thái:** Đây là tài liệu **cấu trúc và yêu cầu triển khai sau khi gộp**, không khẳng định mã nguồn hiện tại đã được tích hợp hoặc hoạt động đầy đủ. Những file CSS/JS trong cây thư mục là **cấu trúc mục tiêu** cần xây dựng hoặc chuyển đổi.

---

## 1. Quy tắc gộp các file HTML End-user

| File giao diện ban đầu | File sau khi gộp |                     Chức năng giữ lại                  |
|------------------------|------------------|--------------------------------------------------------|
| `index.html`           | `index.html`     | Trang chủ, menu, điểm vào hệ thống                     |
| `login.html`           | `login.html`     | Đăng nhập, đăng ký và chuyển đổi biểu mẫu              |
| `products.html`        | `products.html`  | Danh sách, tìm kiếm, lọc, phân trang                   |
| `product-detail.html`  | `products.html`  | Xem ảnh, thông tin và cấu hình sản phẩm; thêm giỏ hàng |
| `cart.html`            | `products.html`  | Giỏ hàng, thay đổi số lượng, xóa, thanh toán           |
| `order-history.html`   | `products.html`  | Xem lịch sử đơn hàng của tài khoản                     |
| `profile.html`         | `products.html`  | Xem và cập nhật thông tin cá nhân                      |

**Kết quả:** từ **7 file HTML End-user** còn **3 file HTML**: `index.html`, `products.html`, `login.html`. Không loại bỏ chức năng; chỉ thay đổi nơi hiển thị và phương thức điều hướng.

**Nguyên tắc khi chuyển code:**

- Giữ **một** `<!DOCTYPE html>`, `<html>`, `<head>` và `<body>` trong mỗi trang đích; không dán nguyên một tài liệu HTML vào tài liệu khác.
- Trong `products.html`, chỉ giữ một header, một sidebar và một footer dùng chung; chuyển **phần nội dung chính** của các trang được gộp thành các `section` riêng.
- Giữ các `id` biểu mẫu/khung kết quả cần thiết cho JavaScript, hoặc sửa đồng bộ bộ chọn trong các module JS.
- Chỉ hiển thị một màn hình chức năng tại một thời điểm thông qua `customer/router.js`.
- **Không bắt buộc gộp JS thành một file:** tách chức năng thành module để dễ bảo trì, phân công và kiểm thử.

---

## 2. Cấu trúc thư mục mục tiêu

```text
quan-ly-cua-hang-dien-thoai/
├── index.html                     # Shell trang chủ khách hàng
├── products.html                  # Shell danh sách + chi tiết + giỏ + lịch sử + hồ sơ
├── login.html                     # Shell đăng nhập/đăng ký khách hàng
├── admin.html                     # Shell phân hệ quản trị (phạm vi riêng)
├── assets/
│   ├── css/
│   │   ├── global.css             # Reset, font, màu sắc, biến dùng chung
│   │   ├── components.css         # Button, form, modal, toast, bảng...
│   │   ├── home.css               # Giao diện trang chủ
│   │   ├── products.css           # Giao diện mua sắm, giỏ, lịch sử, hồ sơ
│   │   ├── auth.css               # Đăng nhập/đăng ký
│   │   └── admin.css              # Giao diện quản trị
│   ├── js/
│   │   ├── core/
│   │   │   ├── storage.js          # Đọc/ghi và khởi tạo dữ liệu localStorage
│   │   │   ├── auth.js             # Xác thực, trạng thái và kiểm tra phân quyền
│   │   │   ├── data.js             # Khởi tạo dữ liệu mẫu có kiểm tra
│   │   │   └── utils.js            # Định dạng giá, ngày và hàm dùng chung
│   │   ├── customer/
│   │   │   ├── home.js             # Khởi tạo giao diện index.html
│   │   │   ├── router.js           # Điều hướng các view trong products.html
│   │   │   ├── product-list.js     # Danh sách, tìm kiếm, lọc và phân trang
│   │   │   ├── product-detail.js   # Nội dung chi tiết sản phẩm
│   │   │   ├── cart.js             # Hiển thị/cập nhật giỏ hàng
│   │   │   ├── checkout.js         # Kiểm tra thông tin và đặt hàng
│   │   │   ├── order-history.js    # Lịch sử đơn theo tài khoản
│   │   │   └── profile.js          # Đọc/cập nhật hồ sơ tài khoản
│   │   ├── admin/                  # Các module quản trị (triển khai riêng)
│   │   │   ├── router.js
│   │   │   ├── dashboard.js
│   │   │   ├── users.js
│   │   │   ├── categories.js
│   │   │   ├── products.js
│   │   │   ├── imports.js
│   │   │   ├── pricing.js
│   │   │   ├── orders.js
│   │   │   └── inventory.js
│   │   └── login.js               # Điều khiển màn hình đăng nhập/đăng ký
│   └── images/                    # Ảnh điện thoại, banner, logo...
└── README.md
```

> Trong các HTML được cung cấp, CSS vẫn được gọi từ `assets/css/style.css`, còn JavaScript từ `assets/js/main.js`, `assets/js/auth.js` và `assets/js/product.js`. Khi chuyển sang cấu trúc trên phải **chuyển code và cập nhật đường dẫn `<link>` / `<script>` đồng bộ**. Không xóa file cũ cho đến khi đã xác minh mọi tính năng chạy đúng.

---

## 3. Phân hệ Khách hàng (End-user – 5,0 điểm)

### 3.1. `index.html` – Trang chủ

- Hiển thị header, menu điều hướng, nội dung giới thiệu/điểm vào mua sắm và footer.
- Cho phép truy cập danh sách sản phẩm, đăng nhập và đăng ký.
- Sau khi đăng nhập, thay nút đăng nhập/đăng ký bằng trạng thái người dùng và nút đăng xuất theo thiết kế.
- Các liên kết sang giỏ hàng, lịch sử đơn hàng và hồ sơ điều hướng đến **view tương ứng của `products.html`**, không trỏ tới những HTML đã bị gộp.

### 3.2. `login.html` – Xác thực khách hàng

- **Đăng ký:** họ và tên, email, số điện thoại, mật khẩu; kiểm tra dữ liệu đầu vào và tránh tài khoản trùng theo quy tắc triển khai.
- **Đăng nhập:** nhận thông tin đăng nhập và mật khẩu; xác nhận tài khoản hợp lệ.
- **Đăng xuất:** xóa trạng thái đăng nhập, cập nhật giao diện và điều hướng hợp lý.
- Sử dụng `login.html?mode=register` để mở trực tiếp form đăng ký; mặc định là form đăng nhập.
- Cần thống nhất một cơ chế quản lý trạng thái đăng nhập trong các trang. Theo README gốc, bản mô phỏng sử dụng `localStorage.currentUser`; không kết hợp tùy tiện với `sessionStorage.currentUser`.

### 3.3. `products.html` – Shell các chức năng khách hàng

`products.html` chứa khung giao diện chung và **5 view** (chỉ một view được hiển thị tại một thời điểm):

|    View    |                          Nội dung                           | Nguồn HTML ban đầu   |        JS phụ trách      |
|------------|-------------------------------------------------------------|----------------------|--------------------------|
| `products` | Danh sách, tìm kiếm tên, lọc hãng và khoảng giá, phân trang | `products.html`      | `product-list.js`        |
| `detail`   | Hình ảnh, cấu hình, giá và nút thêm giỏ                     | `product-detail.html`| `product-detail.js`      |
| `cart`     | Sản phẩm đã chọn, tăng/giảm/xóa, tổng tiền, form thanh toán | `cart.html`          | `cart.js`, `checkout.js` |
| `orders`   | Các đơn đã đặt của người dùng hiện tại                      | `order-history.html` | `order-history.js`       |
| `profile`  | Họ tên, email, SĐT, địa chỉ mặc định, đổi mật khẩu          | `profile.html`       | `profile.js`             |

#### A. Danh sách và tìm kiếm sản phẩm

- Hiển thị danh sách điện thoại, hỗ trợ phân trang.
- Tìm kiếm cơ bản theo tên sản phẩm.
- Tìm kiếm nâng cao kết hợp **tên + hãng + khoảng giá**.
- Có thao tác đặt lại bộ lọc.
- Bấm vào sản phẩm để mở `detail` theo ID sản phẩm.

#### B. Chi tiết sản phẩm

- Hiển thị đúng sản phẩm theo ID được chọn, kèm hình ảnh và thông số cấu hình.
- Có nút thêm sản phẩm vào giỏ hàng.
- Trở về danh sách mà không phải mở một tài liệu HTML khác.

#### C. Giỏ hàng và thanh toán

- Thêm sản phẩm, tăng/giảm số lượng, xóa sản phẩm và tính lại tổng tiền.
- Form đặt hàng gồm **họ tên người nhận, điện thoại, địa chỉ giao hàng**.
- Cho phép dùng địa chỉ từ hồ sơ hoặc nhập địa chỉ mới.
- Thanh toán mặc định **COD (tiền mặt khi nhận hàng)**; giao diện hiện tại còn có lựa chọn **chuyển khoản**. Phải có xử lý tương ứng trước khi coi lựa chọn chuyển khoản là chức năng hoàn chỉnh.
- Kiểm tra thông tin hợp lệ và cho khách xác nhận tổng quan đơn trước khi hoàn tất.
- Khi tạo đơn thành công, lưu vào dữ liệu dùng chung rồi mở view `orders`.

#### D. Lịch sử mua hàng

- Chỉ hiển thị đơn hàng thuộc người dùng đang đăng nhập.
- Hiển thị tối thiểu thông tin nhận diện đơn hàng, thời điểm, sản phẩm/tổng tiền và trạng thái để khách có thể tra cứu.
- Dữ liệu phải tương thích với phần đặt hàng và quản trị đơn hàng.

#### E. Hồ sơ cá nhân

- Yêu cầu đăng nhập để truy cập.
- Hiển thị và cập nhật **họ tên, email, số điện thoại, địa chỉ giao hàng mặc định**.
- Cho phép đổi mật khẩu (không bắt buộc đổi khi cập nhật các thông tin khác).
- Cập nhật lại tên hiển thị trên header nếu thông tin hồ sơ thay đổi.

### 3.4. Khung HTML khuyến nghị của `products.html`

Đây là **mẫu cấu trúc**, không phải code hoàn chỉnh thay thế trực tiếp các file đã gửi:

```html
<body>
  <header><!-- Header dùng chung --></header>

  <div class="main">
    <nav class="Left_Menu"><!-- Menu dùng chung --></nav>

    <main class="Content" id="customer-app">
      <section id="view-products"><!-- Danh sách, bộ lọc, phân trang --></section>
      <section id="view-detail" hidden><!-- product-detail-container --></section>
      <section id="view-cart" hidden><!-- cart-list + checkout-form --></section>
      <section id="view-orders" hidden><!-- order-list --></section>
      <section id="view-profile" hidden><!-- profile-form --></section>
    </main>
  </div>

  <footer><!-- Footer dùng chung --></footer>
  <!-- Import các module JS sau khi đã thống nhất cách nạp và phụ thuộc -->
</body>
```

---

## 4. Quy tắc điều hướng sau khi gộp

Dùng **query string** để trang `products.html` xác định view cần mở (quy ước đề xuất):

|        Ý định         |           Đường dẫn mới            |
|-----------------------|------------------------------------|
| Trang chủ             | `index.html`                       |
| Danh sách sản phẩm    | `products.html?view=products`      |
| Chi tiết sản phẩm     | `products.html?view=detail&id=123` |
| Giỏ hàng / thanh toán | `products.html?view=cart`          |
| Lịch sử đơn hàng      | `products.html?view=orders`        |
| Hồ sơ cá nhân         | `products.html?view=profile`       |
| Đăng nhập             | `login.html`                       |
| Đăng ký               | `login.html?mode=register`         |

**Lưu ý:** các đường dẫn mới là **quy ước mục tiêu** và đòi hỏi `customer/router.js` đọc tham số URL, hiển thị đúng `section`, tải dữ liệu tương ứng và cập nhật menu active. Nếu dùng `history.pushState`, cần xử lý cả nút Back/Forward qua sự kiện `popstate`; phương án đơn giản hơn là cập nhật query và tải lại `products.html`.

### Luồng sử dụng chính

```text
index.html
  ├── Đăng nhập / Đăng ký → login.html
  └── Xem điện thoại → products.html?view=products
                              ↓
                 Chọn điện thoại (id)
                              ↓
                products.html?view=detail&id=...
                              ↓
                     Thêm vào giỏ hàng
                              ↓
                   products.html?view=cart
                              ↓
                Nhập thông tin & xác nhận
                              ↓
              Lưu đơn hàng vào dữ liệu chung
                              ↓
                  products.html?view=orders

Từ menu khách hàng:
  └── products.html?view=profile (yêu cầu đăng nhập)
```

### Cập nhật liên kết cũ

- `product-detail.html?id=...` → `products.html?view=detail&id=...`
- `cart.html` → `products.html?view=cart`
- `order-history.html` → `products.html?view=orders`
- `profile.html` → `products.html?view=profile`

Không để menu của bản hoàn thiện tiếp tục trỏ sang những trang HTML đã được loại khỏi cấu trúc chạy chính.

---

## 5. Lưu dữ liệu và bảo mật giả lập

- Dự án là **front-end prototype**, sử dụng `localStorage` để mô phỏng dữ liệu tài khoản, giỏ hàng, sản phẩm và đơn hàng. Các module phải thống nhất khóa lưu trữ và cấu trúc đối tượng dữ liệu.
- Quy ước trạng thái người dùng theo README gốc: `localStorage.getItem('currentUser')`; phần Admin nếu triển khai dùng trạng thái riêng `currentAdmin`.
- Khi chưa đăng nhập mà truy cập `view=profile` hoặc `view=orders`, điều hướng về `login.html`; với đặt hàng, cần xác định rõ quy tắc có bắt buộc đăng nhập hay không và xử lý nhất quán.
- Dữ liệu đơn hàng phải liên kết với mã người dùng để tránh hiển thị lẫn lịch sử giữa các tài khoản trong giao diện mô phỏng.
- Việc thay đổi `localStorage` hoặc ẩn view **không phải cơ chế bảo mật thật**. Không lưu mật khẩu thuần văn bản hoặc dữ liệu thanh toán nhạy cảm cho hệ thống thực tế; muốn triển khai thực tế cần backend, xác thực phía máy chủ và cơ sở dữ liệu.

---

## 6. Phân hệ Quản trị (Admin – 5,0 điểm, giữ phạm vi yêu cầu gốc)

Phần quản trị dự kiến tập trung trong `admin.html` với các module dưới `assets/js/admin/`. Các yêu cầu chức năng từ README gốc gồm:

1. Dashboard và menu quản trị; phân quyền Admin tách biệt tài khoản khách hàng.
2. Quản lý khách hàng: danh sách, reset mật khẩu, khóa/mở khóa.
3. Quản lý hãng/loại sản phẩm: thêm, sửa, xóa hoặc ẩn.
4. Quản lý điện thoại: thêm (loại, mã, tên, hình ảnh, cấu hình), sửa, xóa hoặc ẩn.
5. Quản lý phiếu nhập: ngày nhập, giá nhập và số lượng theo sản phẩm; phiếu chỉ chỉnh sửa trước khi **Hoàn thành**.
6. Thiết lập tỷ lệ phần trăm lợi nhuận theo loại hoặc sản phẩm; tra cứu giá vốn, tỷ lệ và giá bán.
7. Quản lý đơn hàng: lọc theo thời gian/trạng thái, xem chi tiết; cập nhật **Mới đặt / Đã xử lý / Đã giao / Hủy**.
8. Tra cứu tồn kho, cảnh báo dưới ngưỡng và báo cáo Xuất – Nhập – Tồn theo khoảng thời gian.

**Chưa chuẩn hóa luồng đăng nhập Admin:** README gốc có chỗ mô tả đăng nhập chung trong `login.html`, nhưng hướng dẫn chạy lại nêu `admin/login.html`. Vì chưa có mã nguồn Admin đi kèm, tài liệu này **không xác nhận** đường dẫn đăng nhập Admin nào đã tồn tại; nhóm thực hiện cần lựa chọn và triển khai nhất quán khi hoàn thiện phân hệ này.

---

## 7. Các điểm cần sửa từ HTML hiện tại

1. **Menu:** loại bỏ đường dẫn `cart.html`, `profile.html`, `order-history.html` và thay bằng link có `view`.
2. **Active state:** mỗi thời điểm chỉ đánh dấu `active` ở mục đang xem (một số HTML cũ đồng thời đánh dấu mục hồ sơ là `active`).
3. **Đăng nhập:** tránh dùng lẫn `sessionStorage.currentUser` và `localStorage.currentUser`.
4. **CSS/JS:** chuyển dần từ `style.css`, `main.js`, `auth.js`, `product.js` sang cấu trúc module mục tiêu; cập nhật thứ tự và phương thức import phù hợp.
5. **View HTML:** chỉ sao chép phần nội dung chức năng khi gộp; không sao chép lặp header/sidebar/footer/script.
6. **Xử lý động:** hoàn thiện các vùng đang có thông báo “Đang tải...” hoặc ghi chú `TODO` bằng chức năng JavaScript tương ứng.
7. **Đặt hàng:** đảm bảo giỏ hàng, tổng tiền, xác nhận đơn và lịch sử đơn hàng dùng cùng mô hình dữ liệu.
8. **Quyền truy cập:** kiểm tra người dùng hiện tại trước khi render dữ liệu hồ sơ hoặc lịch sử đơn hàng.

---

## 8. Hướng dẫn chạy (sau khi đã tích hợp mã nguồn)

1. Tải hoặc clone dự án về máy.
2. Mở thư mục bằng **Visual Studio Code**.
3. Cài extension **Live Server**.
4. Mở `index.html` bằng **Open with Live Server** để sử dụng giao diện khách hàng.
5. Truy cập `products.html?view=products` để kiểm tra các màn hình mua sắm và tài khoản.
6. Truy cập `login.html` hoặc `login.html?mode=register` để kiểm tra xác thực.
7. Kiểm thử trực tiếp thao tác thêm giỏ, thay đổi số lượng, thanh toán, lịch sử và cập nhật hồ sơ.

> Các bước trên chỉ kiểm thử thành công sau khi các file CSS/JavaScript được tạo và liên kết đúng. Không nên kỳ vọng chỉ đổi README là các đường dẫn mới tự hoạt động.

## 9. Checklist nghiệm thu End-user

- [ ] Trang chủ và các liên kết điều hướng hoạt động.
- [ ] Đăng ký, đăng nhập, đăng xuất; tên tài khoản hiển thị đúng.
- [ ] Tìm kiếm theo tên, lọc hãng, khoảng giá và phân trang hoạt động.
- [ ] Xem chi tiết đúng sản phẩm theo ID.
- [ ] Thêm/xóa/thay đổi số lượng trong giỏ hàng; tổng tiền chính xác.
- [ ] Form giao hàng hợp lệ, COD mặc định và xác nhận đơn trước khi lưu.
- [ ] Đơn vừa đặt xuất hiện trong lịch sử của đúng tài khoản.
- [ ] Hồ sơ đọc/ghi đúng người dùng; yêu cầu đăng nhập khi truy cập.
- [ ] Menu chỉ có một mục active; Back/Forward hoạt động theo cách điều hướng đã chọn.
- [ ] Không còn đường dẫn nội bộ đến những HTML đã gộp.
- [ ] Làm mới trang vẫn hiển thị đúng view và dữ liệu đã lưu theo thiết kế.

---

**Tóm tắt kiến trúc:** `index.html` (Trang chủ) + `login.html` (Xác thực) + `products.html` (5 view khách hàng), chia JavaScript thành từng module chức năng. Phân hệ Admin được giữ ở phạm vi riêng và triển khai sau.
