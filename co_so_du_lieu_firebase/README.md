# EBMS — Triển khai Cơ sở dữ liệu lên Firebase

> Áp dụng Giai đoạn 1 bước 2 sau khi đã điền `.env.local` xong (tạo db bằng tay hoặc CLI).
> Project: `ebms-deb7c`

---

## 🎯 Cách 1 — Tạo thủ công trên Firebase Console (Recommend — dễ nhất, chỉ làm 1 lần)

Đăng nhập https://console.firebase.google.com → chọn project **EBMS → ebms-deb7c**.

### A. Tạo 10 Collection & Document đầu tiên (mẫu)
| STT | Collection ID         | Tạo 1 document mẫu (auto ID)  | Gợi ý 1 trường test |
|-----|-----------------------|-------------------------------|---------------------|
| 1   | `chi_nhanh`           | id auto                       | `ten_chi_nhanh: "Chi nhanh Trung tam"` |
| 2   | `phong_ban`           | id auto                       | `ten_phong_ban: "Quan tri"` |
| 3   | `nhan_su`             | ⚠️ ID = **UID của Auth User** sẽ tạo sau bước seed (dùng ID của admin@ebms.io) | `ho_va_ten: "Admin He thong"` |
| 4   | `khach_hang`          | id auto                       | `ten_khach_hang: "Cong ty TNHH Mau"` |
| 5   | `nguoi_lien_he`       | id auto                       | `ho_va_ten: "A Nguyen Van A"` |
| 6   | `ho_so_du_an`         | id auto                       | `ma_ho_so: "HS0001"` |
| 7   | `cong_viec`           | id auto                       | `ten_cong_viec: "Lap KH ban hang"` |
| 8   | `bao_cao_cong_viec`   | id auto                       | `noi_dung_thuc_hien: "Bao cao ngay dau"` |
| 9   | `tai_lieu_du_an`      | id auto                       | `ten_file: "hop_dong_mau.pdf"` |
| 10  | `nhat_ky_hoat_dong`   | id auto                       | `module: "xac_thuc"` |

Schema chi tiết 10 collection: xem `./01_nhan_su.txt` ... `10_nhat_ky_hoat_dong.txt`.

### B. Tạo Index (bắt buộc, nếu thiếu thì list query sẽ lỗi)
Firestore → Indexes → Composite → **Add index** 17 cái trong file `firestore.indexes.json` (giới thiệu mảng).

→ Có cách nhanh hơn: **cài Firebase CLI rồi deploy index tự động** (dưới đây).

### C. Apply Security Rules (bắt buộc, để RBAC hoạt động)
Firestore → Rules → Copy toàn bộ nội dung file `c:\Litte POS\firestore.rules` vào hộp text → **Publish**.
Tương tự: Storage → Rules → Paste `storage.rules`.

---

## 🔧 Cách 2 — Deploy Rules / Index tự động bằng Firebase CLI
1. Mở PowerShell ở thư mục `c:\Litte POS`
2. Cài CLI 1 lần (nếu chưa có):
```
npm install -g firebase-tools
firebase login
```
3. Kiểm tra đã đúng project chưa (nên chọn ebms-deb7c):
```
firebase projects:list
firebase use ebms-deb7c
```
4. Deploy rules + indexes + storage rules:
```
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```
4 dòng này sẽ apply toàn bộ cấu hình bảo mật + index từ file local lên cloud.

---

## 🌱 Bước cuối — Seed tài khoản Admin đầu tiên
Chạy script seed (đã viết ở `src/thu_vien/firebase/seed/seed_firebase.ts`):
```
cd c:\Litte POS
npm.cmd install tsx -D
npx tsx src/thu_vien/firebase/seed/seed_firebase.ts
```
Script này sẽ:
1. Gọi REST API Firebase Auth tạo mới user `admin@ebms.io` / mật khẩu mặc định `EBMS@2026`
2. Tự tạo 1 Chi nhánh mẫu "Trung tâm" và 1 Phòng ban "Quản trị"
3. Ghi Document `nhan_su/{ADMIN_UID}` với vai trò **quan_tri_he_thong** — active.
4. In ra Terminal 2 thông tin nhớ: **Email** + **Password mặc định** (nhớ đổi ngay sau khi đăng nhập lần 1).

Sau khi seed xong, quay Firebase Console Auth & Firestore xem đã có document chưa → qua bước build App Đăng nhập.
