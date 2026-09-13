CẤU TRÚC TÀI LIỆU EBMS
Chương 1. Tổng quan & Phân tích nghiệp vụ
Giới thiệu dự án
Mục tiêu
Đối tượng sử dụng
Phạm vi
Quy trình nghiệp vụ
Các module của hệ thống
≈ 8-10 trang

Chương 2. Thiết kế chức năng
Chi tiết tất cả chức năng:
Dashboard
Khách hàng
Người liên hệ
Hồ sơ dự án
Công việc
Báo cáo công việc
Nhân sự
Báo cáo
Quản trị
Mỗi chức năng gồm:
Mục đích
Danh sách
Thêm
Sửa
Xóa
Bộ lọc
Quyền
Luồng xử lý
≈ 15-20 trang

Chương 3. Thiết kế cơ sở dữ liệu
Danh sách bảng
Quan hệ các bảng
Các trường dữ liệu
Kiểu dữ liệu
Quy tắc dữ liệu
≈ 10-15 trang

Chương 4. Thiết kế giao diện
Menu
Dashboard
Danh sách
Form
Popup
Responsive
Quy chuẩn màu sắc
≈ 10 trang

Chương 5. Công nghệ & Lộ trình phát triển
Công nghệ sử dụng
Kiến trúc hệ thống
Cấu trúc source
Phân quyền
Roadmap
Backup
Bảo mật
≈ 5-7 trang









CHƯƠNG 1
TỔNG QUAN VÀ PHÂN TÍCH NGHIỆP VỤ

1. Giới thiệu
1.1 Bối cảnh
Hiện nay, phần lớn các doanh nghiệp công nghệ quy mô nhỏ và vừa vẫn quản lý công việc bằng nhiều công cụ khác nhau như Excel, Zalo, Email hoặc giấy tờ. Dữ liệu bị phân tán, khó theo dõi tiến độ, khó kiểm soát công việc và mất nhiều thời gian để tổng hợp báo cáo.
Đặc biệt, khi số lượng dự án và nhân viên tăng lên, Ban Giám đốc rất khó trả lời nhanh các câu hỏi như:
Hiện công ty đang có bao nhiêu dự án?
Dự án nào sắp hoàn thành?
Dự án nào đang bị chậm tiến độ?
Nhân viên nào đang phụ trách những dự án nào?
Hôm nay nhân viên đã thực hiện những công việc gì?
Để giải quyết những vấn đề trên, cần xây dựng một hệ thống quản trị tập trung giúp quản lý toàn bộ hoạt động của doanh nghiệp trên một nền tảng thống nhất.

1.2 Giới thiệu hệ thống
EBMS (Enterprise Branch Management System) là phần mềm quản trị dành cho doanh nghiệp công nghệ, giúp quản lý khách hàng, hồ sơ dự án, công việc, nhân sự và báo cáo công việc hằng ngày.
Hệ thống được thiết kế theo tiêu chí:
Giao diện đơn giản, dễ sử dụng.
Dễ triển khai và mở rộng.
Quản lý toàn bộ vòng đời của một dự án từ khi bắt đầu tiếp cận khách hàng đến khi hoàn thành hoặc hủy bỏ.
Hỗ trợ Ban Giám đốc theo dõi hoạt động của doanh nghiệp theo thời gian thực.

2. Mục tiêu
EBMS được xây dựng nhằm đạt các mục tiêu sau:
Quản lý tập trung toàn bộ khách hàng của doanh nghiệp.
Theo dõi toàn bộ vòng đời của từng hồ sơ dự án.
Quản lý công việc được giao cho từng nhân viên.
Giúp nhân viên báo cáo công việc hằng ngày ngay trên hệ thống.
Hỗ trợ Ban Giám đốc theo dõi tiến độ dự án và hiệu quả làm việc của nhân viên.
Tự động tổng hợp báo cáo, giảm việc lập báo cáo thủ công.

3. Phạm vi hệ thống
Phiên bản 1.0 bao gồm các chức năng sau:
Quản lý nhân sự.
Quản lý khách hàng.
Quản lý người liên hệ.
Quản lý hồ sơ dự án.
Quản lý công việc.
Báo cáo công việc hằng ngày.
Quản lý tài liệu dự án.
Dashboard tổng hợp.
Báo cáo thống kê.
Quản trị hệ thống và phân quyền.
Phiên bản này không bao gồm:
Chấm công.
KPI.
Nghỉ phép.
Kho.
Kế toán.
Bảo hành.
Marketing.
CRM tự động.
AI.

4. Đối tượng sử dụng
Hệ thống được sử dụng bởi các nhóm người dùng sau:
Ban Giám đốc
Theo dõi tình hình hoạt động của toàn công ty thông qua Dashboard và các báo cáo tổng hợp.
Trưởng chi nhánh / Trưởng phòng
Quản lý nhân sự, theo dõi tiến độ hồ sơ dự án, phân công công việc và xem báo cáo của nhân viên.
Nhân viên kinh doanh
Quản lý khách hàng, người liên hệ, tạo hồ sơ dự án, cập nhật trạng thái và theo dõi quá trình làm việc với khách hàng.
Nhân viên kỹ thuật
Thực hiện các công việc được giao, cập nhật tiến độ và báo cáo công việc hằng ngày.

5. Quy trình nghiệp vụ
Toàn bộ hệ thống hoạt động theo một quy trình thống nhất.
Khách hàng
      │
      ▼
Tạo Hồ sơ dự án
      │
      ▼
Phân công nhân sự
      │
      ▼
Thực hiện công việc
      │
      ▼
Báo cáo công việc
      │
      ▼
Theo dõi tiến độ
      │
      ▼
Hoàn thành / Tạm dừng / Hủy
Mỗi hồ sơ dự án được tạo một lần và được theo dõi xuyên suốt từ khi bắt đầu tiếp cận khách hàng đến khi kết thúc.

6. Các thành phần chính của hệ thống
EBMS được xây dựng dựa trên các đối tượng dữ liệu chính sau:
Nhân sự
Khách hàng
Người liên hệ
Hồ sơ dự án
Công việc
Báo cáo công việc
Tài liệu dự án
Trong đó, Hồ sơ dự án là trung tâm của toàn bộ hệ thống. Mọi công việc, báo cáo và tài liệu đều được liên kết với một hồ sơ dự án cụ thể.
CHƯƠNG 2
THIẾT KẾ CHỨC NĂNG HỆ THỐNG

2.1 Dashboard
Mục đích
Dashboard là màn hình đầu tiên sau khi người dùng đăng nhập. Màn hình này giúp người dùng nắm nhanh tình hình công việc mà không cần mở từng chức năng.
Nội dung Dashboard sẽ thay đổi theo quyền của từng tài khoản.

Chức năng
Hiển thị số lượng hồ sơ dự án.
Hiển thị hồ sơ theo từng giai đoạn.
Hiển thị công việc sắp đến hạn.
Hiển thị công việc quá hạn.
Hiển thị báo cáo công việc hôm nay.
Hiển thị thông báo hệ thống.

Dashboard Giám đốc
Hiển thị:
Tổng số khách hàng.
Tổng số hồ sơ dự án.
Hồ sơ dự án theo giai đoạn.
Tổng giá trị dự kiến.
Tổng giá trị hợp đồng.
Nhân viên có nhiều hồ sơ nhất.
Hồ sơ sắp đến hạn.
Hồ sơ quá hạn.
Tỷ lệ báo cáo công việc hôm nay.

Dashboard Trưởng phòng
Hiển thị:
Hồ sơ dự án của phòng.
Công việc của nhân viên.
Hồ sơ sắp đến hạn.
Hồ sơ quá hạn.
Nhân viên chưa gửi báo cáo.

Dashboard Nhân viên
Hiển thị:
Công việc hôm nay.
Công việc quá hạn.
Công việc sắp đến hạn.
Hồ sơ mình phụ trách.
Báo cáo công việc hôm nay.

2.2 Quản lý khách hàng
Mục đích
Quản lý toàn bộ khách hàng của công ty.
Một khách hàng chỉ được tạo một lần.
Một khách hàng có thể có nhiều Hồ sơ dự án.

Thông tin khách hàng
Tên khách hàng
Loại khách hàng
Mã số thuế
Điện thoại
Email
Địa chỉ
Website
Ghi chú

Chức năng
Thêm khách hàng
Chỉnh sửa
Khóa hoạt động
Tìm kiếm
Lọc dữ liệu
Xem chi tiết
Xem lịch sử hoạt động

Người liên hệ
Mỗi khách hàng có thể có nhiều người liên hệ.
Thông tin gồm:
Họ tên
Chức vụ
Điện thoại
Email
Ghi chú

Bộ lọc
Theo tên
Theo loại khách hàng
Theo người phụ trách
Theo thời gian tạo

2.3 Hồ sơ dự án
Mục đích
Đây là chức năng quan trọng nhất của hệ thống.
Một Hồ sơ dự án được tạo từ thời điểm bắt đầu tiếp cận khách hàng và được theo dõi đến khi:
Hoàn thành
Tạm dừng
Hủy

Thông tin
Thông tin chung
Mã hồ sơ
Tên dự án
Khách hàng
Người liên hệ chính

Thông tin bán hàng
Giai đoạn dự án
Độ tiềm năng ký hợp đồng
Giá trị dự kiến
Giá trị hợp đồng

Thông tin quản lý
Người quản lý
Người phụ trách
Người hỗ trợ
Ngày tạo
Deadline

Khác
Mô tả
Ghi chú

Giai đoạn dự án
Mới tạo
Tiếp cận
Khảo sát
Lên giải pháp
Báo giá
Đàm phán
Ký hợp đồng
Triển khai
Nghiệm thu
Hoàn thành
Tạm dừng
Hủy

Chức năng
Tạo hồ sơ
Cập nhật thông tin
Chuyển giai đoạn
Phân công nhân sự
Quản lý công việc
Quản lý tài liệu
Xem báo cáo công việc
Xem lịch sử hoạt động

Bộ lọc
Mã hồ sơ
Tên dự án
Khách hàng
Người quản lý
Người phụ trách
Giai đoạn
Độ tiềm năng ký hợp đồng
Thời gian tạo
Deadline

2.4 Công việc
Mục đích
Quản lý toàn bộ công việc của từng Hồ sơ dự án.
Một Hồ sơ dự án có nhiều công việc.

Thông tin
Tên công việc
Hồ sơ dự án
Người thực hiện
Deadline
Trạng thái
Ghi chú

Trạng thái
Chưa thực hiện
Đang thực hiện
Hoàn thành
Tạm dừng

Chức năng
Thêm
Sửa
Xóa
Giao việc
Đổi người thực hiện
Đánh dấu hoàn thành

Bộ lọc
Người thực hiện
Hồ sơ dự án
Trạng thái
Deadline

2.5 Báo cáo công việc
Mục đích
Giúp nhân viên báo cáo công việc hằng ngày.
Tất cả báo cáo đều liên kết với một Hồ sơ dự án.

Thông tin
Ngày
Hồ sơ dự án
Nội dung công việc
Kế hoạch ngày mai
Khó khăn

Chức năng
Thêm
Sửa
Xóa
Xem lịch sử
Tìm kiếm

Bộ lọc
Nhân viên
Hồ sơ dự án
Ngày

2.6 Nhân sự
Mục đích
Quản lý thông tin nhân viên và tài khoản đăng nhập.

Thông tin
Mã nhân viên
Họ tên
Phòng ban
Chức vụ
Điện thoại
Email
Tài khoản
Trạng thái

Chức năng
Thêm
Sửa
Khóa tài khoản
Phân quyền
Đổi mật khẩu

2.7 Báo cáo
Mục đích
Tổng hợp dữ liệu phục vụ Ban Giám đốc.

Các báo cáo
Theo khách hàng
Theo nhân viên
Theo Hồ sơ dự án
Theo giai đoạn
Theo khoảng thời gian

Chức năng
Xem báo cáo
Bộ lọc
Xuất Excel
Xuất PDF
In

2.8 Quản trị
Mục đích
Quản lý các danh mục và cấu hình của hệ thống.

Danh mục
Chi nhánh
Phòng ban
Chức vụ
Vai trò
Phân quyền

Chức năng
Thêm
Sửa
Xóa
Khóa

KẾT LUẬN CHƯƠNG 2
Đây là toàn bộ các chức năng của phiên bản EBMS 1.0. Tất cả các chức năng đều xoay quanh Hồ sơ dự án, đảm bảo đáp ứng đầy đủ quy trình là
CHƯƠNG 3
THIẾT KẾ CƠ SỞ DỮ LIỆU

3.1 Mục tiêu
Cơ sở dữ liệu được thiết kế để đáp ứng các yêu cầu sau:
Quản lý tập trung toàn bộ dữ liệu.
Không lưu dữ liệu trùng lặp.
Dễ mở rộng trong tương lai.
Hỗ trợ thống kê, báo cáo nhanh.
Dễ bảo trì và phát triển.
Hệ thống sử dụng Firebase Cloud Firestore.

3.2 Danh sách Collection
STT
Collection
Chức năng
1
users
Tài khoản đăng nhập
2
branches
Chi nhánh
3
departments
Phòng ban
4
customers
Khách hàng
5
contacts
Người liên hệ
6
projects
Hồ sơ dự án
7
tasks
Công việc
8
work_reports
Báo cáo công việc
9
documents
Tài liệu dự án
10
activity_logs
Nhật ký hoạt động


3.3 Quan hệ dữ liệu
Chi nhánh
    │
    ▼
Phòng ban
    │
    ▼
Nhân viên
    │
    ├────────────────────┐
    │                    │
    ▼                    ▼
Khách hàng          Báo cáo công việc
    │
    ▼
Người liên hệ
    │
    ▼
Hồ sơ dự án
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
Công việc      Tài liệu      Báo cáo công việc


3.4 Collection Users
Lưu thông tin đăng nhập và thông tin nhân viên.
Trường
Kiểu dữ liệu
id
String
full_name
String
phone
String
email
String
branch_id
String
department_id
String
position
String
role
String
avatar
String
status
Boolean
created_at
Timestamp
updated_at
Timestamp


3.5 Collection Branches
Trường
Kiểu dữ liệu
id
String
name
String
address
String
phone
String
note
String
created_at
Timestamp


3.6 Collection Departments
Trường
Kiểu dữ liệu
id
String
branch_id
String
name
String
note
String
created_at
Timestamp


3.7 Collection Customers
Trường
Kiểu dữ liệu
id
String
customer_name
String
customer_type
String
tax_code
String
phone
String
email
String
address
String
website
String
assigned_to
String
note
String
created_by
String
created_at
Timestamp
updated_at
Timestamp


3.8 Collection Contacts
Trường
Kiểu dữ liệu
id
String
customer_id
String
full_name
String
position
String
phone
String
email
String
note
String
created_at
Timestamp


3.9 Collection Projects
Đây là Collection trung tâm của toàn bộ hệ thống.
Trường
Kiểu dữ liệu
id
String
project_code
String
project_name
String
customer_id
String
contact_id
String
stage
String
contract_potential
String
expected_value
Number
contract_value
Number
manager_id
String
owner_id
String
supporter_ids
Array
created_date
Date
deadline
Date
description
String
note
String
created_by
String
created_at
Timestamp
updated_at
Timestamp


Giá trị của trường Stage
Mới tạo
Tiếp cận
Khảo sát
Lên giải pháp
Báo giá
Đàm phán
Ký hợp đồng
Triển khai
Nghiệm thu
Hoàn thành
Tạm dừng
Hủy

Giá trị của trường Contract Potential
Rất cao
Cao
Trung bình
Thấp
Rất thấp

3.10 Collection Tasks
Một Hồ sơ dự án có thể có nhiều công việc.
Trường
Kiểu dữ liệu
id
String
project_id
String
title
String
description
String
assigned_to
String
deadline
Date
status
String
note
String
created_by
String
created_at
Timestamp
updated_at
Timestamp


Giá trị của trường Status
Chưa thực hiện
Đang thực hiện
Hoàn thành
Tạm dừng

3.11 Collection Work Reports
Lưu báo cáo công việc hằng ngày của nhân viên.
Trường
Kiểu dữ liệu
id
String
report_date
Date
employee_id
String
project_id
String
task_id
String
content
String
tomorrow_plan
String
difficulty
String
created_at
Timestamp

task_id có thể để trống nếu báo cáo không gắn với một công việc cụ thể.

3.12 Collection Documents
Lưu các tài liệu liên quan đến Hồ sơ dự án.
Trường
Kiểu dữ liệu
id
String
project_id
String
file_name
String
file_url
String
uploaded_by
String
uploaded_at
Timestamp


3.13 Collection Activity Logs
Hệ thống tự động ghi nhận mọi thao tác quan trọng của người dùng.
Trường
Kiểu dữ liệu
id
String
user_id
String
module
String
action
String
record_id
String
created_at
Timestamp

Ví dụ:
Tạo Hồ sơ dự án.
Chỉnh sửa Khách hàng.
Giao công việc.
Cập nhật giai đoạn dự án.
Upload tài liệu.
Xóa báo cáo công việc.

3.14 Quy tắc dữ liệu
Chi nhánh
Có nhiều phòng ban.
Có nhiều nhân viên.

Phòng ban
Thuộc một chi nhánh.
Có nhiều nhân viên.

Khách hàng
Có nhiều người liên hệ.
Có nhiều Hồ sơ dự án.

Hồ sơ dự án
Thuộc một khách hàng.
Có một người liên hệ chính.
Có một người quản lý.
Có một người phụ trách.
Có nhiều người hỗ trợ.
Có nhiều công việc.
Có nhiều báo cáo công việc.
Có nhiều tài liệu.

Công việc
Thuộc một Hồ sơ dự án.
Giao cho một nhân viên.
Có thể phát sinh nhiều báo cáo công việc.

Báo cáo công việc
Thuộc một nhân viên.
Liên kết với một Hồ sơ dự án.
Có thể liên kết với một công việc.

3.15 Quy tắc xóa dữ liệu
Để đảm bảo an toàn dữ liệu, hệ thống không xóa cứng các bản ghi quan trọng.
Đối với:
Khách hàng
Hồ sơ dự án
Công việc
Báo cáo công việc
Khi người dùng chọn Xóa, hệ thống sẽ chuyển sang trạng thái Đã xóa hoặc Ngừng sử dụng, dữ liệu vẫn được lưu trong cơ sở dữ liệu để phục vụ tra cứu và khôi phục khi cần.

3.16 Kết luận
Cơ sở dữ liệu của EBMS được thiết kế theo hướng đơn giản, tập trung vào các nghiệp vụ cốt lõi của doanh nghiệp công nghệ. Toàn bộ dữ liệu đều xoay quanh Hồ sơ dự án, giúp quản lý xuyên suốt từ giai đoạn tiếp cận khách hàng đến khi hoàn thành triển khai, đồng thời đáp ứng tốt nhu cầu báo cáo, thống kê và mở rộng trong các phiên bản tiếp theo.
CHƯƠNG 4
THIẾT KẾ GIAO DIỆN

4.1 Mục tiêu
Giao diện EBMS được thiết kế theo nguyên tắc Mobile First, ưu tiên trải nghiệm trên điện thoại trước, sau đó mở rộng lên máy tính bảng và máy tính.
Các tiêu chí thiết kế gồm:
Đơn giản, dễ sử dụng.
Thao tác nhanh.
Giao diện đồng bộ trên toàn hệ thống.
Hạn chế số lần chạm và nhập liệu.
Dễ học, dễ sử dụng với người không rành công nghệ.
Tối ưu hiệu suất trên mọi thiết bị.

4.2 Nguyên tắc thiết kế
Toàn bộ hệ thống tuân theo các nguyên tắc sau:
Thiết kế Mobile First.
Một chức năng chỉ nên hoàn thành trong tối đa 3 lần chạm.
Hạn chế nhập liệu bằng bàn phím, ưu tiên danh sách chọn.
Các nút bấm đủ lớn để thao tác bằng ngón tay.
Giao diện đồng nhất giữa các màn hình.
Màu sắc sử dụng nhất quán trên toàn hệ thống.

4.3 Menu hệ thống
Trên điện thoại
Menu hiển thị dạng Bottom Navigation gồm 5 mục chính.
🏠
Dashboard

📁
Dự án

✅
Công việc

📝
Báo cáo

☰
Thêm

Khi chọn Thêm, hiển thị:
Khách hàng
Nhân sự
Báo cáo
Quản trị
Đăng xuất

Trên máy tính bảng
Menu đặt bên trái và có thể thu gọn.

Trên máy tính
Menu cố định bên trái.
Dashboard

Khách hàng

Hồ sơ dự án

Công việc

Báo cáo công việc

Nhân sự

Báo cáo

Quản trị


4.4 Dashboard
Dashboard là màn hình đầu tiên sau khi đăng nhập.
Hiển thị các thông tin quan trọng theo quyền của người dùng.
Giám đốc
Tổng số khách hàng.
Tổng số Hồ sơ dự án.
Tổng giá trị dự kiến.
Tổng giá trị hợp đồng.
Hồ sơ theo giai đoạn.
Hồ sơ sắp đến hạn.
Hồ sơ quá hạn.
Nhân viên chưa gửi báo cáo.

Trưởng phòng
Hồ sơ của phòng.
Công việc của nhân viên.
Hồ sơ quá hạn.
Hồ sơ sắp đến hạn.
Báo cáo công việc hôm nay.

Nhân viên
Công việc hôm nay.
Công việc quá hạn.
Hồ sơ đang phụ trách.
Báo cáo công việc hôm nay.

4.5 Giao diện danh sách
Tất cả màn hình danh sách sử dụng chung bố cục.
Tiêu đề

Tìm kiếm

Bộ lọc

Danh sách

Phân trang

Danh sách hỗ trợ:
Tìm kiếm.
Lọc dữ liệu.
Sắp xếp.
Chọn nhiều dòng.
Xuất dữ liệu (theo quyền).

4.6 Giao diện Khách hàng
Danh sách hiển thị:
Tên khách hàng.
Loại khách hàng.
Điện thoại.
Người phụ trách.
Số lượng Hồ sơ dự án.
Màn hình chi tiết gồm:
Thông tin khách hàng
Tên
Loại khách hàng
Mã số thuế
Địa chỉ
Điện thoại
Email
Website
Ghi chú

Người liên hệ
Danh sách người liên hệ của khách hàng.

Hồ sơ dự án
Danh sách tất cả Hồ sơ dự án của khách hàng.

4.7 Giao diện Hồ sơ dự án
Đây là màn hình quan trọng nhất của hệ thống.
Thông tin được chia thành các nhóm.
Thông tin chung
Mã hồ sơ.
Tên dự án.
Khách hàng.
Người liên hệ.

Thông tin bán hàng
Giai đoạn dự án.
Độ tiềm năng ký hợp đồng.
Giá trị dự kiến.
Giá trị hợp đồng.

Thông tin quản lý
Người quản lý.
Người phụ trách.
Người hỗ trợ.
Ngày tạo.
Deadline.

Thông tin khác
Mô tả.
Ghi chú.

Bên dưới hiển thị các Tab.
Thông tin

Công việc

Báo cáo công việc

Tài liệu

Lịch sử hoạt động


4.8 Giao diện Công việc
Danh sách hiển thị:
Tên công việc.
Hồ sơ dự án.
Người thực hiện.
Deadline.
Trạng thái.
Màn hình chi tiết gồm:
Thông tin công việc.
Người thực hiện.
Deadline.
Ghi chú.
Các nút chức năng:
Hoàn thành.
Chỉnh sửa.
Xóa.

4.9 Giao diện Báo cáo công việc
Màn hình nhập liệu gồm:
Ngày.
Hồ sơ dự án.
Công việc (không bắt buộc).
Nội dung công việc.
Kế hoạch ngày mai.
Khó khăn.
Chỉ sử dụng nhập văn bản, không hỗ trợ hình ảnh hoặc tệp đính kèm trong phiên bản 1.0.

4.10 Giao diện Nhân sự
Danh sách hiển thị:
Mã nhân viên.
Họ tên.
Phòng ban.
Chức vụ.
Trạng thái.
Màn hình chi tiết:
Thông tin cá nhân.
Thông tin công việc.
Tài khoản.
Phân quyền.

4.11 Giao diện Báo cáo
Cho phép lọc theo:
Thời gian.
Chi nhánh.
Phòng ban.
Nhân viên.
Khách hàng.
Hồ sơ dự án.
Giai đoạn dự án.
Kết quả có thể:
Xem trực tiếp.
Xuất Excel.
Xuất PDF.
In.

4.12 Giao diện Quản trị
Quản lý các danh mục:
Chi nhánh.
Phòng ban.
Vai trò.
Phân quyền.
Chỉ tài khoản có quyền Quản trị mới được truy cập.

4.13 Responsive
Điện thoại
Là nền tảng sử dụng chính.
Người dùng có thể sử dụng đầy đủ các chức năng của hệ thống.

Máy tính bảng
Giữ nguyên chức năng, mở rộng không gian hiển thị.

Máy tính
Phù hợp với:
Quản trị hệ thống.
Theo dõi Dashboard tổng hợp.
Quản lý dữ liệu số lượng lớn.
Xuất báo cáo.

4.14 Quy chuẩn giao diện
Font chữ
Inter

Màu sắc
Chức năng
Màu
Màu chủ đạo
Xanh dương
Thành công
Xanh lá
Cảnh báo
Cam
Lỗi
Đỏ
Nền
Trắng


Biểu tượng
Sử dụng thư viện Lucide Icons.

Nút chức năng
Thêm
Lưu
Chỉnh sửa
Xóa
Hủy
Xuất dữ liệu
Tất cả nút sử dụng cùng kiểu thiết kế trên toàn hệ thống.

Bảng dữ liệu
Hỗ trợ:
Phân trang.
Tìm kiếm.
Bộ lọc.
Sắp xếp.
Chọn nhiều dòng.

4.15 Kết luận
Giao diện EBMS được thiết kế theo nguyên tắc Mobile First, đảm bảo người dùng có thể thao tác thuận tiện trên điện thoại trong quá trình làm việc hằng ngày, đồng thời vẫn đáp ứng đầy đủ nhu cầu quản trị và báo cáo trên máy tính. Thiết kế thống nhất giúp giảm thời gian đào tạo, tăng hiệu quả sử dụng và tạo nền tảng thuận lợi cho việc mở rộng hệ thống trong các phiên bản tiếp theo.
CHƯƠNG 5
CÔNG NGHỆ VÀ TRIỂN KHAI HỆ THỐNG

5.1 Mục tiêu
EBMS được xây dựng theo định hướng:
Dễ phát triển.
Dễ bảo trì.
Dễ mở rộng.
Chi phí vận hành thấp.
Phù hợp doanh nghiệp nhỏ và vừa.
Có thể triển khai nhanh.

5.2 Công nghệ sử dụng
Frontend
Thành phần
Công nghệ
Framework
Next.js
Ngôn ngữ
TypeScript
CSS
Tailwind CSS
Component UI
shadcn/ui
Icon
Lucide Icons
Form
React Hook Form
Validation
Zod


Backend
Sử dụng Firebase.
Bao gồm:
Firebase Authentication
Cloud Firestore
Firebase Storage
Firebase Cloud Functions
Firebase Hosting

Quản lý trạng thái
TanStack Query
Zustand

Thư viện hỗ trợ
Chức năng
Thư viện
Ngày tháng
Day.js
Xuất Excel
ExcelJS
Xuất PDF
jsPDF
Upload file
Firebase Storage SDK


5.3 Kiến trúc hệ thống
Người dùng

      │

      ▼

Next.js

      │

      ▼

Firebase Authentication

      │

      ▼

Cloud Firestore

      │

      ├───────────────┐
      │               │
      ▼               ▼

Storage       Cloud Functions


5.4 Cấu trúc thư mục
src/

├── app/
├── components/
├── features/
│
├── dashboard/
├── customers/
├── projects/
├── tasks/
├── reports/
├── employees/
├── settings/
│
├── services/
├── hooks/
├── utils/
├── types/
└── constants/


5.5 Phân quyền
Hệ thống sử dụng phân quyền theo Vai trò (Role).
Các nhóm quyền mặc định:
Quản trị hệ thống
Toàn quyền.

Giám đốc
Xem toàn bộ dữ liệu.
Xem báo cáo.
Quản lý nhân sự.
Quản lý Hồ sơ dự án.
Xuất dữ liệu.

Trưởng phòng
Quản lý dữ liệu của phòng ban.
Giao việc.
Xem báo cáo nhân viên.
Quản lý Hồ sơ dự án được phân công.

Nhân viên
Quản lý khách hàng được giao.
Quản lý Hồ sơ dự án được giao.
Thực hiện công việc.
Gửi Báo cáo công việc.

5.6 Quy tắc bảo mật
Đăng nhập bằng Email và mật khẩu.
Mật khẩu được mã hóa bởi Firebase Authentication.
Mỗi tài khoản chỉ được truy cập dữ liệu theo quyền.
Mọi thao tác quan trọng được ghi vào Nhật ký hoạt động.
Tài liệu được lưu trên Firebase Storage.
Dữ liệu truyền tải qua HTTPS.

5.7 Sao lưu và khôi phục
Dữ liệu lưu trên Cloud Firestore.
Tài liệu lưu trên Firebase Storage.
Thực hiện sao lưu định kỳ theo chính sách của Firebase.
Khi cần, dữ liệu có thể được xuất để lưu trữ hoặc phục hồi.

5.8 Hiệu năng
Mục tiêu hiệu năng:
Đăng nhập dưới 3 giây.
Mở màn hình danh sách dưới 2 giây.
Tìm kiếm dưới 1 giây (với dữ liệu thông thường).
Thao tác thêm, sửa, xóa phản hồi dưới 2 giây.

5.9 Khả năng mở rộng
Kiến trúc được thiết kế để có thể bổ sung thêm các chức năng trong tương lai mà không ảnh hưởng đến dữ liệu hiện có.
Các hướng mở rộng có thể bao gồm:
Quản lý hợp đồng.
Quản lý lịch làm việc.
Tích hợp Email.
Tích hợp Zalo.
Tích hợp chữ ký số.
Ứng dụng di động riêng.
Các nội dung trên không nằm trong phạm vi phiên bản 1.0.

5.10 Lộ trình phát triển
Giai đoạn 1
Thiết kế giao diện.
Xây dựng cơ sở dữ liệu.
Hoàn thành chức năng đăng nhập.

Giai đoạn 2
Khách hàng.
Hồ sơ dự án.
Công việc.
Báo cáo công việc.

Giai đoạn 3
Dashboard.
Báo cáo.
Quản trị.
Phân quyền.

Giai đoạn 4
Kiểm thử.
Sửa lỗi.
Đưa vào sử dụng.

5.11 Quy trình triển khai
Khởi tạo hệ thống.
Tạo chi nhánh.
Tạo phòng ban.
Tạo tài khoản người dùng.
Phân quyền.
Nhập dữ liệu khách hàng.
Đào tạo người sử dụng.
Vận hành chính thức.

5.12 Tiêu chuẩn lập trình
Sử dụng TypeScript cho toàn bộ dự án.
Đặt tên biến và hàm theo tiếng viet không dấu.
Mỗi module quản lý độc lập.
Không viết mã trùng lặp.
Tách rõ giao diện, xử lý nghiệp vụ và truy cập dữ liệu.
Mọi thay đổi phải được kiểm thử trước khi triển khai.

5.13 Kết luận
EBMS được xây dựng trên nền tảng công nghệ hiện đại, ưu tiên tốc độ phát triển, chi phí vận hành thấp và khả năng mở rộng trong tương lai. Kiến trúc hệ thống phù hợp với doanh nghiệp công nghệ quy mô nhỏ và vừa, đồng thời đáp ứng đầy đủ các nghiệp vụ cốt lõi gồm quản lý khách hàng, Hồ sơ dự án, công việc, báo cáo công việc và quản trị người dùng. Phiên bản 1.0 tập trung vào sự đơn giản, ổn định và dễ sử dụng, tạo nền tảng để tiếp tục phát triển các tính năng nâng cao ở các phiên bản sau.


