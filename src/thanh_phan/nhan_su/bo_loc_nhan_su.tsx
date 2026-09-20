'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X, XCircle, Building2, Layers, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { DieuKienLocNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';

interface BoLocNhanSuProps {
  boLocHienTai: DieuKienLocNhanSu;
  onChange: (boLocMoi: DieuKienLocNhanSu) => void;
  onLamMoi?: () => void;
  onThemMoi?: () => void;
  danhSachChiNhanh?: { id: string; ten_chi_nhanh: string }[];
  danhSachPhongBan?: { id: string; ten_phong_ban: string }[];
  danhSachVaiTro?: { id: string; ten_vai_tro: string }[];
}

const BO_LOC_MAC_DINH: DieuKienLocNhanSu = {
  tuKhoa: null,
  vai_tro: 'tat_ca',
  chi_nhanh_id: null,
  phong_ban_id: null,
  trang_thai_tk: 'tat_ca',
  trang_thai_hoat_dong: 'tat_ca',
  trang_thai_du_lieu: 'hoat_dong',
  ngay_tao_tu_ngay: null,
  ngay_tao_den_ngay: null
};

export default function BoLocNhanSu(props: BoLocNhanSuProps) {
  const {
    boLocHienTai,
    onChange,
    onLamMoi,
    danhSachChiNhanh = [],
    danhSachPhongBan = [],
    danhSachVaiTro = []
  } = props;
  const [moRong, setMoRong] = useState(false);

  const tuKhoa = boLocHienTai.tuKhoa ?? '';

  const soDieuKien = useMemo(() => {
    let dem = 0;
    if (tuKhoa && tuKhoa.trim().length > 0) dem++;
    if (boLocHienTai.vai_tro && boLocHienTai.vai_tro !== 'tat_ca') dem++;
    if (boLocHienTai.chi_nhanh_id) dem++;
    if (boLocHienTai.phong_ban_id) dem++;
    if (boLocHienTai.trang_thai_hoat_dong && boLocHienTai.trang_thai_hoat_dong !== 'tat_ca') dem++;
    if (boLocHienTai.ngay_tao_tu_ngay) dem++;
    if (boLocHienTai.ngay_tao_den_ngay) dem++;
    if (boLocHienTai.trang_thai_du_lieu && boLocHienTai.trang_thai_du_lieu !== 'hoat_dong') dem++;
    return dem;
  }, [boLocHienTai, tuKhoa]);

  const capNhatMotTruong = <K extends keyof DieuKienLocNhanSu>(
    key: K,
    value: DieuKienLocNhanSu[K]
  ) => {
    onChange({ ...boLocHienTai, [key]: value });
  };

  const datLai = () => {
    onChange({ ...BO_LOC_MAC_DINH });
    onLamMoi?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="size-4 pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => capNhatMotTruong('tuKhoa', e.target.value || null)}
            placeholder="Tìm kiếm họ tên, mã NV, email, SĐT..."
            className="w-full h-11 rounded-xl border border-slate-200/90 bg-white pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => capNhatMotTruong('tuKhoa', null)}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Nút biểu tượng Phễu lọc tinh gọn bên cạnh ô tìm kiếm */}
        <button
          type="button"
          onClick={() => setMoRong((m) => !m)}
          title={moRong ? 'Đóng bộ lọc' : 'Mở bộ lọc'}
          className={cn(
            'relative size-11 rounded-xl border flex items-center justify-center transition active:scale-[0.96] shrink-0',
            moRong || soDieuKien > 0
              ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-xs shadow-blue-500/20'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
          )}
        >
          <Filter className="size-[18px]" />
          {soDieuKien > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 size-5 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white',
                moRong ? 'bg-amber-400 text-slate-900' : 'bg-[#007AFF] text-white'
              )}
            >
              {soDieuKien}
            </span>
          )}
        </button>

        {/* Nút reset nhanh nếu đang có điều kiện lọc */}
        {soDieuKien > 0 && (
          <button
            type="button"
            onClick={datLai}
            title="Xóa tất cả điều kiện lọc"
            className="size-11 rounded-xl border border-rose-200/80 bg-rose-50/60 flex items-center justify-center text-rose-600 hover:bg-rose-100/60 transition active:scale-[0.96] shrink-0"
          >
            <XCircle className="size-5" />
          </button>
        )}
      </div>

      <div
        className={cn(
          'grid gap-3 transition-all duration-200 overflow-hidden',
          moRong ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0 grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <BoLocMuc label={<><UserCheck className="size-3.5 text-slate-500" /> Vai trò nhân sự</>}>
            <select
              value={boLocHienTai.vai_tro ?? 'tat_ca'}
              onChange={(e) => capNhatMotTruong('vai_tro', (e.target.value as any) || 'tat_ca')}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-2xs"
            >
              <option value="tat_ca">Tất cả vai trò</option>
              {danhSachVaiTro.map((v) => (
                <option key={v.id} value={v.id}>{v.ten_vai_tro}</option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><Building2 className="size-3.5 text-slate-500" /> Chi nhánh</>}>
            <select
              value={boLocHienTai.chi_nhanh_id ?? ''}
              onChange={(e) => capNhatMotTruong('chi_nhanh_id', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-2xs"
            >
              <option value="">Tất cả chi nhánh</option>
              {danhSachChiNhanh.map((cn) => (
                <option key={cn.id} value={cn.id}>{cn.ten_chi_nhanh}</option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><Layers className="size-3.5 text-slate-500" /> Phòng ban</>}>
            <select
              value={boLocHienTai.phong_ban_id ?? ''}
              onChange={(e) => capNhatMotTruong('phong_ban_id', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-2xs"
            >
              <option value="">Tất cả phòng ban</option>
              {danhSachPhongBan.map((pb) => (
                <option key={pb.id} value={pb.id}>{pb.ten_phong_ban}</option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><ShieldCheck className="size-3.5 text-slate-500" /> Trạng thái tài khoản</>}>
            <select
              value={boLocHienTai.trang_thai_hoat_dong ?? 'tat_ca'}
              onChange={(e) => capNhatMotTruong('trang_thai_hoat_dong', (e.target.value as any) || 'tat_ca')}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-2xs"
            >
              <option value="tat_ca">Hiển thị tất cả</option>
              <option value="hoat_dong">Chỉ hoạt động</option>
              <option value="khoa">Chỉ đã khóa</option>
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tạo (từ)</>}>
            <input
              type="date"
              value={boLocHienTai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => capNhatMotTruong('ngay_tao_tu_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-2xs"
            />
          </BoLocMuc>

          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tạo (đến)</>}>
            <input
              type="date"
              value={boLocHienTai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => capNhatMotTruong('ngay_tao_den_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-2xs"
            />
          </BoLocMuc>
        </div>
      </div>
    </div>
  );
}

const BoLocMuc = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <label className="block space-y-1.5">
    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">{label}</span>
    {children}
  </label>
);
