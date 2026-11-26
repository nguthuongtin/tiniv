'use client';

import { useState, useEffect } from 'react';
import {
  GitMerge,
  ShieldCheck,
  UserCheck,
  Check,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Users
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { NhanSu, PhongBan } from '../../thu_vien/types/nhan_su';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachPhongBan } from '../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import {
  layCauHinhQuyTrinhPhoiHop,
  capNhatCauHinhQuyTrinhPhoiHop,
  type CauHinhQuyTrinhPhoiHop
} from '../../dich_vu/cau_hinh/dich_vu_cau_hinh_quy_trinh_phoi_hop';

export default function BangCauHinhQuyTrinhPhoiHop() {
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState(false);

  const [tpKhthId, setTpKhthId] = useState<string>('');
  const [tpKdId, setTpkdId] = useState<string>('');
  const [giamDocId, setGiamDocId] = useState<string>('');

  useEffect(() => {
    let unmounted = false;
    const taiDuLieu = async () => {
      setDangTai(true);
      try {
        const [resNS, resPB, cfg] = await Promise.all([
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong', trang_thai_hoat_dong: 'hoat_dong' }),
          danhSachPhongBan({ trang_thai_du_lieu: 'hoat_dong' }),
          layCauHinhQuyTrinhPhoiHop()
        ]);

        if (unmounted) return;
        setDsNhanSu(resNS.mang || []);
        setDsPhongBan(resPB.mang || []);

        setTpKhthId(cfg.tp_khth_id || '');
        setTpkdId(cfg.tp_kd_id || '');
        setGiamDocId(cfg.giam_doc_id || '');
      } catch (err) {
        console.error('Lỗi tải cấu hình quy trình phối hợp:', err);
      } finally {
        if (!unmounted) setDangTai(false);
      }
    };

    void taiDuLieu();
    return () => {
      unmounted = true;
    };
  }, []);

  const handleLuu = async (e: React.FormEvent) => {
    e.preventDefault();
    setDangLuu(true);
    setThongBaoThanhCong(false);
    try {
      const nsTPKHTH = dsNhanSu.find((x) => x.id === tpKhthId);
      const nsTPKD = dsNhanSu.find((x) => x.id === tpKdId);
      const nsGD = dsNhanSu.find((x) => x.id === giamDocId);

      await capNhatCauHinhQuyTrinhPhoiHop({
        tp_khth_id: tpKhthId || null,
        ten_tp_khth: nsTPKHTH?.ho_va_ten || null,
        tp_kd_id: tpKdId || null,
        ten_tp_kd: nsTPKD?.ho_va_ten || null,
        giam_doc_id: giamDocId || null,
        ten_giam_doc: nsGD?.ho_va_ten || null
      });

      setThongBaoThanhCong(true);
      setTimeout(() => setThongBaoThanhCong(false), 4000);
    } catch (err) {
      alert('Không thể lưu cấu hình. Vui lòng thử lại!');
    } finally {
      setDangLuu(false);
    }
  };

  if (dangTai) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
        <span className="text-xs font-semibold">Đang tải cấu hình quy trình phối hợp...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Sơ đồ quy trình trực quan */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <GitMerge className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Quy trình phê duyệt phối hợp phòng ban
            </h3>
            <p className="text-xs text-slate-500">
              Cấu hình nhân sự đảm nhận các trạm phê duyệt trong quy trình xử lý yêu cầu
            </p>
          </div>
        </div>

        {/* Luồng các bước */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="font-extrabold text-blue-700 block text-[11px] uppercase">Bước 1</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">Tạo yêu cầu</span>
              <span className="text-[10.5px] text-slate-500 block">Đến thẳng KHTH</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="font-extrabold text-amber-700 block text-[11px] uppercase">Bước 2</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">KHTH Thực hiện</span>
              <span className="text-[10.5px] text-slate-500 block">NV tự nhận việc &amp; nộp KQ</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-indigo-200 shadow-2xs bg-indigo-50/30">
              <span className="font-extrabold text-indigo-700 block text-[11px] uppercase">Bước 3</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">Duyệt Lần 1</span>
              <span className="text-[10.5px] text-indigo-600 font-semibold block">TP KHTH duyệt</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-purple-200 shadow-2xs bg-purple-50/30">
              <span className="font-extrabold text-purple-700 block text-[11px] uppercase">Bước 4</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">Duyệt Lần 2</span>
              <span className="text-[10.5px] text-purple-600 font-semibold block">TPKD duyệt</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-2xs bg-emerald-50/30">
              <span className="font-extrabold text-emerald-700 block text-[11px] uppercase">Bước 5 (Cuối)</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">Giám Đốc duyệt</span>
              <span className="text-[10.5px] text-emerald-600 font-semibold block">Trả KQ về Người tạo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form cấu hình 3 vị trí nhân sự */}
      <form onSubmit={handleLuu} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2.5">
          Chỉ định nhân sự giữ quyền phê duyệt
        </h4>

        {thongBaoThanhCong && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>Đã lưu thành công cấu hình quy trình phối hợp!</span>
          </div>
        )}

        <div className="space-y-4">
          {/* 1. Trưởng phòng Kế hoạch Tổng hợp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center p-3 rounded-xl bg-slate-50/60 border border-slate-200/60">
            <div>
              <label className="text-xs font-bold text-slate-800 block">
                1. Trưởng phòng Kế hoạch Tổng hợp (TP KHTH)
              </label>
              <span className="text-[11px] text-slate-500 block">
                Thực hiện Duyệt Lần 1 khi chuyên viên KHTH nộp kết quả
              </span>
            </div>
            <div className="md:col-span-2">
              <select
                value={tpKhthId}
                onChange={(e) => setTpKhthId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="">-- Mặc định theo Chức vụ / Vai trò nhân sự --</option>
                {dsNhanSu.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.ho_va_ten} {ns.chuc_vu ? `(${ns.chuc_vu})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Trưởng phòng Kinh doanh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center p-3 rounded-xl bg-slate-50/60 border border-slate-200/60">
            <div>
              <label className="text-xs font-bold text-slate-800 block">
                2. Trưởng phòng Kinh doanh (TPKD)
              </label>
              <span className="text-[11px] text-slate-500 block">
                Thực hiện Duyệt Lần 2 sau khi TP KHTH đã thông qua
              </span>
            </div>
            <div className="md:col-span-2">
              <select
                value={tpKdId}
                onChange={(e) => setTpkdId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="">-- Mặc định theo Chức vụ / Vai trò nhân sự --</option>
                {dsNhanSu.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.ho_va_ten} {ns.chuc_vu ? `(${ns.chuc_vu})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Giám Đốc */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center p-3 rounded-xl bg-slate-50/60 border border-slate-200/60">
            <div>
              <label className="text-xs font-bold text-slate-800 block">
                3. Giám Đốc phê duyệt cuối
              </label>
              <span className="text-[11px] text-slate-500 block">
                Người duyệt bước cuối cùng để hoàn tất và trả kết quả cho Người tạo YC
              </span>
            </div>
            <div className="md:col-span-2">
              <select
                value={giamDocId}
                onChange={(e) => setGiamDocId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="">-- Mặc định theo Chức vụ / Vai trò nhân sự --</option>
                {dsNhanSu.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.ho_va_ten} {ns.chuc_vu ? `(${ns.chuc_vu})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
            <Info className="size-4 text-blue-500 shrink-0" />
            <span>Nếu để trống, hệ thống sẽ tự động đối chiếu theo chức vụ và vai trò của nhân sự.</span>
          </div>

          <button
            type="submit"
            disabled={dangLuu}
            className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {dangLuu ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Lưu cấu hình</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
