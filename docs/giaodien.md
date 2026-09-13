TIÊU CHUẨN THIẾT KẾ GIAO DIỆN (UI DESIGN SYSTEM)
Mục tiêu

EBMS được thiết kế theo phong cách SaaS hiện đại, tối giản, ưu tiên tốc độ thao tác và khả năng mở rộng. Giao diện tuân thủ nguyên tắc Mobile First, đồng thời đảm bảo trải nghiệm thống nhất trên điện thoại, máy tính bảng và máy tính.

Phong cách thiết kế

Phong cách giao diện:

Modern SaaS
Minimal Design
Mobile First
Card-based Layout
Soft UI
Rounded Design
Clean Interface

Các tiêu chí:

Đơn giản.
Dễ đọc.
Nhiều khoảng trắng.
Không sử dụng hiệu ứng rườm rà.
Màu sắc tối giản.
Thống nhất toàn hệ thống.
Công nghệ giao diện
Thành phần	Công nghệ
Framework	Next.js
UI	shadcn/ui
CSS	Tailwind CSS
Icon	Lucide
Animation	Motion
Chart	Recharts
Form	React Hook Form
Validation	Zod
Font

Font chính

Inter

Font số liệu

Geist Mono

Border Radius
Thành phần	Radius
Button	10px
Input	10px
Card	16px
Popup	20px
Shadow

Sử dụng Shadow nhẹ.

Không sử dụng hiệu ứng nổi quá mạnh.

Card chỉ có một lớp Shadow.

Popup hai lớp Shadow.

Khoảng cách

Sử dụng hệ thống spacing 8pt.

Ví dụ

4

8

12

16

24

32

48

64

Không sử dụng khoảng cách ngẫu nhiên.

Màu sắc
Primary

Blue

Dùng cho:

Button chính
Link
Menu đang chọn
Success

Green

Dùng cho:

Hoàn thành
Thành công
Warning

Orange

Dùng cho:

Sắp hết hạn
Cảnh báo
Danger

Red

Dùng cho:

Hủy
Xóa
Lỗi
Gray

Dùng cho:

Chữ phụ
Border
Background
Dashboard

Dashboard không dùng Table.

Ưu tiên:

KPI Card
Progress
Chart
Timeline
Recent Activity

Ví dụ

+----------------------+

Tổng Hồ sơ

152

↑ 18%

+----------------------+
Danh sách

Danh sách dữ liệu gồm

Search

↓

Filter

↓

Table

↓

Pagination

Mobile sẽ chuyển thành

Search

↓

Filter

↓

Card List

↓

Load More

Không dùng bảng trên điện thoại.

Form

Mỗi Form tối đa

01 cột trên Mobile

02 cột trên Desktop

Không nhiều hơn.

Button

Có 5 loại

Primary

Secondary

Outline

Ghost

Danger

Toàn hệ thống chỉ sử dụng 5 kiểu này.

Icon

Chỉ sử dụng

Lucide

Không dùng nhiều bộ icon khác nhau.

Dark Mode

Hỗ trợ.

Tự động theo hệ điều hành.

Người dùng có thể chuyển:

Light
Dark
System
Animation

Animation ngắn.

150–250ms.

Không dùng hiệu ứng bay, xoay hoặc nảy.

Responsive
Mobile

Thiết kế đầu tiên.

Breakpoint:

<768px

Tablet

768–1024px

Desktop

1024px

Thiết kế Card

Card là thành phần chính của hệ thống.

Mọi màn hình đều ưu tiên Card trước Table.

Ví dụ

┌────────────────────┐

Khách hàng

Công ty ABC

Tiếp cận

Nguyễn Văn A

Deadline

25/08/2026

└────────────────────┘
Popup

Popup giữa màn hình.

Chiều rộng tối đa

640px

Popup dài chuyển thành Drawer trên điện thoại.

Thông báo

Toast Notification.

Hiển thị góc trên bên phải.

Tự đóng sau 3 giây.

Tiêu chuẩn UX

1. **BẮT BUỘC — Giao diện 100% tiếng Việt CÓ DẤU.**
   - Mọi text người dùng nhìn thấy (label, button, heading, placeholder, toast, validation message, empty state, helper text, error message hiển thị cho người dùng) PHẢI viết tiếng Việt có dấu đầy đủ và đúng chính tả.
   - Tuyệt đối cấm text không dấu dạng "Huy bo", "Them nhan vien", "Tim kiem:", "Chua co chi nhanh", "De trong tu dong tao". Nếu dev nhầm → bug UI.
   - Identifier trong code (type, biến, function, id CSS) giữ nguyên English convention đã có.

2. **BẮT BUỘC — Giao diện tối giản, không để text thừa gây rối mắt.**
   - Label trường chỉ viết NGẮN GỌN 2-5 từ (VD: "Họ và tên" chứ không "Vui lòng nhập họ và tên đầy đủ của nhân viên").
   - Placeholder chỉ là VÍ DỤ NGẮN (1 dòng, 3-8 từ). Bỏ hoàn toàn các câu hướng dẫn dài dòng kèm placeholder dạng "Để trống = tự động tạo (NV0001...)". Nếu cần gợi ý tự động → đặt gợi ý nhỏ *bên dưới* field chỉ khi nào nghiệp vụ BẮT BUỘC mới thêm.
   - Mỗi màn hình chỉ TỐI ĐA 1 text trợ giúp (helper text) cho luồng nghiệp vụ chính. Không để 2-3 câu giải thích cùng vị trí.
   - Empty state / no result chỉ giữ 1 nhãn chính + 1 nhãn phụ TỐI ĐA 8 từ (VD: Chính / "Chưa có nhân viên nào", Phụ / "Thêm nhân viên đầu tiên"). Loại bỏ text phụ giải thích dài "Hệ thống sẽ tự động tạo Firebase Auth...".

3. Một thao tác phổ biến không quá 3 lần chạm.
Không có màn hình nào phải cuộn quá dài để hoàn thành tác vụ chính.
Mỗi màn hình chỉ có một hành động chính (Primary Action) nổi bật.
Các nút Lưu, Hủy, Xóa luôn đặt cùng vị trí trên mọi màn hình.
Mọi danh sách đều hỗ trợ tìm kiếm và bộ lọc.
Mọi thao tác thêm, sửa, xóa đều có phản hồi trực quan ngay sau khi thực hiện.