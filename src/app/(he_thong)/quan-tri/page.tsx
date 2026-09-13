'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Layers,
  Briefcase,
  Shield,
  Settings,
  Package2,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import type { ChiNhanh, PhongBan, NhanSu, VaiTro, ChucVu } from '../../../thu_vien/types/nhan_su';
import type { SanPhamDichVu, NhomSanPhamDichVu } from '../../../thu_vien/types/san_pham_dich_vu';
import type { CauHinhMotGiaiDoan } from '../../../thu_vien/cau_hinh/giai_doan_du_an';
import {
  danhSachChiNhanh,
  taoChiNhanhMoi,
  capNhatChiNhanh,
  xoaMemChiNhanh,
  khoiPhucChiNhanh
} from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import {
  danhSachPhongBan,
  taoPhongBanMoi,
  capNhatPhongBan,
  xoaMemPhongBan,
  khoiPhucPhongBan
} from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import {
  danhSachChucVu,
  taoChucVuMoi,
  capNhatChucVu,
  xoaMemChucVu,
  khoiPhucChucVu
} from '../../../dich_vu/nhan_su/dich_vu_chuc_vu';
import {
  danhSachVaiTro,
  taoVaiTroMoi,
  capNhatVaiTro
} from '../../../dich_vu/nhan_su/dich_vu_vai_tro';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import {
  layCauHinhGiaiDoanDuAn,
  capNhatCauHinhGiaiDoanDuAn
} from '../../../dich_vu/cau_hinh/dich_vu_cau_hinh_giai_doan_du_an';
import {
  danhSachSanPhamDichVu,
  taoSanPhamDichVuMoi,
  capNhatSanPhamDichVu,
  xoaMemSanPhamDichVu,
  khoiPhucSanPhamDichVu
} from '../../../dich_vu/san_pham_dich_vu/dich_vu_san_pham_dich_vu';
import {
  danhSachNhomSanPhamDichVu,
  taoNhomSanPhamDichVuMoi,
  capNhatNhomSanPhamDichVu,
  xoaMemNhomSanPhamDichVu,
  khoiPhucNhomSanPhamDichVu
} from '../../../dich_vu/san_pham_dich_vu/dich_vu_nhom_san_pham_dich_vu';

import BangChiNhanh from '../../../thanh_phan/quan_tri/bang_chi_nhanh';
import BangPhongBan from '../../../thanh_phan/quan_tri/bang_phong_ban';
import BangChucVu from '../../../thanh_phan/quan_tri/bang_chuc_vu';
import BangVaiTro from '../../../thanh_phan/quan_tri/bang_vai_tro';
import BangMaTranPhanQuyen from '../../../thanh_phan/quan_tri/bang_ma_tran_phan_quyen';
import BangGiaiDoanPipeline from '../../../thanh_phan/quan_tri/bang_giai_doan_pipeline';
import BangSanPhamDichVu from '../../../thanh_phan/quan_tri/bang_san_pham_dich_vu';

type TabQuanTri = 'chi_nhanh' | 'phong_ban' | 'chuc_vu' | 'vai_tro' | 'ma_tran_quyen' | 'giai_doan' | 'san_pham';

interface ToastItem {
  id: number;
  dang: 'thanh_cong' | 'loi';
  noi_dung: string;
}

const NHOM_DIEU_HUONG = [
  {
    nhom: 'Cơ cấu tổ chức',
    cacTab: [
      { key: 'chi_nhanh' as TabQuanTri, nhan: 'Chi nhánh', icon: Building2 },
      { key: 'phong_ban' as TabQuanTri, nhan: 'Phòng ban', icon: Layers },
      { key: 'chuc_vu' as TabQuanTri, nhan: 'Chức danh công việc', icon: Briefcase }
    ]
  },
  {
    nhom: 'Bảo mật & Phân quyền',
    cacTab: [
      { key: 'vai_tro' as TabQuanTri, nhan: 'Danh mục vai trò', icon: Shield },
      { key: 'ma_tran_quyen' as TabQuanTri, nhan: 'Ma trận phân quyền', icon: ShieldCheck }
    ]
  },
  {
    nhom: 'Quy trình & Nghiệp vụ',
    cacTab: [
      { key: 'giai_doan' as TabQuanTri, nhan: 'Giai đoạn Pipeline', icon: Settings },
      { key: 'san_pham' as TabQuanTri, nhan: 'Sản phẩm & Dịch vụ', icon: Package2 }
    ]
  }
];

export default function TrangQuanTri() {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const [tabHienTai, setTabHienTai] = useState<TabQuanTri>('chi_nhanh');
  const [dangTai, setDangTai] = useState(true);

  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsChucVu, setDsChucVu] = useState<ChucVu[]>([]);
  const [dsVaiTro, setDsVaiTro] = useState<VaiTro[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsGiaiDoan, setDsGiaiDoan] = useState<CauHinhMotGiaiDoan[]>([]);
  const [dsSanPham, setDsSanPham] = useState<SanPhamDichVu[]>([]);
  const [dsNhom, setDsNhom] = useState<NhomSanPhamDichVu[]>([]);

  const [dsToast, setDsToast] = useState<ToastItem[]>([]);

  const themToast = useCallback((dang: ToastItem['dang'], noi_dung: string) => {
    const id = Date.now() + Math.random();
    setDsToast((prev) => [...prev, { id, dang, noi_dung }]);
    setTimeout(() => {
      setDsToast((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const taiDuLieu = useCallback(async () => {
    if (!coQuyen(nguoiDungHienTai, 'he_thong.quan_tri')) {
      setDangTai(false);
      return;
    }
    setDangTai(true);
    try {
      const [
        resCN,
        resPB,
        resCV,
        resVT,
        resNS,
        resGD,
        resSP,
        resNhom
      ] = await Promise.allSettled([
        danhSachChiNhanh({ trang_thai_du_lieu: 'tat_ca' }),
        danhSachPhongBan({ trang_thai_du_lieu: 'tat_ca' }),
        danhSachChucVu({ trang_thai_du_lieu: 'tat_ca' }),
        danhSachVaiTro({ trang_thai_du_lieu: 'tat_ca' }),
        danhSachNhanSu({ trang_thai_du_lieu: 'tat_ca' } as any),
        layCauHinhGiaiDoanDuAn(),
        danhSachSanPhamDichVu({ trang_thai_du_lieu: 'tat_ca' }),
        danhSachNhomSanPhamDichVu({ trang_thai_du_lieu: 'tat_ca' })
      ]);

      if (resCN.status === 'fulfilled') setDsChiNhanh(resCN.value.mang);
      if (resPB.status === 'fulfilled') setDsPhongBan(resPB.value.mang);
      if (resCV.status === 'fulfilled') setDsChucVu(resCV.value.mang);
      if (resVT.status === 'fulfilled') setDsVaiTro(resVT.value.mang);
      if (resNS.status === 'fulfilled') setDsNhanSu(resNS.value.mang);
      if (resGD.status === 'fulfilled') setDsGiaiDoan(resGD.value.danh_sach);
      if (resSP.status === 'fulfilled') setDsSanPham(resSP.value.mang);
      if (resNhom.status === 'fulfilled') setDsNhom(resNhom.value.mang);
    } catch (e: any) {
      themToast('loi', 'Không thể tải toàn bộ dữ liệu quản trị: ' + e?.message);
    } finally {
      setDangTai(false);
    }
  }, [themToast]);

  useEffect(() => {
    void taiDuLieu();
  }, [taiDuLieu]);

  // Handlers Chi Nhanh
  const handleLuuChiNhanh = async (dto: any, idSua?: string) => {
    if (idSua) {
      await capNhatChiNhanh(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã cập nhật chi nhánh');
    } else {
      await taoChiNhanhMoi(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã thêm chi nhánh mới');
    }
    await taiDuLieu();
  };

  const handleXoaChiNhanh = async (cnItem: ChiNhanh) => {
    await xoaMemChiNhanh(cnItem.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã xóa chi nhánh');
    await taiDuLieu();
  };

  const handleKhoiPhucChiNhanh = async (cnItem: ChiNhanh) => {
    await khoiPhucChiNhanh(cnItem.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã khôi phục chi nhánh');
    await taiDuLieu();
  };

  // Handlers Phong Ban
  const handleLuuPhongBan = async (dto: any, idSua?: string) => {
    if (idSua) {
      await capNhatPhongBan(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã cập nhật phòng ban');
    } else {
      await taoPhongBanMoi(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã thêm phòng ban mới');
    }
    await taiDuLieu();
  };

  const handleXoaPhongBan = async (pbItem: PhongBan) => {
    await xoaMemPhongBan(pbItem.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã xóa phòng ban');
    await taiDuLieu();
  };

  const handleKhoiPhucPhongBan = async (pbItem: PhongBan) => {
    await khoiPhucPhongBan(pbItem.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã khôi phục phòng ban');
    await taiDuLieu();
  };

  // Handlers Chuc Vu
  const handleLuuChucVu = async (dto: any, idSua?: string) => {
    if (idSua) {
      await capNhatChucVu(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã cập nhật chức vụ');
    } else {
      await taoChucVuMoi(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã thêm chức vụ mới');
    }
    await taiDuLieu();
  };

  const handleXoaChucVu = async (cvItem: ChucVu) => {
    await xoaMemChucVu(cvItem.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã xóa chức vụ');
    await taiDuLieu();
  };

  const handleKhoiPhucChucVu = async (cvItem: ChucVu) => {
    await khoiPhucChucVu(cvItem.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã khôi phục chức vụ');
    await taiDuLieu();
  };

  // Handlers Vai Tro
  const handleLuuVaiTro = async (dto: any, idSua?: string) => {
    if (idSua) {
      await capNhatVaiTro(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã cập nhật vai trò');
    } else {
      await taoVaiTroMoi(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã thiết lập vai trò');
    }
    await taiDuLieu();
  };

  // Handlers Giai Doan Pipeline
  const handleLuuGiaiDoan = async (danhSachMoi: CauHinhMotGiaiDoan[]) => {
    await capNhatCauHinhGiaiDoanDuAn(danhSachMoi);
    themToast('thanh_cong', 'Đã cập nhật cấu hình giai đoạn dự án');
    await taiDuLieu();
  };

  // Handlers San Pham & Nhom
  const handleLuuSp = async (dto: any, idSua?: string) => {
    if (idSua) {
      await capNhatSanPhamDichVu(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã cập nhật sản phẩm / dịch vụ');
    } else {
      await taoSanPhamDichVuMoi(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã thêm sản phẩm / dịch vụ mới');
    }
    await taiDuLieu();
  };

  const handleXoaSp = async (sp: SanPhamDichVu) => {
    await xoaMemSanPhamDichVu(sp.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã xóa sản phẩm / dịch vụ');
    await taiDuLieu();
  };

  const handleKhoiPhucSp = async (sp: SanPhamDichVu) => {
    await khoiPhucSanPhamDichVu(sp.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã khôi phục sản phẩm / dịch vụ');
    await taiDuLieu();
  };

  const handleLuuNhom = async (dto: any, idSua?: string) => {
    if (idSua) {
      await capNhatNhomSanPhamDichVu(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã cập nhật nhóm danh mục');
    } else {
      await taoNhomSanPhamDichVuMoi(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      themToast('thanh_cong', 'Đã thêm nhóm danh mục mới');
    }
    await taiDuLieu();
  };

  const handleXoaNhom = async (nhom: NhomSanPhamDichVu) => {
    await xoaMemNhomSanPhamDichVu(nhom.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã xóa nhóm danh mục');
    await taiDuLieu();
  };

  const handleKhoiPhucNhom = async (nhom: NhomSanPhamDichVu) => {
    await khoiPhucNhomSanPhamDichVu(nhom.id, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
    themToast('thanh_cong', 'Đã khôi phục nhóm danh mục');
    await taiDuLieu();
  };

  if (!coQuyen(nguoiDungHienTai, 'he_thong.quan_tri')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-card rounded-2xl border border-border shadow-sm">
          <div className="mx-auto size-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Không có quyền truy cập</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Bạn không có quyền quản trị hệ thống (<b className="font-mono text-xs">he_thong.quan_tri</b>). Vui lòng liên hệ Quản trị viên để được cấp quyền nếu cần thiết.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full rounded-xl bg-primary text-primary-foreground font-semibold py-2.5 px-4 text-sm hover:opacity-90 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 2-Column SaaS Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Nav Sidebar (Col 3) */}
        <div className="lg:col-span-3 rounded-[var(--radius-card)] border border-border bg-card p-3 shadow-sm space-y-4">
          {NHOM_DIEU_HUONG.map((nhom) => (
            <div key={nhom.nhom} className="space-y-1">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {nhom.nhom}
              </div>
              <div className="space-y-0.5">
                {nhom.cacTab.map((tab) => {
                  const Icon = tab.icon;
                  const dangChon = tabHienTai === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTabHienTai(tab.key)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-input)] text-sm font-medium transition',
                        dangChon
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('size-4', dangChon ? 'text-primary-foreground' : 'text-muted-foreground')} />
                      <span>{tab.nhan}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Content Panel (Col 9) */}
        <div className="lg:col-span-9 rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm min-h-[560px]">
          {tabHienTai === 'chi_nhanh' && (
            <BangChiNhanh
              danhSach={dsChiNhanh}
              dangTai={dangTai}
              onLuu={handleLuuChiNhanh}
              onXoa={handleXoaChiNhanh}
              onKhoiPhuc={handleKhoiPhucChiNhanh}
            />
          )}

          {tabHienTai === 'phong_ban' && (
            <BangPhongBan
              danhSach={dsPhongBan}
              dsChiNhanh={dsChiNhanh}
              dangTai={dangTai}
              onLuu={handleLuuPhongBan}
              onXoa={handleXoaPhongBan}
              onKhoiPhuc={handleKhoiPhucPhongBan}
            />
          )}

          {tabHienTai === 'chuc_vu' && (
            <BangChucVu
              danhSach={dsChucVu}
              dangTai={dangTai}
              onLuu={handleLuuChucVu}
              onXoa={handleXoaChucVu}
              onKhoiPhuc={handleKhoiPhucChucVu}
            />
          )}

          {tabHienTai === 'vai_tro' && (
            <BangVaiTro
              danhSach={dsVaiTro}
              dsNhanSu={dsNhanSu}
              dangTai={dangTai}
              onLuu={handleLuuVaiTro}
            />
          )}

          {tabHienTai === 'ma_tran_quyen' && (
            <BangMaTranPhanQuyen
              danhSachVaiTro={dsVaiTro}
              onThayDoi={taiDuLieu}
            />
          )}

          {tabHienTai === 'giai_doan' && (
            <BangGiaiDoanPipeline
              danhSach={dsGiaiDoan}
              dangTai={dangTai}
              onLuu={handleLuuGiaiDoan}
            />
          )}

          {tabHienTai === 'san_pham' && (
            <BangSanPhamDichVu
              dsSanPham={dsSanPham}
              dsNhom={dsNhom}
              dangTai={dangTai}
              onLuuSp={handleLuuSp}
              onXoaSp={handleXoaSp}
              onKhoiPhucSp={handleKhoiPhucSp}
              onLuuNhom={handleLuuNhom}
              onXoaNhom={handleXoaNhom}
              onKhoiPhucNhom={handleKhoiPhucNhom}
            />
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {dsToast.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
          {dsToast.map((t) => (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto rounded-[var(--radius-input)] border px-4 py-3 shadow-lg flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-150',
                t.dang === 'thanh_cong'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              )}
            >
              {t.dang === 'thanh_cong' ? (
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="size-4 text-destructive shrink-0" />
              )}
              <span>{t.noi_dung}</span>
              <button
                type="button"
                onClick={() => setDsToast((prev) => prev.filter((x) => x.id !== t.id))}
                className="ml-2 opacity-60 hover:opacity-100 transition"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
