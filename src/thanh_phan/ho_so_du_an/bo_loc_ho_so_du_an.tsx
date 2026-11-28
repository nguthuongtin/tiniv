'use client';

import { X, Search, ChevronDown, Building2, UserRound, Users, Calendar, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ThanhLocChuan } from '../ui';
import type { DieuKienLocHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import type {
  GiaiDoanDuAn,
  MucDoTiemNangKyHopDong
} from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';

const CAC_GIAI_DOAN: Array<{ gia_tri: 'tat_ca' | GiaiDoanDuAn; nhan: string }> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả giai đoạn' },
  { gia_tri: 'tiep_can', nhan: '1. Tiếp cận' },
  { gia_tri: 'bao_gia', nhan: '2. Báo giá' },
  { gia_tri: 'co_chu_truong', nhan: '3. Có chủ trương' },
  { gia_tri: 'ky_hop_dong', nhan: '4. Ký HĐ' },
  { gia_tri: 'tt_dot_1', nhan: '5. TT đợt 1' },
  { gia_tri: 'trien_khai', nhan: '6. Triển khai' },
  { gia_tri: 'hoan_thanh_tt_dot_2', nhan: '7. Hoàn thành & TT đợt 2' },
  { gia_tri: 'tam_dung_huy', nhan: '8. Tạm dừng / Hủy' }
];

const CAC_MUC_TIEM_NANG: Array<{
  gia_tri: 'tat_ca' | MucDoTiemNangKyHopDong;
  nhan: string;
}> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả mức tiềm năng' },
  { gia_tri: 'rat_cao', nhan: 'Rất cao' },
  { gia_tri: 'cao', nhan: 'Cao' },
  { gia_tri: 'trung_binh', nhan: 'Trung bình' },
  { gia_tri: 'thap', nhan: 'Thấp' },
  { gia_tri: 'rat_thap', nhan: 'Rất thấp' }
];

const CAC_TRANG_THAI: Array<{ gia_tri: DieuKienLocHoSoDuAn['trang_thai']; nhan: string }> = [
  { gia_tri: 'hoat_dong', nhan: 'Đang hoạt động (Mặc định)' },
  { gia_tri: 'da_xoa', nhan: 'Đã xóa (Thùng rác)' },
  { gia_tri: 'tat_ca', nhan: 'Tất cả trạng thái' }
];

interface BoLocHoSoDuAnProps {
  gia_tri_hien_tai: DieuKienLocHoSoDuAn;
  khi_thay_doi: (gia_tri_moi: DieuKienLocHoSoDuAn) => void;
  ds_khach_hang?: KhachHang[];
  ds_nhan_su?: NhanSu[];
  kieu_sap_xep?: 'tiem_nang' | 'moi_nhat' | 'cu_nhat' | 'gia_tri_cao' | 'ten_az';
  khi_doi_sap_xep?: (kieu: 'tiem_nang' | 'moi_nhat' | 'cu_nhat' | 'gia_tri_cao' | 'ten_az') => void;
}

export default function BoLocHoSoDuAn({
  gia_tri_hien_tai,
  khi_thay_doi,
  ds_khach_hang = [],
  ds_nhan_su = [],
  kieu_sap_xep = 'tiem_nang',
  khi_doi_sap_xep
}: BoLocHoSoDuAnProps) {
  const [tuKhoaKH, setTuKhoaKH] = useState('');
  const [moDropdownKH, setMoDropdownKH] = useState(false);

  const khachHangDangChon = useMemo(() => {
    if (!gia_tri_hien_tai.khach_hang_id) return null;
    return ds_khach_hang.find((k) => k.id === gia_tri_hien_tai.khach_hang_id) || null;
  }, [gia_tri_hien_tai.khach_hang_id, ds_khach_hang]);

  const dsKHLoc = useMemo(() => {
    if (!tuKhoaKH.trim()) return ds_khach_hang.slice(0, 40);
    const kw = tuKhoaKH.toLowerCase().trim();
    return ds_khach_hang
      .filter((k) =>
        k.ten_khach_hang.toLowerCase().includes(kw) ||
        (k.ma_so_thue && k.ma_so_thue.toLowerCase().includes(kw))
      )
      .slice(0, 40);
  }, [ds_khach_hang, tuKhoaKH]);

  const tuKhoa = gia_tri_hien_tai.tuKhoa ?? '';
  const soLuongDieuKienKhacMacDinh = useMemo(() => {
    let dem = 0;
    if (tuKhoa && tuKhoa.trim().length > 0) dem++;
    if (gia_tri_hien_tai.giai_doan && gia_tri_hien_tai.giai_doan !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.muc_do_tiem_nang && gia_tri_hien_tai.muc_do_tiem_nang !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.trang_thai && gia_tri_hien_tai.trang_thai !== 'hoat_dong') dem++;
    if (gia_tri_hien_tai.khach_hang_id) dem++;
    if (gia_tri_hien_tai.nguoi_quan_ly_id) dem++;
    if (gia_tri_hien_tai.nguoi_phu_trach_id) dem++;
    if (gia_tri_hien_tai.ngay_tao_tu_ngay) dem++;
    if (gia_tri_hien_tai.ngay_tao_den_ngay) dem++;
    if (gia_tri_hien_tai.thoi_han_hoan_thanh_tu_ngay) dem++;
    if (gia_tri_hien_tai.thoi_han_hoan_thanh_den_ngay) dem++;
    return dem;
  }, [gia_tri_hien_tai, tuKhoa]);

  const datGiaTri = <K extends keyof DieuKienLocHoSoDuAn>(
    k: K,
    v: DieuKienLocHoSoDuAn[K]
  ) => {
    khi_thay_doi({ ...gia_tri_hien_tai, [k]: v });
  };

  const xoaTatCa = () => {
    khi_thay_doi({
      tuKhoa: null,
      khach_hang_id: null,
      giai_doan: 'tat_ca',
      muc_do_tiem_nang: 'tat_ca',
      nguoi_quan_ly_id: null,
      nguoi_phu_trach_id: null,
      trang_thai: 'hoat_dong',
      ngay_tao_tu_ngay: null,
      ngay_tao_den_ngay: null,
      thoi_han_hoan_thanh_tu_ngay: null,
      thoi_han_hoan_thanh_den_ngay: null
    });
  };

  const chipsNhanh = useMemo(
    () => [
      {
        khoa: 'tat_ca',
        nhan: 'Tất cả',
        dang_chon:
          (!gia_tri_hien_tai.giai_doan || gia_tri_hien_tai.giai_doan === 'tat_ca') &&
          (!gia_tri_hien_tai.muc_do_tiem_nang || gia_tri_hien_tai.muc_do_tiem_nang === 'tat_ca'),
        khi_bam: () =>
          khi_thay_doi({
            ...gia_tri_hien_tai,
            giai_doan: 'tat_ca',
            muc_do_tiem_nang: 'tat_ca'
          })
      },
      {
        khoa: 'rat_cao',
        nhan: 'Tiềm năng rất cao',
        dang_chon: gia_tri_hien_tai.muc_do_tiem_nang === 'rat_cao',
        khi_bam: () =>
          datGiaTri(
            'muc_do_tiem_nang',
            gia_tri_hien_tai.muc_do_tiem_nang === 'rat_cao' ? 'tat_ca' : 'rat_cao'
          )
      },
      {
        khoa: 'bao_gia',
        nhan: 'Báo giá',
        dang_chon: gia_tri_hien_tai.giai_doan === 'bao_gia',
        khi_bam: () =>
          datGiaTri('giai_doan', gia_tri_hien_tai.giai_doan === 'bao_gia' ? 'tat_ca' : 'bao_gia')
      },
      {
        khoa: 'ky_hop_dong',
        nhan: 'Ký HĐ',
        dang_chon: gia_tri_hien_tai.giai_doan === 'ky_hop_dong',
        khi_bam: () =>
          datGiaTri(
            'giai_doan',
            gia_tri_hien_tai.giai_doan === 'ky_hop_dong' ? 'tat_ca' : 'ky_hop_dong'
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
      placeholder="Tìm tên dự án, khách hàng..."
      so_dieu_kien={soLuongDieuKienKhacMacDinh}
      khi_xoa_tat_ca={xoaTatCa}
      chips_nhanh={chipsNhanh}
      tieu_de_bo_loc="Bộ lọc hồ sơ dự án"
      sap_xep={
        khi_doi_sap_xep
          ? {
              gia_tri: kieu_sap_xep,
              mac_dinh: 'tiem_nang',
              khi_doi: (v) => khi_doi_sap_xep(v as NonNullable<BoLocHoSoDuAnProps['kieu_sap_xep']>),
              aria_label: 'Sắp xếp danh sách dự án',
              tuy_chon: [
                { gia_tri: 'tiem_nang', nhan: 'Sắp xếp: Tiềm năng cao → thấp' },
                { gia_tri: 'moi_nhat', nhan: 'Sắp xếp: Mới nhất' },
                { gia_tri: 'cu_nhat', nhan: 'Sắp xếp: Cũ nhất' },
                { gia_tri: 'gia_tri_cao', nhan: 'Sắp xếp: Giá trị cao' },
                { gia_tri: 'ten_az', nhan: 'Sắp xếp: Tên A-Z' }
              ]
            }
          : undefined
      }
    >
      <BoLocMuc label={<><Building2 className="size-3.5 text-slate-500" /> Khách hàng (Công ty)</>}>
        <div className="relative">
          {khachHangDangChon ? (
            <div className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 flex items-center justify-between text-xs font-semibold">
              <span className="truncate text-slate-800 dark:text-slate-200">{khachHangDangChon.ten_khach_hang}</span>
              <button
                type="button"
                onClick={() => {
                  datGiaTri('khach_hang_id', null);
                  setTuKhoaKH('');
                  setMoDropdownKH(false);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                title="Bỏ chọn"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="size-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={tuKhoaKH}
                  onChange={(e) => {
                    setTuKhoaKH(e.target.value);
                    setMoDropdownKH(true);
                  }}
                  onFocus={() => setMoDropdownKH(true)}
                  placeholder="Tìm theo tên hoặc MST khách hàng..."
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8.5 pr-8 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-600"
                />
                <ChevronDown className="size-3.5 absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              {moDropdownKH && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setMoDropdownKH(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl divide-y divide-slate-100 dark:divide-slate-700">
                    <div
                      onClick={() => {
                        datGiaTri('khach_hang_id', null);
                        setMoDropdownKH(false);
                      }}
                      className="p-2.5 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer italic"
                    >
                      Tất cả khách hàng
                    </div>
                    {dsKHLoc.length === 0 ? (
                      <div className="p-2.5 text-xs text-slate-400 italic text-center">
                        Không tìm thấy khách hàng
                      </div>
                    ) : (
                      dsKHLoc.map((kh) => (
                        <div
                          key={kh.id}
                          onClick={() => {
                            datGiaTri('khach_hang_id', kh.id);
                            setMoDropdownKH(false);
                          }}
                          className="p-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {kh.ten_khach_hang}
                            </div>
                            {kh.ma_so_thue && (
                              <div className="text-[10.5px] text-slate-400 font-mono">
                                MST: {kh.ma_so_thue}
                              </div>
                            )}
                          </div>
                          {gia_tri_hien_tai.khach_hang_id === kh.id && (
                            <Check className="size-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </BoLocMuc>
      <BoLocMuc label={<><UserRound className="size-3.5 text-slate-500" /> Giai đoạn dự án</>}>
        <select
          value={(gia_tri_hien_tai.giai_doan as string) ?? 'tat_ca'}
          onChange={(e) =>
            datGiaTri('giai_doan', e.target.value as DieuKienLocHoSoDuAn['giai_doan'])
          }
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
        >
          {CAC_GIAI_DOAN.map((x) => (
            <option key={x.gia_tri} value={x.gia_tri}>
              {x.nhan}
            </option>
          ))}
        </select>
      </BoLocMuc>
      <BoLocMuc label={<><UserRound className="size-3.5 text-slate-500" /> Mức tiềm năng ký</>}>
        <select
          value={(gia_tri_hien_tai.muc_do_tiem_nang as string) ?? 'tat_ca'}
          onChange={(e) =>
            datGiaTri(
              'muc_do_tiem_nang',
              e.target.value as DieuKienLocHoSoDuAn['muc_do_tiem_nang']
            )
          }
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
        >
          {CAC_MUC_TIEM_NANG.map((x) => (
            <option key={x.gia_tri} value={x.gia_tri}>
              {x.nhan}
            </option>
          ))}
        </select>
      </BoLocMuc>
      <BoLocMuc label={<><Users className="size-3.5 text-slate-500" /> Người quản lý</>}>
        <select
          value={gia_tri_hien_tai.nguoi_quan_ly_id ?? ''}
          onChange={(e) => datGiaTri('nguoi_quan_ly_id', e.target.value ? e.target.value : null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
        >
          <option value="">Tất cả người quản lý</option>
          {ds_nhan_su.map((ns) => (
            <option key={ns.id} value={ns.id}>
              {ns.ho_va_ten}
              {ns.chuc_vu ? ` — ${ns.chuc_vu}` : ''}
            </option>
          ))}
        </select>
      </BoLocMuc>
      <BoLocMuc label={<><Users className="size-3.5 text-slate-500" /> Người phụ trách chính (PIC)</>}>
        <select
          value={gia_tri_hien_tai.nguoi_phu_trach_id ?? ''}
          onChange={(e) => datGiaTri('nguoi_phu_trach_id', e.target.value ? e.target.value : null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
        >
          <option value="">Tất cả người phụ trách</option>
          {ds_nhan_su.map((ns) => (
            <option key={ns.id} value={ns.id}>
              {ns.ho_va_ten}
              {ns.vai_tro ? ` — ${String(ns.vai_tro).replace(/_/g, ' ')}` : ''}
            </option>
          ))}
        </select>
      </BoLocMuc>
      <BoLocMuc label="Trạng thái hồ sơ">
        <select
          value={(gia_tri_hien_tai.trang_thai as string) ?? 'hoat_dong'}
          onChange={(e) =>
            datGiaTri('trang_thai', e.target.value as DieuKienLocHoSoDuAn['trang_thai'])
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

      <div className="col-span-full h-px bg-slate-200/80 my-1" />

      <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tiếp cận từ ngày</>}>
        <input
          type="date"
          value={gia_tri_hien_tai.ngay_tao_tu_ngay ?? ''}
          onChange={(e) => datGiaTri('ngay_tao_tu_ngay', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
        />
      </BoLocMuc>
      <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tiếp cận đến ngày</>}>
        <input
          type="date"
          value={gia_tri_hien_tai.ngay_tao_den_ngay ?? ''}
          onChange={(e) => datGiaTri('ngay_tao_den_ngay', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
        />
      </BoLocMuc>
      <div className="hidden lg:block h-10" />
      <BoLocMuc label={<><Calendar className="size-3.5 text-[#FF9500]" /> Dự kiến ký HĐ từ ngày</>}>
        <input
          type="date"
          value={gia_tri_hien_tai.thoi_han_hoan_thanh_tu_ngay ?? ''}
          onChange={(e) => datGiaTri('thoi_han_hoan_thanh_tu_ngay', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-[#FF9500]/30 bg-amber-50/40 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] shadow-2xs"
        />
      </BoLocMuc>
      <BoLocMuc label={<><Calendar className="size-3.5 text-[#FF9500]" /> Dự kiến ký HĐ đến ngày</>}>
        <input
          type="date"
          value={gia_tri_hien_tai.thoi_han_hoan_thanh_den_ngay ?? ''}
          onChange={(e) => datGiaTri('thoi_han_hoan_thanh_den_ngay', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-[#FF9500]/30 bg-amber-50/40 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] shadow-2xs"
        />
      </BoLocMuc>
    </ThanhLocChuan>
  );
}

const BoLocMuc = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-600 mb-1 inline-flex items-center gap-1.5">
      {label}
    </span>
    {children}
  </label>
);
