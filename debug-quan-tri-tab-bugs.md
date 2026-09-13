# Debug Session: quan-tri-tab-bugs [RESOLVED]

- Session ID: `quan-tri-tab-bugs`
- Ngày: 2026-08-21 (Cập nhật xử lý dứt điểm: 2026-09-09)
- Trạng thái: ĐÃ HOÀN TẤT VÀ KIỂM TRA (0 lỗi typecheck)

---

## Tổng kết xử lý 5 giả thuyết & vấn đề:

1. **H1 (PERMISSION / Tải dữ liệu):** Tách `Promise.all` thành các `try...catch` độc lập cho từng danh mục để không block toàn bộ trang nếu 1 collection có vấn đề. Đồng thời bổ sung helper lấy đúng `uid` từ `nguoiDungHienTai.id` tránh bị `null`.
2. **H2 (Mất giai đoạn dự án custom):** `rawToCauHinh` trong `dich_vu_cau_hinh_giai_doan_du_an.ts` đã lặp qua toàn bộ key mới không thuộc 12 mặc định để lưu trữ đầy đủ.
3. **H3 (Tên CN/PB khi xóa mềm):** Đã bổ sung `dsChiNhanhToanBoTrangThai` và `dsPhongBanToanBoTrangThai` để hiển thị `(Đã xóa)` thay vì `(Chưa liên kết)`.
4. **H4 (Reset phòng ban khi đổi chi nhánh):** Đã thêm toast thông báo rõ ràng cho người dùng khi tự động huỷ chọn phòng ban cũ không thuộc chi nhánh mới.
5. **H5 (Phân loại SP / DV / Kép):** 
   - Đã bổ sung ô chọn Phân loại (`san_pham` | `dich_vu` | `kep`) trong Drawer tạo & sửa SP/DV.
   - Đã thêm cột "Phân loại" với badge màu trực quan trong bảng SP/DV.
   - Đã thêm bộ lọc Phân loại trên thanh công cụ lọc SP/DV.

---

## Step Workflow
- [x] Step 1: Generate session id + init debug-md (DONE)
- [x] Step 2: Disclose 5 hypotheses cho user (DONE)
- [x] Step 3: Implement minimal fix ONLY confirmed hypotheses (DONE)
- [x] Step 4: Verify typecheck compile (DONE - 0 errors)
- [x] Step 5: Cleanup & đóng session debug md (DONE)
