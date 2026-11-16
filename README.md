# CampusShelf — Hệ thống trao đổi tài liệu học tập sinh viên

Đồ án nhóm 26. Công nghệ: HTML/CSS/JavaScript thuần, Node.js + Express, SQLite (`better-sqlite3`). Phiên bản 2.0 bổ sung các phần còn thiếu so với 17 user story trong slide.

## 1. Tính năng

| User story | Chức năng | Trạng thái |
|---|---|---|
| US-01/02 | Đăng ký bằng email cá nhân (đăng ký xong dùng ngay; xác thực mã 6 số là tùy chọn qua `EMAIL_VERIFICATION=code`), đăng nhập bằng mật khẩu (băm scrypt), phiên đăng nhập 7 ngày, giới hạn đăng nhập sai | Chạy thật |
| US-03 | Hồ sơ cá nhân: sửa họ tên/khoa/MSSV/SĐT, ẩn SĐT, đổi mật khẩu | Chạy thật |
| US-04 | AI nhận diện ảnh bìa (tên sách, tác giả, môn học, loại) | Chạy thật khi có `ANTHROPIC_API_KEY` |
| US-05 | Đăng, sửa (kể cả đổi ảnh), ẩn/hiện, xóa tài liệu | Chạy thật |
| US-06/07 | Tìm kiếm, lọc theo hình thức, tình trạng, loại, môn, **điểm hẹn (landmark)**, **giá tối đa**; sắp xếp theo giá hoặc **khoảng cách GPS** | Chạy thật |
| — | **Trợ lý gợi ý theo đề cương**: dán đề cương/tên môn → gợi ý tài liệu phù hợp (AI trích từ khóa nếu có key, nếu không thì so khớp từ khóa) | Chạy thật |
| US-08 | Gửi yêu cầu trao đổi (có lời nhắn), chặn gửi trùng/tài liệu không còn khả dụng | Chạy thật |
| US-09/10 | Chấp nhận / từ chối / hoàn tất; không xử lý lại yêu cầu đã xử lý; hoàn tất sẽ đóng các yêu cầu còn lại của tài liệu | Chạy thật |
| US-11 | Chat 1–1 theo từng tài liệu, **cập nhật tức thời qua Server-Sent Events**, đếm tin chưa đọc | Chạy thật |
| US-12 | Hủy yêu cầu (chỉ khi còn “Chờ phản hồi”) | Chạy thật |
| — | Hẹn gặp: đề xuất thời gian/địa điểm, bên kia xác nhận hoặc hủy | Chạy thật |
| US-13 | Đánh giá 1–5 sao + nhận xét sau giao dịch hoàn tất (mỗi giao dịch một lần/người), điểm uy tín tự cập nhật | Chạy thật |
| US-14 | Lịch sử trao đổi (tab “Lịch sử”) | Chạy thật |
| — | Thông báo trong ứng dụng: yêu cầu mới, phản hồi, lịch hẹn, đánh giá, tài liệu phù hợp với nhu cầu đã đăng, kết quả xử lý báo cáo | Chạy thật |
| US-15 | Admin: danh sách người dùng, khóa/mở khóa tài khoản (khóa sẽ hủy phiên đăng nhập) | Chạy thật |
| US-16/17 | Báo cáo vi phạm; admin gỡ bài / bác bỏ báo cáo; kiểm duyệt toàn bộ tin đăng | Chạy thật |

(*) Gửi email thật chưa được tích hợp — xem mục 2.

## 2. Giới hạn cần nói rõ khi trình bày

- **Email xác thực:** mặc định TẮT (`EMAIL_VERIFICATION` không đặt hoặc `off`): người dùng đăng ký xong được đăng nhập luôn, nên hệ thống **không kiểm tra email có thật hay thuộc về người đăng ký**. Đây là giới hạn của bản demo. Khi cần xác thực thật, đặt `EMAIL_VERIFICATION=code` và tích hợp dịch vụ gửi mail qua API HTTPS (ví dụ Brevo, gói miễn phí 300 email/ngày) tại hàm `issueVerifyCode` trong `server.js`. Lưu ý Render bản miễn phí chặn cổng SMTP (25/465/587), nên không dùng được Gmail SMTP.
- **Lưu trữ trên Render miễn phí:** ổ đĩa của dịch vụ miễn phí là tạm thời nên CSDL SQLite và ảnh tải lên có thể mất khi dịch vụ khởi động lại hoặc triển khai lại. Tài khoản mẫu và dữ liệu mẫu luôn được tạo lại khi khởi động, còn tài khoản do người dùng đăng ký thì không. Muốn giữ dữ liệu lâu dài cần ổ đĩa bền vững (trả phí) hoặc cơ sở dữ liệu ngoài.
- **AI:** cần biến môi trường `ANTHROPIC_API_KEY`. Không có key thì nút nhận diện ảnh bị tắt, còn gợi ý theo đề cương chạy bằng so khớp từ khóa. Model mặc định `claude-haiku-5-5`, đổi bằng `AI_MODEL`.
- **GPS:** khoảng cách tính bằng công thức haversine từ vị trí trình duyệt tới tọa độ **ước lượng** của từng điểm hẹn trong `LANDMARKS` (`server.js`). Hãy chỉnh lại tọa độ theo bản đồ thật trước khi demo.
- **Bảo mật:** token phiên lưu ở `localStorage`; kết nối SSE truyền token qua query string. Phù hợp đồ án/demo, chưa phải cấu hình production (cần HTTPS, cookie HttpOnly, CSRF…).
- **Thanh toán/giao nhận:** không có; hai bên tự thỏa thuận và gặp trực tiếp.

## 3. Cài đặt và chạy

Cần Node.js 20 trở lên.

```bash
npm install
npm start          # http://localhost:3000
```

Biến môi trường (tùy chọn):

| Biến | Ý nghĩa | Mặc định |
|---|---|---|
| `PORT` | Cổng web | `3000` |
| `ANTHROPIC_API_KEY` | Bật AI nhận diện ảnh bìa / trích từ khóa | (tắt) |
| `AI_MODEL` | Model dùng cho AI | `claude-haiku-5-5` |
| `ALLOWED_EMAIL_DOMAINS` | Tên miền email được đăng ký, phân tách bằng dấu phẩy (`*` = mọi email) | `*` (mọi email cá nhân) |
| `DEMO_MODE` | `false` để ẩn mã xác thực và danh sách tài khoản demo (kể cả admin) | `true` (trừ khi `NODE_ENV=production`) |
| `EMAIL_VERIFICATION` | `code` để bắt buộc xác thực email bằng mã 6 số; mặc định `off` (đăng ký xong dùng ngay) | `off` |
| `SHOW_DEMO_ACCOUNTS` | `true` để hiện nút điền nhanh tài khoản sinh viên mẫu ở production (không liệt kê admin) | `false` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Tài khoản admin tự tạo khi khởi động (chỉ tạo nếu email chưa tồn tại) | `admin@gmail.com` / `demo1234` / `Quản Trị Viên` |
| `DEMO_PASSWORD` | Mật khẩu của các tài khoản mẫu khi tạo CSDL mới. **Nên đổi** khi triển khai công khai vì mật khẩu mặc định có trong mã nguồn | `demo1234` |

Ví dụ (Windows PowerShell): `$env:ANTHROPIC_API_KEY="sk-ant-..."; npm start`

Nếu `better-sqlite3` báo lỗi build, hãy cập nhật Node.js lên bản LTS mới nhất, xóa `node_modules` và chạy `npm install` lại.

CSDL cũ (từ phiên bản demo trước) tự được nâng cấp khi khởi động, không mất dữ liệu.

## 4. Tài khoản demo

Mật khẩu chung: `demo1234`. Trang đăng nhập có nút điền nhanh ở chế độ demo.

- `quy.demo@sis.hust.edu.vn`, `duy.demo@sis.hust.edu.vn`, `son.demo@sis.hust.edu.vn` — quản trị viên
- **`admin@gmail.com` / `demo1234` — quản trị viên (v4, tự tạo khi khởi động nếu chưa có; đổi bằng `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`)**
- `mau.demo@sis.hust.edu.vn`, `minhanh.demo@sis.hust.edu.vn`, `hoangnam.demo@sis.hust.edu.vn` — sinh viên

Kịch bản demo gợi ý: mở 2 cửa sổ (một bình thường, một ẩn danh) đăng nhập hai tài khoản → gửi yêu cầu → chấp nhận → nhắn tin (hiện ngay) → hẹn gặp → hoàn tất → đánh giá → admin khóa/gỡ bài.

## 5. Cấu trúc

```text
├── server.js        # API Express + SQLite + SSE + AI
├── package.json
├── data/            # SQLite tự tạo khi chạy
├── uploads/         # Ảnh người dùng tải lên
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## 6. API chính

`/api/auth/*` (register, verify, resend, login, logout) · `/api/me` · `/api/listings` · `/api/requests` · `/api/exchanges` · `/api/meetings/:id` · `/api/conversations` · `/api/messages/:key` · `/api/stream` (SSE) · `/api/notifications` · `/api/reviews` · `/api/reports` · `/api/ai/extract-cover` · `/api/ai/recommend` · `/api/admin/*`
