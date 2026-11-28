'use client';

import { Building2, UserRound, Users, Calendar, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { ThanhLocChuan } from '../ui';
import type { DieuKienLocKhachHang } from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import type { LoaiKhachHang } from '../../thu_vien/types/khach_hang';
import type { ChiNhanh, NhanSu } from '../../thu_vien/types/nhan_su';

const CAC_LOAI_KH: Array<{ gia_tri: 'tat_ca' | LoaiKhachHang; nhan: string }> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả loại' },
  { gia_tri: 'doanh_nghiep', nhan: 'Doanh nghiệp' },
  { gia_tri: 'ca_nhan', nhan: 'Cá nhân' },
  { gia_tri: 'to_chuc', nhan: 'Tổ chức' },
  { gia_tri: 'khac', nhan: 'Khác' }
];

const CAC_TRANG_THAI: Array<{ gia_tri: DieuKienLocKhachHang['trang_thai']; nhan: string }> = [
  { gia_tri: 'hoat_dong', nhan: 'Đang hoạt động (Mặc định)' },
  { gia_tri: 'tam_dung', nhan: 'Tạm dừng' },
  { gia_tri: 'da_xoa', nhan: 'Đã xóa (Thùng rác)' },
  { gia_tri: 'tat_ca', nhan: 'Tất cả trạng thái' }
];

export type KieuSapXepKhachHang = 'moi_nhat' | 'cu_nhat' | 'ten_az';

interface BoLocKhachHangProps {
  gia_tri_hien_tai: DieuKienLocKhachHang;
  khi_thay_doi: (gia_tri_moi: DieuKienLocKhachHang) => void;
  dsChiNhanh?: ChiNhanh[];
  dsNhanSu?: NhanSu[];
  kieu_sap_xep?: KieuSapXepKhachHang;
  khi_doi_sap_xep?: (kieu: KieuSapXepKhachHang) => void;
}

export default function BoLocKhachHang({
  gia_tri_hien_tai,
  khi_thay_doi,
  dsChiNhanh = [],
  dsNhanSu = [],
  kieu_sap_xep = 'moi_nhat',
  khi_doi_sap_xep
}: BoLocKhachHangProps) {
  const tuKhoa = gia_tri_hien_tai.tuKhoa ?? '';
  const soLuongDieuKienKhacMacDinh = useMemo(() => {
    let dem = 0;
    if (tuKhoa && tuKhoa.trim().length > 0) dem++;
    if (gia_tri_hien_tai.loai_khach_hang && gia_tri_hien_tai.loai_khach_hang !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.trang_thai && gia_tri_hien_tai.trang_thai !== 'hoat_dong') dem++;
    if (gia_tri_hien_tai.chi_nhanh_id && gia_tri_hien_tai.chi_nhanh_id !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.nguoi_phu_trach_id && gia_tri_hien_tai.nguoi_phu_trach_id !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.ngay_tao_tu_ngay) dem++;
    if (gia_tri_hien_tai.ngay_tao_den_ngay) dem++;
    return dem;
  }, [gia_tri_hien_tai, tuKhoa]);

  const datGiaTri = <K extends keyof DieuKienLocKhachHang>(k: K, v: DieuKienLocKhachHang[K]) => {
    khi_thay_doi({ ...gia_tri_hien_tai, [k]: v });
  };

  const xoaTatCa = () => {
    khi_thay_doi({
      tuKhoa: null,
      loai_khach_hang: 'tat_ca',
      trang_thai: 'hoat_dong',
      chi_nhanh_id: null,
      nguoi_phu_trach_id: null,
      ngay_tao_tu_ngay: null,
      ngay_tao_den_ngay: null
    });
  };

  const chipsNhanh = useMemo(
    () => [
      {
        khoa: 'tat_ca',
        nhan: 'Tất cả',
        dang_chon: !gia_tri_hien_tai.loai_khach_hang || gia_tri_hien_tai.loai_khach_hang === 'tat_ca',
        khi_bam: () => datGiaTri('loai_khach_hang', 'tat_ca')
      },
      {
        khoa: 'doanh_nghiep',
        nhan: 'Doanh nghiệp',
        dang_chon: gia_tri_hien_tai.loai_khach_hang === 'doanh_nghiep',
        khi_bam: () =>
          datGiaTri(
            'loai_khach_hang',
            gia_tri_hien_tai.loai_khach_hang === 'doanh_nghiep' ? 'tat_ca' : 'doanh_nghiep'
          )
      },
      {
        khoa: 'ca_nhan',
        nhan: 'Cá nhân',
        dang_chon: gia_tri_hien_tai.loai_khach_hang === 'ca_nhan',
        khi_bam: () =>
          datGiaTri(
            'loai_khach_hang',
            gia_tri_hien_tai.loai_khach_hang === 'ca_nhan' ? 'tat_ca' : 'ca_nhan'
          )
      },
      {
        khoa: 'to_chuc',
        nhan: 'Tổ chức',
        dang_chon: gia_tri_hien_tai.loai_khach_hang === 'to_chuc',
        khi_bam: () =>
          datGiaTri(
            'loai_khach_hang',
            gia_tri_hien_tai.loai_khach_hang === 'to_chuc' ? 'tat_ca' : 'to_chuc'
          )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gia_tri_hien_tai]
  );

  return (
    <ThanhLocChuan
      tu_khoa={tuKhoa}
      khi_doi_tu_khoa={(v) => datGiaTri('tuKhoa', v)}
      placeholder="Tìm tên, MST, SĐT khách hàng..."
      so_dieu_kien={soLuongDieuKienKhacMacDinh}
      khi_xoa_tat_ca={xoaTatCa}
      chips_nhanh={chipsNhanh}
      tieu_de_bo_loc="Bộ lọc khách hàng"
      sap_xep={
        khi_doi_sap_xep
          ? {
              gia_tri: kieu_sap_xep,
              mac_dinh: 'moi_nhat',
              khi_doi: (v) => khi_doi_sap_xep(v as KieuSapXepKhachHang),
              aria_label: 'Sắp xếp khách hàng',
              tuy_chon: [
                { gia_tri: 'moi_nhat', nhan: 'Sắp xếp: Mới nhất' },
                { gia_tri: 'cu_nhat', nhan: 'Sắp xếp: Cũ nhất' },
                { gia_tri: 'ten_az', nhan: 'Sắp xếp: Tên A-Z' }
              ]
            }
          : undefined
      }
    >
      <BoLocMuc label={<><Users className="size-3.5 text-slate-500" /> Loại khách hàng</>}>
            <select
              value={(gia_tri_hien_tai.loai_khach_hang as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('loai_khach_hang', e.target.value as DieuKienLocKhachHang['loai_khach_hang'])
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              {CAC_LOAI_KH.map((x) => (
                <option key={x.gia_tri} value={x.gia_tri}>
                  {x.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><ShieldCheck className="size-3.5 text-slate-500" /> Trạng thái hợp tác</>}>
            <select
              value={(gia_tri_hien_tai.trang_thai as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('trang_thai', e.target.value as DieuKienLocKhachHang['trang_thai'])
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              {CAC_TRANG_THAI.filter(Boolean).map((x) => (
                <option key={x!.gia_tri} value={x!.gia_tri as string}>
                  {x!.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><Building2 className="size-3.5 text-slate-500" /> Chi nhánh phụ trách</>}>
            <select
              value={gia_tri_hien_tai.chi_nhanh_id ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('chi_nhanh_id', e.target.value === 'tat_ca' ? null : e.target.value)
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              <option value="tat_ca">Tất cả chi nhánh</option>
              {dsChiNhanh.map((cn) => (
                <option key={cn.id} value={cn.id}>
                  {cn.ten_chi_nhanh}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><UserRound className="size-3.5 text-slate-500" /> Người phụ trách chính</>}>
            <select
              value={gia_tri_hien_tai.nguoi_phu_trach_id ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('nguoi_phu_trach_id', e.target.value === 'tat_ca' ? null : e.target.value)
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              <option value="tat_ca">Tất cả người phụ trách</option>
              {dsNhanSu.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten} {ns.ma_nhan_vien ? `(${ns.ma_nhan_vien})` : ''}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tạo từ</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_tu_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
          </BoLocMuc>

          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tạo đến</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_den_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
          </BoLocMuc>
    </ThanhLocChuan>
  );
}

const BoLocMuc = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <label className="block space-y-1.5">
    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">{label}</span>
    {children}
  </label>
);
