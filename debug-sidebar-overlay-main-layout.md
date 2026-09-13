# [RESOLVED] Debug: Sidebar CHE Main Content (user báo ảnh #2 /ho-so-du-an)
- session: `sidebar-overlay-main-layout`
- env: Windows 11 / Chrome / Next.js 16 / React 19
- Trạng thái: ĐÃ XỬ LÝ (2026-09-09)

## Nguyên nhân xác nhận & Cách khắc phục:
1. **H4 (CONFIRMED):** Thẻ `<aside>` bọc ngoài `SidebarDesktop` trong `src/app/layout.tsx` bị thiếu `hidden md:flex`, khiến thẻ aside 288px vẫn hiển thị khoảng trắng trên màn hình nhỏ/vừa, đè ép layout.
   - **Fix:** Đã thêm `hidden md:flex` vào `<aside className="hidden md:flex w-72 ...">`.
2. **Padding quá khổ:** `src/app/layout.tsx` đặt `md:px-[120px] py-16` làm mất 240px không gian chiều ngang trên màn hình máy tính thông thường, đẩy thẻ dự án ép sát vào sidebar.
   - **Fix:** Chuẩn hoá padding thành `px-4 sm:px-6 lg:px-8 py-6 lg:py-8`.
3. **Mở khóa Quản trị:** Bỏ `soon: true` tại menu `/quan-tri` trong `layout_sidebar.tsx`.

## Evidence Collection Log
| Thời gian | Bằng chứng / Log | Liên quan đến giả thuyết |
|---|---|---|
| Init | User gửi ảnh #2: `/ho-so-du-an` sidebar trái cố định che các nút Quản trị đầu tiên | H1/H4 |

## Fix Plan (post-evidence)
- → Sau khi có bằng chứng sẽ implement minimal fix, minimal scope
- → Verification: Pre-fix vs Post-fix browser snapshot + CSS computed styles

## Cleanup
Chờ user xác nhận => cleanup instrumentation files
