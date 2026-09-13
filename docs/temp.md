# TEMP: TRÍCH XUẤT DỮ LIỆU LAYOUT - 02/08/2026

---

## BƯỚC 1: CÂY THƯ MỤC THỰC TẾ TRÊN Ổ ĐĨA

```
src/
├── app/
│   ├── (he_thong)/               ← Route Group: các trang đã đăng nhập
│   │   ├── bao-cao/
│   │   │   └── page.tsx
│   │   ├── bao-cao-cong-viec/
│   │   │   └── page.tsx
│   │   ├── cong-viec/
│   │   │   └── page.tsx
│   │   ├── ho-so-du-an/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── khach-hang/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── nhan-su/
│   │   │   └── page.tsx
│   │   ├── layout.tsx             ← Group Layout (Level 2) - chỉ bọc KhoaTruyCap
│   │   └── page.tsx               ← Trang chủ Dashboard
│   ├── dang-nhap/
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css                ← CSS TOÀN CỤC (Level 0)
│   └── layout.tsx                 ← ROOT LAYOUT (Level 0) - CHỨA <aside> + <main>
│
└── thanh_phan/
    ├── layout_bottom_navigation.tsx   ← Bottom nav mobile
    ├── layout_sidebar.tsx             ← SidebarDesktop + SidebarMobileDrawer
    ├── layout_topbar.tsx              ← Topbar sticky
    ├── ui/                            ← Component library (Nut, Hieu, Bo_Cuc_Trang, DaiDien, Rong...)
    ├── xac_thuc/                      ← BocXacThucToanUngDung, KhoaTruyCap
    └── {khach_hang, ho_so_du_an, cong_viec, nhan_su, bao_cao_cong_viec}/ ← per-module: bo_loc + form_drawer
```

---

## BƯỚC 2: XÁC ĐỊNH FILE GÂY LỖI (CẤU TRÚC LAYOUT CHUNG)

| Chức năng | File tuyệt đối | Vị trí |
|---|---|---|
| **L1. ROOT LAYOUT (bao bọc TOÀN BỘ app, chứa `<aside>` + `<main>`)** | [app/layout.tsx](file:///c:/Litte%20POS/src/app/layout.tsx) | D35-D46: `<div flex h-screen w-full overflow-hidden><aside w-64 h-full shrink-0><SidebarDesktop/>`, `<main flex-1 h-full overflow-y-auto><Topbar/> {children} <BottomNav/> </main>` |
| **L2. ROUTE GROUP LAYOUT (bên trong (he_thong))** | [(he_thong)/layout.tsx](file:///c:/Litte%20POS/src/app/(he_thong)/layout.tsx) | **CHỈ CÒN**: bọc KhoaTruyCap rồi pass `{children}` (không làm layout nữa). Nên **KHÔNG GÂY CONFLICT** được. Tốt. |
| **L3. FILE CSS TOÀN CỤC (diều khiển spacing, radius, shadow, màu)** | [globals.css](file:///c:/Litte%20POS/src/app/globals.css) | D4-D113: @theme inline (Tailwind v4) + reset * box-sizing, html/body min-height: 100dvh |
| **L4. COMPONENT SIDEBAR (trong aside L1)** | [layout_sidebar.tsx](file:///c:/Litte%20POS/src/thanh_phan/layout_sidebar.tsx) | D207-D216: `SidebarDesktop` = `hidden md:flex w-full h-full shrink-0 flex-col bg-background border-r border-border` (sticky ĐÃ BỎ theo yêu cầu shell chuẩn) |
| **L5. COMPONENT TOPBAR (trong main L1)** | [layout_topbar.tsx](file:///c:/Litte%20POS/src/thanh_phan/layout_topbar.tsx) | D86: `sticky top-0 z-30 h-16 shrink-0 bg-background/95 backdrop-blur border-b border-border px-5 sm:px-8 md:px-12 flex items-center gap-4 min-w-0 w-full` |
| **L6. WRAPPER NỘI DUNG TRANG ĐƠN (mỗi page.tsx module)** | [ui/bo_cuc_trang.tsx](file:///c:/Litte%20POS/src/thanh_phan/ui/bo_cuc_trang.tsx) | `Bo_Cuc_Trang`: Section + Header (tiêu đề/phụ đề/badge/action phải) + Nội dung. `space-y-8` (8pt*8=64px) mặc định. |

---

## BƯỚC 3: TRÍCH XUẤT CODE CỦA CÁC FILE TRÊN (SẠCH - KHÔNG COMMENT)

### FILE 1: `src/app/layout.tsx` (ROOT LAYOUT - CHỨA FLEX SHELL CHUẨN)

```tsx
'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import BocXacThucToanUngDung from '../thanh_phan/xac_thuc/boc_xac_thuc_toan_ung_dung';
import { SidebarDesktop, SidebarMobileDrawer } from '../thanh_phan/layout_sidebar';
import ThanhPhanTopbar from '../thanh_phan/layout_topbar';
import ThanhDieuHuongDuoi from '../thanh_phan/layout_bottom_navigation';

export default function BoCucGoc({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname() ?? '/';
  const laTrangDangNhap = pathname === '/dang-nhap' || pathname.startsWith('/dang-nhap/');

  if (laTrangDangNhap) {
    return (
      <html lang="vi-VN" className="antialiased">
        <body>
          <BocXacThucToanUngDung>{children}</BocXacThucToanUngDung>
        </body>
      </html>
    );
  }

  return (
    <html lang="vi-VN" className="antialiased">
      <body>
        <BocXacThucToanUngDung>
          <div className="flex h-screen w-full overflow-hidden">
            <aside className="w-64 h-full flex-shrink-0 overflow-y-auto">
              <SidebarDesktop />
            </aside>
            <main className="flex-1 h-full overflow-y-auto">
              <ThanhPhanTopbar />
              <div className="w-full px-5 sm:px-8 md:px-12 py-8 max-w-none pb-[calc(120px+env(safe-area-inset-bottom,0px))] md:pb-12">
                {children}
              </div>
              <ThanhDieuHuongDuoi />
            </main>
          </div>
          <SidebarMobileDrawer />
        </BocXacThucToanUngDung>
      </body>
    </html>
  );
}
```

---

### FILE 2: `src/app/(he_thong)/layout.tsx` (GROUP LAYOUT - CHỈ AUTH GUARD)

```tsx
'use client';

import KhoaTruyCap from '../../thanh_phan/xac_thuc/khoa_truy_cap';

export default function BoCucNhomHeThong({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <KhoaTruyCap chuyenHuongKhiChuaDangNhap={true}>
      {children}
    </KhoaTruyCap>
  );
}
```

---

### FILE 3: `src/app/globals.css` (CSS TOÀN CỤC - THEME INLINE)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600&display=swap');
@import "tailwindcss";

:root {
  color-scheme: light;
  --background: #ffffff;
  --foreground: #0f172a;
  --muted: #f8fafc;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  --mau-chu-dao: #2563eb;
  --mau-thanh-cong: #10b981;
  --mau-canh-bao: #f97316;
  --mau-loi: #ef4444;
  --mau-chu-dao-pha-10: color-mix(in srgb, var(--mau-chu-dao) 10%, transparent);
  --mau-chu-dao-pha-15: color-mix(in srgb, var(--mau-chu-dao) 15%, transparent);
  --mau-chu-dao-pha-20: color-mix(in srgb, var(--mau-chu-dao) 20%, transparent);
  --mau-thanh-cong-pha-10: color-mix(in srgb, var(--mau-thanh-cong) 10%, transparent);
  --mau-thanh-cong-pha-15: color-mix(in srgb, var(--mau-thanh-cong) 15%, transparent);
  --mau-thanh-cong-pha-20: color-mix(in srgb, var(--mau-thanh-cong) 20%, transparent);
  --mau-canh-bao-pha-10: color-mix(in srgb, var(--mau-canh-bao) 10%, transparent);
  --mau-canh-bao-pha-15: color-mix(in srgb, var(--mau-canh-bao) 15%, transparent);
  --mau-canh-bao-pha-20: color-mix(in srgb, var(--mau-canh-bao) 20%, transparent);
  --mau-loi-pha-10: color-mix(in srgb, var(--mau-loi) 10%, transparent);
  --mau-loi-pha-15: color-mix(in srgb, var(--mau-loi) 15%, transparent);
  --mau-loi-pha-20: color-mix(in srgb, var(--mau-loi) 20%, transparent);
  --card-icon-bg-primary: var(--mau-chu-dao-pha-10);
  --card-icon-fg-primary: var(--mau-chu-dao);
  --card-icon-br-primary: var(--mau-chu-dao-pha-15);
  --card-icon-bg-success: var(--mau-thanh-cong-pha-10);
  --card-icon-fg-success: var(--mau-thanh-cong);
  --card-icon-br-success: var(--mau-thanh-cong-pha-15);
  --card-icon-bg-warning: var(--mau-canh-bao-pha-10);
  --card-icon-fg-warning: var(--mau-canh-bao);
  --card-icon-br-warning: var(--mau-canh-bao-pha-15);
  --card-icon-bg-danger: var(--mau-loi-pha-10);
  --card-icon-fg-danger: var(--mau-loi);
  --card-icon-br-danger: var(--mau-loi-pha-15);
  --card-icon-bg-muted: var(--muted);
  --card-icon-fg-muted: var(--muted-foreground);
  --card-icon-br-muted: var(--border);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-primary: var(--mau-chu-dao);
  --color-primary-foreground: #ffffff;
  --color-success: var(--mau-thanh-cong);
  --color-success-foreground: #ffffff;
  --color-warning: var(--mau-canh-bao);
  --color-warning-foreground: #ffffff;
  --color-danger: var(--mau-loi);
  --color-danger-foreground: #ffffff;
  --color-card-icon-bg-primary: var(--card-icon-bg-primary);
  --color-card-icon-fg-primary: var(--card-icon-fg-primary);
  --color-card-icon-br-primary: var(--card-icon-br-primary);
  --color-card-icon-bg-success: var(--card-icon-bg-success);
  --color-card-icon-fg-success: var(--card-icon-fg-success);
  --color-card-icon-br-success: var(--card-icon-br-success);
  --color-card-icon-bg-warning: var(--card-icon-bg-warning);
  --color-card-icon-fg-warning: var(--card-icon-fg-warning);
  --color-card-icon-br-warning: var(--card-icon-br-warning);
  --color-card-icon-bg-danger: var(--card-icon-bg-danger);
  --color-card-icon-fg-danger: var(--card-icon-fg-danger);
  --color-card-icon-br-danger: var(--card-icon-br-danger);
  --color-card-icon-bg-muted: var(--card-icon-bg-muted);
  --color-card-icon-fg-muted: var(--card-icon-fg-muted);
  --color-card-icon-br-muted: var(--card-icon-br-muted);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
  --radius-button: 0.625rem;
  --radius-input: 0.625rem;
  --radius-card: 1rem;
  --radius-pop: 1.25rem;
  --shadow-card: 0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.04);
  --shadow-pop: 0 10px 25px -12px rgb(15 23 42 / 0.20), 0 4px 12px -6px rgb(15 23 42 / 0.10);
}

* { box-sizing: border-box; padding: 0; margin: 0; }

html { min-height: 100dvh; }

body {
  min-height: 100dvh;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.tabular { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
```

---

### FILE 4: `src/thanh_phan/layout_sidebar.tsx` — SidebarDesktop Component

```tsx
export function SidebarDesktop() {
  const { pathname, nguoiDungHienTai, dangXuLy, nhomHienTai, laQuyenQuanTri, xuLyDangXuat } = useSidebarShared();
  return (
    <aside className="hidden md:flex w-full h-full shrink-0 flex-col bg-background border-r border-border">
      {renderHeaderSidebar(nhomHienTai)}
      {renderDanhMuc(pathname, laQuyenQuanTri)}
      {renderCuoiSidebar(nguoiDungHienTai, dangXuLy, xuLyDangXuat)}
    </aside>
  );
}
```

---

### FILE 5: `src/thanh_phan/layout_topbar.tsx` — Topbar Header

```tsx
<header className="sticky top-0 z-30 h-16 shrink-0 bg-background/95 backdrop-blur border-b border-border px-5 sm:px-8 md:px-12 flex items-center gap-4 min-w-0 w-full">
  <button type="button" onClick={moMenuMobile} className="md:hidden inline-flex items-center justify-center size-10 rounded-[var(--radius-input)] border border-border bg-background text-foreground hover:bg-muted transition shrink-0" aria-label="Mo menu">
    <Menu className="size-4" strokeWidth={2.25} />
  </button>
  <div className="min-w-0 flex-1">
    <div className="flex items-baseline gap-2 min-w-0">
      <h1 className="text-base lg:text-lg font-bold text-foreground truncate">{thongTin.nhan}</h1>
    </div>
  </div>
</header>
```

---

### FILE 6: `src/app/(he_thong)/khach-hang/page.tsx` — RETURN (JSX TRANG ĐANG BỊ LỖI)

```tsx
return (
  <Bo_Cuc_Trang
    tieu_de="Quản lý khách hàng"
    phu_de="Theo dõi toàn bộ khách hàng, liên hệ, trạng thái hợp tác và người phụ trách."
    badge_tieu_de={<Hieu kieu="primary" kich_thuoc="sm">CRM</Hieu>}
    hanh_dong_phai={
      <Nut kieu="primary" kich_thuoc="md" icon_trai={Plus} onClick={mo_them_moi} className="shrink-0">
        Thêm khách hàng
      </Nut>
    }
  >
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <CardThongKe label="Tổng khách hàng (lọc)" gia_tri={so_luong_theo_trang_thai.tong} icon={Building2} mau="primary" />
      <CardThongKe label="Đang hợp tác" gia_tri={so_luong_theo_trang_thai.hoat_dong} icon={CheckCircle2} mau="success" />
      <CardThongKe label="Tạm dừng" gia_tri={so_luong_theo_trang_thai.tam_dung} icon={AlertTriangle} mau="warning" />
      <CardThongKe label="Đã xóa (tạm)" gia_tri={so_luong_theo_trang_thai.da_xoa} icon={Trash2} mau="danger" />
    </div>

    <BoLocKhachHang gia_tri_hien_tai={dieu_kien} khi_thay_doi={set_dieu_kien} />

    {dang_tai ? (
      <div className="rounded-[var(--radius-card)] border border-border bg-background p-10 flex items-center justify-center text-muted-foreground gap-3 shadow-[var(--shadow-card)]">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm font-semibold">Đang tải danh sách khách hàng...</span>
      </div>
    ) : danh_sach.length === 0 ? (
      <KhongCoDuLieu onThemMoi={mo_them_moi} />
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {danh_sach.map((kh) => (
          <TheKhachHang
            key={kh.id}
            kh={kh}
            onSua={() => mo_chinh_sua(kh)}
            onDoiTrangThai={() => xu_ly_doi_trang_thai(kh)}
            onXoaMem={() => xu_ly_xoa_mem(kh)}
            dangXuLyDoiTT={Boolean(dang_xu_ly_khac[`doi_tt_${kh.id}`])}
            dangXuLyXoa={Boolean(dang_xu_ly_khac[`xoa_${kh.id}`])}
          />
        ))}
      </div>
    )}

    <FormKhachHangDrawer mo={mo_drawer} khi_dong={() => { set_mo_drawer(false); set_dang_sua(null); set_loi_form(null); }} dang_sua={dang_sua} khi_luu={xu_ly_luu_form} dang_xu_ly={dang_xu_ly_form} loi_thong_bao={loi_form} />

    <div className="fixed top-4 right-4 z-[90] space-y-2 max-w-xs w-full pointer-events-none">
      {ds_thong_bao.map((t) => (
        <div key={t.id} className={cn(
          'pointer-events-auto shadow-[var(--shadow-pop)] rounded-[var(--radius-card)] p-4 flex items-start gap-3 text-sm border',
          t.dang === 'thanh_cong' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
        )}>
          {t.dang === 'thanh_cong' ? <CheckCircle2 className="size-5 mt-0.5 shrink-0" /> : <AlertTriangle className="size-5 mt-0.5 shrink-0" />}
          <div className="min-w-0 flex-1 font-medium">{t.noi_dung}</div>
          <button type="button" aria-label="Đóng thông báo" onClick={() => set_ds_thong_bao((ds) => ds.filter((x) => x.id !== t.id))} className={cn('size-6 shrink-0 rounded-[var(--radius-input)] inline-flex items-center justify-center transition', t.dang === 'thanh_cong' ? 'hover:bg-success/15' : 'hover:bg-danger/15')}>
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  </Bo_Cuc_Trang>
);
```
