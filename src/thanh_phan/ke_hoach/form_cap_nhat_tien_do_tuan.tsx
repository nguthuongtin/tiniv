'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Edit2,
  Link2,
  ExternalLink,
  MessageSquareQuote,
  X,
  Check,
  CornerDownRight,
  Shield,
  FileText
} from 'lucide-react';
import type { ItemKeHoachTuan, NhatKyKetQuaTuan, ChiDaoTienDo } from '../../thu_vien/types/ke_hoach';
import { DANH_SACH_GIAI_DOAN_MAC_DINH } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import { coQuyen } from '../../thu_vien/phan_quyen/kiem_tra_quyen';
import { Nut, Ban_Ve, The_Chuc_Nang } from '../ui';

interface Props {
  mo: boolean;
  onDong: () => void;
  item: ItemKeHoachTuan | null;
  onLuu: (
    itemId: string,
    capNhat: {
      danh_sach_ket_qua: NhatKyKetQuaTuan[];
      ket_qua_thuc_te: string;
      da_hoan_thanh: boolean;
      trang_thai_cong_viec?: 'da_hoan_thanh' | 'dang_thuc_hien' | 'doi_hen';
      giai_doan_du_an_moi?: string | null;
      ngay_du_kien_moi?: string | null;
    }
  ) => void;
}

export default function FormCapNhatTienDoTuan({
  mo,
  onDong,
  item,
  onLuu
}: Props) {
  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const laQuanLyHoacGiamDoc =
    ['quan_tri_he_thong', 'giam_doc', 'truong_phong'].includes(nguoiDungHienTai?.vai_tro ?? '') ||
    coQuyen(nguoiDungHienTai, 'ke_hoach.duyet');

  const [danhSachKetQua, setDanhSachKetQua] = useState<NhatKyKetQuaTuan[]>([]);
  const [daHoanThanh, setDaHoanThanh] = useState<boolean>(false);
  const [trangThaiCongViec, setTrangThaiCongViec] = useState<'da_hoan_thanh' | 'dang_thuc_hien' | 'doi_hen'>('dang_thuc_hien');
  const [giaiDoanDuAnMoi, setGiaiDoanDuAnMoi] = useState<string>('');
  const [ngayDuKienMoi, setNgayDuKienMoi] = useState<string>('');

  // State thêm kết quả mới
  const [noiDungMoi, setNoiDungMoi] = useState<string>('');
  const [ngayGhiNhanMoi, setNgayGhiNhanMoi] = useState<string>('');
  const [linkDinhKemMoi, setLinkDinhKemMoi] = useState<string>('');
  const [tenTaiLieuMoi, setTenTaiLieuMoi] = useState<string>('');
  const [hienNhapLinkMoi, setHienNhapLinkMoi] = useState<boolean>(false);

  // State chỉnh sửa tiến độ (Edit Mode)
  const [dangSuaId, setDangSuaId] = useState<string | null>(null);
  const [ngayGhiNhanSua, setNgayGhiNhanSua] = useState<string>('');
  const [noiDungSua, setNoiDungSua] = useState<string>('');
  const [linkDinhKemSua, setLinkDinhKemSua] = useState<string>('');
  const [tenTaiLieuSua, setTenTaiLieuSua] = useState<string>('');

  // State chỉ đạo / phản hồi của cấp trên
  const [dangChiDaoId, setDangChiDaoId] = useState<string | null>(null);
  const [noiDungChiDao, setNoiDungChiDao] = useState<string>('');

  useEffect(() => {
    if (item) {
      const homNay = new Date().toISOString().split('T')[0];
      setNgayGhiNhanMoi(homNay);
      setNoiDungMoi('');
      setLinkDinhKemMoi('');
      setTenTaiLieuMoi('');
      setHienNhapLinkMoi(false);
      setDangSuaId(null);
      setDangChiDaoId(null);
      setDaHoanThanh(Boolean(item.da_hoan_thanh));
      setTrangThaiCongViec(item.da_hoan_thanh ? 'da_hoan_thanh' : 'dang_thuc_hien');
      setGiaiDoanDuAnMoi('');
      setNgayDuKienMoi(item.ngay_du_kien || '');

      // Migrate từ kết quả đơn lẻ sang danh sách nếu có
      if (item.danh_sach_ket_qua && item.danh_sach_ket_qua.length > 0) {
        setDanhSachKetQua(item.danh_sach_ket_qua);
      } else if (item.ket_qua_thuc_te) {
        setDanhSachKetQua([
          {
            id: 'legacy_1',
            ngay_ghi_nhan: item.ngay_hoan_thanh || homNay,
            noi_dung: item.ket_qua_thuc_te
          }
        ]);
      } else {
        setDanhSachKetQua([]);
      }
    }
  }, [item, mo]);

  if (!item) return null;

  // Thêm kết quả mới
  const xuLyThemKetQua = () => {
    if (!noiDungMoi.trim()) {
      alert('Vui lòng nhập nội dung kết quả');
      return;
    }

    const itemMoi: NhatKyKetQuaTuan = {
      id: `kq_${Date.now()}`,
      ngay_ghi_nhan: ngayGhiNhanMoi || new Date().toISOString().split('T')[0],
      noi_dung: noiDungMoi.trim(),
      nguoi_ghi_id: nguoiDungHienTai?.id || null,
      ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null,
      link_dinh_kem: linkDinhKemMoi.trim() || null,
      ten_tai_lieu: tenTaiLieuMoi.trim() || null
    };

    setDanhSachKetQua([itemMoi, ...danhSachKetQua]);
    setNoiDungMoi('');
    setLinkDinhKemMoi('');
    setTenTaiLieuMoi('');
    setHienNhapLinkMoi(false);
  };

  // Bắt đầu sửa kết quả
  const xuLyBatDauSua = (kq: NhatKyKetQuaTuan) => {
    setDangSuaId(kq.id);
    setNgayGhiNhanSua(kq.ngay_ghi_nhan || new Date().toISOString().split('T')[0]);
    setNoiDungSua(kq.noi_dung || '');
    setLinkDinhKemSua(kq.link_dinh_kem || '');
    setTenTaiLieuSua(kq.ten_tai_lieu || '');
  };

  // Lưu chỉnh sửa kết quả
  const xuLyLuuSua = (id: string) => {
    if (!noiDungSua.trim()) {
      alert('Nội dung kết quả không được để trống.');
      return;
    }

    setDanhSachKetQua((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        return {
          ...k,
          ngay_ghi_nhan: ngayGhiNhanSua,
          noi_dung: noiDungSua.trim(),
          link_dinh_kem: linkDinhKemSua.trim() || null,
          ten_tai_lieu: tenTaiLieuSua.trim() || null,
          ngay_chinh_sua_gan_nhat: new Date().toISOString()
        };
      })
    );
    setDangSuaId(null);
  };

  const xuLyHuySua = () => {
    setDangSuaId(null);
  };

  // Xóa kết quả
  const xuLyXoaKetQua = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mốc kết quả này?')) {
      setDanhSachKetQua(danhSachKetQua.filter((x) => x.id !== id));
      if (dangSuaId === id) setDangSuaId(null);
      if (dangChiDaoId === id) setDangChiDaoId(null);
    }
  };

  // Bắt đầu viết ý kiến chỉ đạo
  const xuLyBatDauChiDao = (kq: NhatKyKetQuaTuan) => {
    setDangChiDaoId(kq.id);
    setNoiDungChiDao(kq.chi_dao?.noi_dung || '');
  };

  // Lưu ý kiến chỉ đạo của cấp trên
  const xuLyLuuChiDao = (id: string) => {
    if (!noiDungChiDao.trim()) {
      // Nếu xóa trống thì xóa chỉ đạo
      setDanhSachKetQua((prev) =>
        prev.map((k) => (k.id === id ? { ...k, chi_dao: null } : k))
      );
      setDangChiDaoId(null);
      return;
    }

    const chiDaoMoi: ChiDaoTienDo = {
      id: `cd_${Date.now()}`,
      noi_dung: noiDungChiDao.trim(),
      nguoi_chi_dao_id: nguoiDungHienTai?.id || null,
      ten_nguoi_chi_dao: nguoiDungHienTai?.ho_va_ten || 'Cấp trên',
      chuc_vu_nguoi_chi_dao:
        nguoiDungHienTai?.vai_tro === 'giam_doc'
          ? 'Giám đốc'
          : nguoiDungHienTai?.vai_tro === 'truong_phong'
          ? 'Trưởng phòng'
          : 'Quản lý',
      ngay_chi_dao: new Date().toISOString().split('T')[0]
    };

    setDanhSachKetQua((prev) =>
      prev.map((k) => (k.id === id ? { ...k, chi_dao: chiDaoMoi } : k))
    );
    setDangChiDaoId(null);
  };

  const xuLyXoaChiDao = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa ý kiến chỉ đạo này?')) {
      setDanhSachKetQua((prev) =>
        prev.map((k) => (k.id === id ? { ...k, chi_dao: null } : k))
      );
    }
  };

  // Lưu toàn bộ form
  const xuLyLuu = () => {
    let dsCuoi = [...danhSachKetQua];

    // Nếu đang sửa dở thì cập nhật trước
    if (dangSuaId && noiDungSua.trim()) {
      dsCuoi = dsCuoi.map((k) => {
        if (k.id !== dangSuaId) return k;
        return {
          ...k,
          ngay_ghi_nhan: ngayGhiNhanSua,
          noi_dung: noiDungSua.trim(),
          link_dinh_kem: linkDinhKemSua.trim() || null,
          ten_tai_lieu: tenTaiLieuSua.trim() || null,
          ngay_chinh_sua_gan_nhat: new Date().toISOString()
        };
      });
    }

    // Nếu có đang gõ dở nội dung ở ô input mà chưa bấm "Thêm", tự động thêm luôn
    if (noiDungMoi.trim()) {
      const itemMoi: NhatKyKetQuaTuan = {
        id: `kq_${Date.now()}`,
        ngay_ghi_nhan: ngayGhiNhanMoi || new Date().toISOString().split('T')[0],
        noi_dung: noiDungMoi.trim(),
        nguoi_ghi_id: nguoiDungHienTai?.id || null,
        ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null,
        link_dinh_kem: linkDinhKemMoi.trim() || null,
        ten_tai_lieu: tenTaiLieuMoi.trim() || null
      };
      dsCuoi = [itemMoi, ...dsCuoi];
    }

    // Kết quả mới nhất làm tóm tắt hiển thị
    const ketQuaGanNhat = dsCuoi.length > 0 ? dsCuoi[0].noi_dung : '';

    const isFinished = trangThaiCongViec === 'da_hoan_thanh' || daHoanThanh;

    onLuu(item.id, {
      danh_sach_ket_qua: dsCuoi,
      ket_qua_thuc_te: ketQuaGanNhat,
      da_hoan_thanh: isFinished,
      trang_thai_cong_viec: trangThaiCongViec,
      giai_doan_du_an_moi: giaiDoanDuAnMoi.trim() || null,
      ngay_du_kien_moi: trangThaiCongViec === 'doi_hen' ? (ngayDuKienMoi || null) : undefined
    });
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de="Cập nhật tiến độ công việc"
      phu_de={item.hanh_dong_tuan || item.noi_dung_tuan || item.ten_khach_hang_du_an}
    >
      <div className="space-y-4 p-1">
        {/* Ô nhập tiến độ mới ngay trên đầu */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground text-sm">Ghi nhận tiến độ</span>
              <input
                type="date"
                value={ngayGhiNhanMoi}
                onChange={(e) => setNgayGhiNhanMoi(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground"
              />
            </div>

            <textarea
              rows={3}
              value={noiDungMoi}
              onChange={(e) => setNoiDungMoi(e.target.value)}
              placeholder="Nhập kết quả / tiến độ thực hiện trong ngày..."
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
            />

            {/* Tài liệu & Link đính kèm */}
            {hienNhapLinkMoi ? (
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-foreground flex items-center gap-1">
                    <Link2 className="size-3 text-primary" />
                    Link tài liệu
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHienNhapLinkMoi(false);
                      setLinkDinhKemMoi('');
                      setTenTaiLieuMoi('');
                    }}
                    className="text-[10px] text-muted-foreground hover:text-danger"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={linkDinhKemMoi}
                    onChange={(e) => setLinkDinhKemMoi(e.target.value)}
                    placeholder="https://..."
                    className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-mono text-foreground"
                  />
                  <input
                    type="text"
                    value={tenTaiLieuMoi}
                    onChange={(e) => setTenTaiLieuMoi(e.target.value)}
                    placeholder="Tên tài liệu..."
                    className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setHienNhapLinkMoi(true)}
                  className="text-[11px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <Link2 className="size-3" /> + Đính kèm link tài liệu
                </button>
                {noiDungMoi.trim() && (
                  <button
                    type="button"
                    onClick={xuLyThemKetQua}
                    className="h-7 px-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" /> Thêm vào nhật ký
                  </button>
                )}
              </div>
            )}

            {/* Trạng thái & Giai đoạn dự án */}
            <div className="pt-2 border-t border-border/50 space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrangThaiCongViec('dang_thuc_hien');
                    setDaHoanThanh(false);
                  }}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    trangThaiCongViec === 'dang_thuc_hien' && !daHoanThanh
                      ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Edit2 className="size-3.5 text-amber-600" />
                  Đang làm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrangThaiCongViec('da_hoan_thanh');
                    setDaHoanThanh(true);
                  }}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    trangThaiCongViec === 'da_hoan_thanh' || daHoanThanh
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Hoàn thành
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrangThaiCongViec('doi_hen');
                    setDaHoanThanh(false);
                  }}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    trangThaiCongViec === 'doi_hen' && !daHoanThanh
                      ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-400'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Calendar className="size-3.5 text-blue-600" />
                  Dời ngày
                </button>
              </div>

              {trangThaiCongViec === 'doi_hen' && !daHoanThanh && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700">Chuyển sang ngày:</span>
                  <input
                    type="date"
                    value={ngayDuKienMoi}
                    onChange={(e) => setNgayDuKienMoi(e.target.value)}
                    className="h-8 rounded-lg border border-blue-300 bg-blue-50/40 px-2.5 text-xs font-bold text-foreground"
                  />
                </div>
              )}

              {item.du_an_id && (
                <div>
                  <select
                    value={giaiDoanDuAnMoi}
                    onChange={(e) => setGiaiDoanDuAnMoi(e.target.value)}
                    className="w-full h-8.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chuyển giai đoạn dự án (nếu có) --</option>
                    {DANH_SACH_GIAI_DOAN_MAC_DINH.map((gd) => (
                      <option key={gd.key} value={gd.key}>
                        {gd.nhan_day_du}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </The_Chuc_Nang>

        {/* Danh sách các kết quả đã ghi nhận */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="font-bold text-foreground text-sm">
              Nhật ký tiến độ ({danhSachKetQua.length})
            </div>

            {danhSachKetQua.length === 0 ? (
              <div className="py-5 text-center text-muted-foreground">
                Chưa có mốc tiến độ nào.
              </div>
            ) : (
              <div className="space-y-3">
                {danhSachKetQua.map((kq, idx) => {
                  const laDangSua = dangSuaId === kq.id;
                  const laDangChiDao = dangChiDaoId === kq.id;

                  return (
                    <div
                      key={kq.id || idx}
                      className="p-3.5 rounded-xl border border-border/80 bg-background space-y-2.5 shadow-2xs transition-all hover:border-border"
                    >
                      {/* Chế độ Sửa inline */}
                      {laDangSua ? (
                        <div className="space-y-2.5 bg-primary/5 p-3 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary text-xs flex items-center gap-1">
                              <Edit2 className="size-3.5" /> Chỉnh sửa mốc tiến độ
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => xuLyLuuSua(kq.id)}
                                className="h-6.5 px-2.5 rounded bg-primary text-primary-foreground text-[11px] font-bold hover:bg-primary/90 inline-flex items-center gap-1"
                              >
                                <Check className="size-3" /> Lưu
                              </button>
                              <button
                                type="button"
                                onClick={xuLyHuySua}
                                className="h-6.5 px-2 rounded bg-muted hover:bg-muted/80 text-[11px] font-semibold inline-flex items-center gap-1"
                              >
                                <X className="size-3" /> Hủy
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={ngayGhiNhanSua}
                              onChange={(e) => setNgayGhiNhanSua(e.target.value)}
                              className="h-8 rounded-md border border-border bg-background px-2 text-xs font-semibold"
                            />
                            <span className="text-[11px] text-muted-foreground">Ngày ghi nhận</span>
                          </div>

                          <textarea
                            rows={2}
                            value={noiDungSua}
                            onChange={(e) => setNoiDungSua(e.target.value)}
                            placeholder="Nội dung kết quả..."
                            className="w-full rounded-md border border-border bg-background p-2 text-xs font-medium"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                Link tài liệu / URL
                              </label>
                              <input
                                type="text"
                                value={linkDinhKemSua}
                                onChange={(e) => setLinkDinhKemSua(e.target.value)}
                                placeholder="https://..."
                                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                Tên tài liệu hiển thị
                              </label>
                              <input
                                type="text"
                                value={tenTaiLieuSua}
                                onChange={(e) => setTenTaiLieuSua(e.target.value)}
                                placeholder="VD: Báo giá đã duyệt, Hợp đồng scan..."
                                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Chế độ Xem bình thường */
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-muted-foreground">
                                {kq.ngay_ghi_nhan ? new Date(kq.ngay_ghi_nhan).toLocaleDateString('vi-VN') : '—'}
                              </span>
                              {kq.ten_khach_hang && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold text-[10px]">
                                  KH: {kq.ten_khach_hang}
                                </span>
                              )}
                              {kq.ten_du_an && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 font-bold text-[10px]">
                                  DA: {kq.ten_du_an}
                                </span>
                              )}
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold text-[10px]">
                                  Mới nhất
                                </span>
                              )}
                              {kq.ngay_chinh_sua_gan_nhat && (
                                <span className="text-[10px] text-muted-foreground italic">
                                  (Đã chỉnh sửa)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Nút Sửa */}
                              <button
                                type="button"
                                onClick={() => xuLyBatDauSua(kq)}
                                className="h-6 px-2 rounded bg-muted/60 hover:bg-muted text-foreground text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                                title="Chỉnh sửa nội dung / link"
                              >
                                <Edit2 className="size-3 text-muted-foreground" /> Sửa
                              </button>

                              {/* Nút Xóa */}
                              <button
                                type="button"
                                onClick={() => xuLyXoaKetQua(kq.id)}
                                className="size-6 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger flex items-center justify-center transition-colors"
                                title="Xoá kết quả này"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Nội dung kết quả */}
                          <div className="text-foreground font-medium leading-relaxed text-xs">
                            {kq.noi_dung}
                          </div>

                          {/* Link đính kèm (nếu có) */}
                          {kq.link_dinh_kem && (
                            <div className="pt-1">
                              <a
                                href={kq.link_dinh_kem}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors shadow-2xs"
                              >
                                <FileText className="size-3.5" />
                                <span>{kq.ten_tai_lieu || 'Xem tài liệu đính kèm'}</span>
                                <ExternalLink className="size-2.5 opacity-70" />
                              </a>
                            </div>
                          )}

                          {/* Hiển thị Ý kiến đồng hành từ lãnh đạo (nếu có) */}
                          {kq.chi_dao && (
                            <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-amber-800 flex items-center gap-1.5 text-[11px]">
                                  <MessageSquareQuote className="size-3.5 text-amber-600" />
                                  <span>
                                    Đồng hành & Định hướng từ {kq.chi_dao.ten_nguoi_chi_dao || 'Lãnh đạo'}
                                    {kq.chi_dao.chuc_vu_nguoi_chi_dao ? ` (${kq.chi_dao.chuc_vu_nguoi_chi_dao})` : ''}:
                                  </span>
                                </div>
                                {laQuanLyHoacGiamDoc && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => xuLyBatDauChiDao(kq)}
                                      className="text-[10px] font-semibold text-amber-800 hover:underline"
                                    >
                                      Sửa
                                    </button>
                                    <span className="text-muted-foreground">•</span>
                                    <button
                                      type="button"
                                      onClick={() => xuLyXoaChiDao(kq.id)}
                                      className="text-[10px] font-semibold text-danger hover:underline"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="text-foreground font-medium pl-5 text-[11px] leading-relaxed">
                                {kq.chi_dao.noi_dung}
                              </div>
                              {kq.chi_dao.ngay_chi_dao && (
                                <div className="text-[9px] text-muted-foreground pl-5 font-mono">
                                  Ngày phản hồi: {new Date(kq.chi_dao.ngay_chi_dao).toLocaleDateString('vi-VN')}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Khung nhập / sửa ý kiến đồng hành */}
                          {laDangChiDao ? (
                            <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-800 text-[11px] flex items-center gap-1">
                                  <Shield className="size-3 text-amber-600" /> Ý kiến đồng hành & Định hướng
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => xuLyLuuChiDao(kq.id)}
                                    className="h-6 px-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold inline-flex items-center gap-1"
                                  >
                                    <Check className="size-3" /> Lưu ý kiến
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDangChiDaoId(null)}
                                    className="h-6 px-2 rounded bg-muted hover:bg-muted/80 text-[10px] font-semibold inline-flex items-center gap-1"
                                  >
                                    <X className="size-3" /> Hủy
                                  </button>
                                </div>
                              </div>
                              <textarea
                                rows={2}
                                value={noiDungChiDao}
                                onChange={(e) => setNoiDungChiDao(e.target.value)}
                                placeholder="Nhập ý kiến hỗ trợ, định hướng tháo gỡ cho nhân viên..."
                                className="w-full rounded-md border border-amber-500/40 bg-background p-2 text-xs font-medium"
                              />
                            </div>
                          ) : (
                            laQuanLyHoacGiamDoc && !kq.chi_dao && (
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => xuLyBatDauChiDao(kq)}
                                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 transition-colors"
                                >
                                  <MessageSquareQuote className="size-3" /> + Ghi ý kiến đồng hành / hỗ trợ
                                </button>
                              </div>
                            )
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </The_Chuc_Nang>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Nut kieu="outline" onClick={onDong}>
            Hủy
          </Nut>
          <Nut kieu="primary" icon_trai={Save} onClick={xuLyLuu}>
            Lưu Check-in & Đồng bộ
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
