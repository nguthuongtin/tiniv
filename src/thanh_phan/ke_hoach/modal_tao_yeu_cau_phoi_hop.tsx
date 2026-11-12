'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Send, Link2, Calendar, FolderKanban, Loader2, Sparkles, Search, Check, CheckCircle2, ChevronDown, User } from 'lucide-react';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import { taoYeuCauPhoiHopMoi, type YeuCauPhoiHop } from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';
import { moZaloChiaSeYeuCau, taoTenYeuCauHienThi } from '../../thu_vien/utils/chia_se_zalo_yeu_cau';
import {
  LOAI_YEU_CAU_MAC_DINH,
  GOI_Y_LOAI_YEU_CAU,
  NHAN_TRANG_THAI_YEU_CAU,
  xacDinhTrangThaiBanDauYeuCau
} from '../../thu_vien/types/yeu_cau_phoi_hop';
import { formatNgay } from '../../thu_vien/utils/format_ngay';

interface Props {
  mo: boolean;
  onDong: () => void;
  duAnMacDinh?: HoSoDuAn | null;
  danhSachDuAn: HoSoDuAn[];
  noiDungGoiY?: string;
  nguoiDungHienTai?: { id: string; ho_va_ten?: string | null; [key: string]: any } | null;
  onTaoThanhCong?: (yeuCau: YeuCauPhoiHop) => void;
}

export default function ModalTaoYeuCauPhoiHop({
  mo,
  onDong,
  duAnMacDinh,
  danhSachDuAn,
  noiDungGoiY = '',
  nguoiDungHienTai,
  onTaoThanhCong
}: Props) {
  const { nguoiDungHienTai: userFromStore } = useStoreXacThuc();
  const userHieuLuc = nguoiDungHienTai || userFromStore;

  const [duAnId, setDuAnId] = useState(duAnMacDinh?.id || '');
  const [tuKhoaDuAn, setTuKhoaDuAn] = useState('');
  const [moDropdownDuAn, setMoDropdownDuAn] = useState(false);
  const [loaiYeuCau, setLoaiYeuCau] = useState<string>(LOAI_YEU_CAU_MAC_DINH);
  const [noiDung, setNoiDung] = useState(noiDungGoiY);
  const [linkDrive, setLinkDrive] = useState('');
  const [hanXong, setHanXong] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [nguoiNhanId, setNguoiNhanId] = useState<string>('');
  const [tuKhoaNguoiNhan, setTuKhoaNguoiNhan] = useState('');
  const [moDropdownNguoiNhan, setMoDropdownNguoiNhan] = useState(false);
  const [yeuCauVuaTao, setYeuCauVuaTao] = useState<YeuCauPhoiHop | null>(null);
  const [daGuiZalo, setDaGuiZalo] = useState(false);

  // Đồng bộ lại dữ liệu mỗi khi mở modal
  useEffect(() => {
    if (mo) {
      setDuAnId(duAnMacDinh?.id || '');
      setTuKhoaDuAn('');
      setMoDropdownDuAn(false);
      setLoaiYeuCau(LOAI_YEU_CAU_MAC_DINH);
      setNoiDung(noiDungGoiY || '');
      setNoiDung(noiDungGoiY || '');
      setLinkDrive('');
      setLoi('');
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setHanXong(d.toISOString().slice(0, 10));
      setTuKhoaNguoiNhan('');
      setMoDropdownNguoiNhan(false);
      setYeuCauVuaTao(null);
      setDaGuiZalo(false);

      void danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong', trang_thai_hoat_dong: 'hoat_dong' }).then((res) => {
        const mang = res.mang || [];
        setDsNhanSu(mang);
        const creatorRole = userHieuLuc?.vai_tro || '';
        const laTPKDOrAdmin =
          creatorRole === 'truong_phong_kd' ||
          creatorRole === 'giam_doc' ||
          creatorRole === 'quan_tri_he_thong';

        const defaultTPKH = mang.find(
          (ns) =>
            ns.vai_tro === 'truong_phong_khth' ||
            (ns.chuc_vu || '').toLowerCase().includes('tp khth') ||
            (ns.chuc_vu || '').toLowerCase().includes('trưởng phòng kế hoạch') ||
            ((ns.chuc_vu || '').toLowerCase().includes('trưởng phòng') &&
              (ns.chuc_vu || '').toLowerCase().includes('kế hoạch'))
        );

        const defaultTPKD = mang.find(
          (ns) =>
            ns.vai_tro === 'truong_phong_kd' ||
            (ns.chuc_vu || '').toLowerCase().includes('tp kd') ||
            (ns.chuc_vu || '').toLowerCase().includes('trưởng phòng kinh doanh') ||
            ns.vai_tro === 'truong_phong'
        );

        const nguoiMacDinh = laTPKDOrAdmin ? defaultTPKH || defaultTPKD : defaultTPKD;
        if (nguoiMacDinh) {
          setNguoiNhanId(nguoiMacDinh.id);
        } else if (mang.length > 0) {
          setNguoiNhanId(mang[0].id);
        }
      }).catch(() => {});
    }
  }, [mo, duAnMacDinh, noiDungGoiY]);

  // Dự án đang chọn
  const duAnChon = useMemo(() => {
    return danhSachDuAn.find((d) => d.id === (duAnId || duAnMacDinh?.id)) || duAnMacDinh || null;
  }, [danhSachDuAn, duAnId, duAnMacDinh]);

  // Lọc danh sách dự án tìm kiếm
  const dsDuAnLoc = useMemo(() => {
    const list = danhSachDuAn.filter((d) => d.trang_thai !== 'da_xoa');
    if (!tuKhoaDuAn.trim()) return list.slice(0, 50);
    const kw = tuKhoaDuAn.toLowerCase().trim();
    return list
      .filter((d) =>
        d.ten_du_an.toLowerCase().includes(kw) ||
        (d.ma_ho_so && d.ma_ho_so.toLowerCase().includes(kw))
      )
      .slice(0, 50);
  }, [danhSachDuAn, tuKhoaDuAn]);

  // Người nhận đích danh đang chọn
  const nguoiNhanChon = useMemo(() => {
    return dsNhanSu.find((ns) => ns.id === nguoiNhanId) || null;
  }, [dsNhanSu, nguoiNhanId]);

  // Lọc danh sách nhân sự tìm kiếm
  const dsNhanSuLoc = useMemo(() => {
    if (!tuKhoaNguoiNhan.trim()) return dsNhanSu.slice(0, 50);
    const kw = tuKhoaNguoiNhan.toLowerCase().trim();
    return dsNhanSu.filter((ns) =>
      ns.ho_va_ten.toLowerCase().includes(kw) ||
      (ns.chuc_vu && ns.chuc_vu.toLowerCase().includes(kw))
    ).slice(0, 50);
  }, [dsNhanSu, tuKhoaNguoiNhan]);

  if (!mo) return null;

  const handleGui = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duAnChon) {
      setLoi('Vui lòng chọn Dự án cần phối hợp.');
      return;
    }
    if (!noiDung.trim()) {
      setLoi('Vui lòng nhập nội dung yêu cầu.');
      return;
    }

    try {
      setDangGui(true);
      setLoi('');
      const yc = await taoYeuCauPhoiHopMoi(
        {
          du_an_id: duAnChon.id,
          ten_du_an: duAnChon.ten_du_an,
          khach_hang_id: duAnChon.khach_hang_id || null,
          ten_khach_hang: null,
          loai_yeu_cau: loaiYeuCau.trim() || LOAI_YEU_CAU_MAC_DINH,
          noi_dung_yeu_cau: noiDung.trim(),
          link_drive_dau_vao: linkDrive.trim() || null,
          han_hoan_thanh: hanXong || null,
          nguoi_nhan_id: nguoiNhanChon?.id || null,
          ten_nguoi_nhan: nguoiNhanChon?.ho_va_ten || null,
          chuc_vu_nguoi_nhan: nguoiNhanChon?.chuc_vu || null,
          vai_tro_nguoi_nhan: nguoiNhanChon?.vai_tro || null
        },
        userHieuLuc
      );

      if (onTaoThanhCong) {
        onTaoThanhCong(yc);
      }
      setYeuCauVuaTao(yc);
      setDaGuiZalo(false);
    } catch (err: any) {
      setLoi(err?.message || 'Không thể tạo yêu cầu. Vui lòng thử lại.');
    } finally {
      setDangGui(false);
    }
  };

  const setNgayNhanh = (soNgay: number) => {
    const d = new Date();
    d.setDate(d.getDate() + soNgay);
    setHanXong(d.toISOString().slice(0, 10));
  };

  const handleGuiZaloNgay = async () => {
    if (!yeuCauVuaTao) return;
    await moZaloChiaSeYeuCau(yeuCauVuaTao);
    setDaGuiZalo(true);
    setTimeout(() => setDaGuiZalo(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      {/* Background card với màu nền trắng/dark tuyệt đối */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn('size-9 rounded-xl flex items-center justify-center shrink-0', yeuCauVuaTao ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary')}>
              {yeuCauVuaTao ? <CheckCircle2 className="size-4" /> : <Sparkles className="size-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {yeuCauVuaTao ? 'Đã gửi yêu cầu hỗ trợ' : 'Tạo yêu cầu phối hợp'}
              </h3>
              <p className="text-xs text-slate-500">
                {yeuCauVuaTao ? taoTenYeuCauHienThi(yeuCauVuaTao) : 'Gửi nội dung cần hỗ trợ sang bộ phận liên quan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {loi && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {loi}
          </div>
        )}

        {yeuCauVuaTao ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nội dung yêu cầu
              </div>
              <div className="text-slate-900 font-medium whitespace-pre-line break-words leading-relaxed">
                {yeuCauVuaTao.noi_dung_yeu_cau}
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    Tiếp nhận: <strong className="text-slate-800">{yeuCauVuaTao.ten_nguoi_nhan || 'Chờ phân công'}</strong>
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                      NHAN_TRANG_THAI_YEU_CAU[yeuCauVuaTao.trang_thai]?.mauBadge
                    )}
                  >
                    {NHAN_TRANG_THAI_YEU_CAU[yeuCauVuaTao.trang_thai]?.label}
                  </span>
                </div>
                {yeuCauVuaTao.han_hoan_thanh && (
                  <span>
                    Hạn: <strong className="text-slate-800">{formatNgay(yeuCauVuaTao.han_hoan_thanh)}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onDong}
                className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleGuiZaloNgay}
                className={cn(
                  'h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs transition',
                  daGuiZalo
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0068FF] hover:bg-[#0052cc] text-white'
                )}
              >
                {daGuiZalo ? (
                  <>
                    <Check className="size-3.5 stroke-[2.5]" />
                    <span>Đã chép & Mở Zalo</span>
                  </>
                ) : (
                  <>
                    <span className="font-black text-[10px] bg-white text-[#0068FF] size-4 rounded flex items-center justify-center leading-none">
                      Z
                    </span>
                    <span>Gửi nội dung lên nhóm Zalo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleGui} className="space-y-4">
          {/* Dự án áp dụng - Searchable Combobox */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FolderKanban className="size-3.5 text-primary" />
              <span>Dự án áp dụng *</span>
            </label>

            {duAnChon && !moDropdownDuAn ? (
              <div className="h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs font-semibold">
                <div className="flex items-center gap-2 truncate">
                  <FolderKanban className="size-4 text-primary shrink-0" />
                  <span className="truncate text-slate-900 font-bold">{duAnChon.ten_du_an}</span>
                </div>
                {!duAnMacDinh && (
                  <button
                    type="button"
                    onClick={() => {
                      setMoDropdownDuAn(true);
                      setTimeout(() => inputSearchRef.current?.focus(), 50);
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold shrink-0 cursor-pointer"
                  >
                    Đổi dự án
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="size-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    ref={inputSearchRef}
                    type="text"
                    value={tuKhoaDuAn}
                    onChange={(e) => {
                      setTuKhoaDuAn(e.target.value);
                      setMoDropdownDuAn(true);
                    }}
                    onFocus={() => setMoDropdownDuAn(true)}
                    placeholder="Gõ tên hoặc mã dự án để tìm kiếm..."
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-8.5 pr-8 text-xs text-slate-900 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
                    autoFocus
                  />
                  <ChevronDown className="size-3.5 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>

                {moDropdownDuAn && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setMoDropdownDuAn(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl divide-y divide-slate-100">
                      {dsDuAnLoc.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500 italic">
                          Không tìm thấy dự án phù hợp
                        </div>
                      ) : (
                        dsDuAnLoc.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => {
                              setDuAnId(d.id);
                              setMoDropdownDuAn(false);
                              setLoi('');
                            }}
                            className="p-2.5 hover:bg-slate-50 cursor-pointer transition text-xs flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 truncate">
                                {d.ten_du_an}
                              </div>
                              {d.ma_ho_so && (
                                <div className="text-[10.5px] text-slate-500 font-mono">
                                  {d.ma_ho_so}
                                </div>
                              )}
                            </div>
                            {duAnId === d.id && (
                              <Check className="size-3.5 text-primary shrink-0" />
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

          {/* Loại yêu cầu (nhập text tự do, mặc định: Báo giá) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-slate-800 block">
                Loại yêu cầu *
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {GOI_Y_LOAI_YEU_CAU.map((goiY) => {
                  const dangChon = loaiYeuCau.trim().toLowerCase() === goiY.toLowerCase();
                  return (
                    <button
                      key={goiY}
                      type="button"
                      onClick={() => setLoaiYeuCau(goiY)}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10.5px] font-medium border cursor-pointer transition',
                        dangChon
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      )}
                    >
                      {goiY}
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              type="text"
              value={loaiYeuCau}
              onChange={(e) => setLoaiYeuCau(e.target.value)}
              placeholder="VD: Báo giá, Lập phương án, Khảo sát..."
              className="w-full h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Gửi đích danh cho nhân sự */}
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                <span>Gửi đích danh cho *</span>
              </label>
              {(() => {
                const ttDuKien = xacDinhTrangThaiBanDauYeuCau({
                  vai_tro_nguoi_nhan: nguoiNhanChon?.vai_tro,
                  chuc_vu_nguoi_nhan: nguoiNhanChon?.chuc_vu
                });
                const cfgDuKien = NHAN_TRANG_THAI_YEU_CAU[ttDuKien];
                return (
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10.5px] font-semibold border',
                      cfgDuKien.mauBadge
                    )}
                  >
                    {cfgDuKien.label}
                  </span>
                );
              })()}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoDropdownNguoiNhan(!moDropdownNguoiNhan)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-2 text-xs font-medium text-left transition cursor-pointer"
              >
                {nguoiNhanChon ? (
                  <div className="flex items-center gap-2 truncate">
                    <div className="size-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                      {nguoiNhanChon.ho_va_ten.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate font-semibold text-slate-900">{nguoiNhanChon.ho_va_ten}</span>
                    {nguoiNhanChon.chuc_vu && (
                      <span className="text-[11px] text-slate-400 truncate">({nguoiNhanChon.chuc_vu})</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400">Chọn người tiếp nhận...</span>
                )}
                <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
              </button>

              {moDropdownNguoiNhan && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setMoDropdownNguoiNhan(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="size-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={tuKhoaNguoiNhan}
                          onChange={(e) => setTuKhoaNguoiNhan(e.target.value)}
                          placeholder="Tìm theo tên hoặc chức vụ..."
                          className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-primary"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-44 divide-y divide-slate-100">
                      {dsNhanSuLoc.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500 italic">
                          Không tìm thấy nhân sự
                        </div>
                      ) : (
                        dsNhanSuLoc.map((ns) => (
                          <div
                            key={ns.id}
                            onClick={() => {
                              setNguoiNhanId(ns.id);
                              setMoDropdownNguoiNhan(false);
                            }}
                            className="p-2.5 hover:bg-slate-50 cursor-pointer transition text-xs flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                              <div className="size-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {ns.ho_va_ten.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <span className="font-semibold text-slate-900 block truncate">{ns.ho_va_ten}</span>
                                {ns.chuc_vu && (
                                  <span className="text-[10.5px] text-slate-500 block truncate">{ns.chuc_vu}</span>
                                )}
                              </div>
                            </div>
                            {nguoiNhanId === ns.id && (
                              <Check className="size-3.5 text-primary shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nội dung yêu cầu */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Nội dung yêu cầu *
            </label>
            <textarea
              rows={3}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Nhập nội dung cần hỗ trợ hoặc phối hợp..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-slate-400"
              required
            />
          </div>

          {/* Link Google Drive đầu vào */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Link2 className="size-3.5 text-slate-400" />
                <span>Link Google Drive tài liệu (nếu có)</span>
              </label>
              <span className="text-[11px] text-slate-400">Tùy chọn</span>
            </div>
            <input
              type="url"
              value={linkDrive}
              onChange={(e) => setLinkDrive(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
            />
          </div>

          {/* Hạn hoàn thành */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400" />
                <span>Thời hạn hoàn thành</span>
              </label>
              <div className="flex items-center gap-1">
                {[
                  { nhan: 'Mai', so: 1 },
                  { nhan: '+2 ngày', so: 2 },
                  { nhan: '+1 tuần', so: 7 }
                ].map((chip) => (
                  <button
                    key={chip.nhan}
                    type="button"
                    onClick={() => setNgayNhanh(chip.so)}
                    className="px-2 py-0.5 rounded-md text-[10.5px] font-medium border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition"
                  >
                    {chip.nhan}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="date"
              value={hanXong}
              onChange={(e) => setHanXong(e.target.value)}
              className="w-full h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onDong}
              disabled={dangGui}
              className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangGui}
              className="h-9 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs hover:opacity-90 transition disabled:opacity-50"
            >
              {dangGui ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Gửi yêu cầu</span>
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
