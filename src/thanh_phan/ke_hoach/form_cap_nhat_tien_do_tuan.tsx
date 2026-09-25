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

    onLuu(item.id, {
      danh_sach_ket_qua: dsCuoi,
      ket_qua_thuc_te: ketQuaGanNhat,
      da_hoan_thanh: daHoanThanh
    });
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de="Cập nhật tiến độ & Kết quả thực hiện"
      phu_de={item.ten_khach_hang_du_an}
    >
      <div className="space-y-4 p-1">
        {/* Thông tin mục tiêu ban đầu */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground text-sm">
                {item.ten_khach_hang_du_an}
              </span>
              {item.ngay_du_kien && (
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[11px] inline-flex items-center gap-1">
                  <Calendar className="size-3" /> Dự kiến: {new Date(item.ngay_du_kien).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border/60">
              <div className="text-muted-foreground font-semibold">Kết quả / Đầu ra cam kết:</div>
              <div className="font-bold text-foreground text-xs">{item.ket_qua_mong_muon || item.dau_ra_cam_ket || '—'}</div>
              {(item.hanh_dong_tuan || item.noi_dung_tuan) && (
                <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                  <span className="font-semibold text-foreground">Hành động:</span> {item.hanh_dong_tuan || item.noi_dung_tuan}
                </div>
              )}
            </div>

            {/* Checkbox Đã hoàn thành mục tiêu */}
            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={daHoanThanh}
                onChange={(e) => setDaHoanThanh(e.target.checked)}
                className="size-4.5 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <CheckCircle2 className={`size-4 ${daHoanThanh ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                Đánh dấu đã hoàn thành toàn bộ công việc này
              </span>
            </label>
          </div>
        </The_Chuc_Nang>

        {/* Ô nhập thêm kết quả mới */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="font-bold text-foreground text-sm flex items-center justify-between">
              <span>Ghi nhận tiến độ / Kết quả mới</span>
              <span className="text-muted-foreground text-[11px] font-normal">
                (Có thể thêm nhiều mốc kết quả trong tuần)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={ngayGhiNhanMoi}
                onChange={(e) => setNgayGhiNhanMoi(e.target.value)}
                className="h-8.5 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground"
              />
              <span className="text-muted-foreground text-[11px]">Ngày thực hiện</span>
            </div>

            <div>
              <textarea
                rows={2}
                value={noiDungMoi}
                onChange={(e) => setNoiDungMoi(e.target.value)}
                placeholder="VD: Ngày 15/09: Đã gặp khách hàng, trình bày giải pháp. Khách hẹn thứ 5 xem demo..."
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Tài liệu & Link đính kèm */}
            {hienNhapLinkMoi ? (
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-foreground flex items-center gap-1">
                    <Link2 className="size-3 text-primary" />
                    Đính kèm Link / Tài liệu minh chứng
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
                    Bỏ đính kèm
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={linkDinhKemMoi}
                    onChange={(e) => setLinkDinhKemMoi(e.target.value)}
                    placeholder="https://drive.google.com/... hoặc link tài liệu"
                    className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-mono text-foreground"
                  />
                  <input
                    type="text"
                    value={tenTaiLieuMoi}
                    onChange={(e) => setTenTaiLieuMoi(e.target.value)}
                    placeholder="Tên tài liệu: Báo giá PDF, Hợp đồng scan..."
                    className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground"
                  />
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setHienNhapLinkMoi(true)}
                  className="text-[11px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <Link2 className="size-3" /> + Đính kèm link tài liệu / file
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={xuLyThemKetQua}
              className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-3.5" /> Thêm kết quả này vào lịch sử
            </button>
          </div>
        </The_Chuc_Nang>

        {/* Danh sách các kết quả đã ghi nhận */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="font-bold text-foreground text-sm flex items-center justify-between">
              <span>Lịch sử kết quả đạt được ({danhSachKetQua.length})</span>
              <span className="text-[11px] text-muted-foreground italic font-normal">
                Bấm nút "Sửa" nếu cần chỉnh sửa nội dung hoặc link
              </span>
            </div>

            {danhSachKetQua.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground italic">
                Chưa có kết quả nào được ghi nhận. Nhập nội dung ở trên và bấm "Lưu".
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-muted-foreground">
                                {kq.ngay_ghi_nhan ? new Date(kq.ngay_ghi_nhan).toLocaleDateString('vi-VN') : '—'}
                              </span>
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

                          {/* Hiển thị Ý kiến chỉ đạo từ cấp trên (nếu có) */}
                          {kq.chi_dao && (
                            <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-amber-800 flex items-center gap-1.5 text-[11px]">
                                  <MessageSquareQuote className="size-3.5 text-amber-600" />
                                  <span>
                                    Chỉ đạo từ {kq.chi_dao.ten_nguoi_chi_dao || 'Cấp trên'}
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
                                  Ngày chỉ đạo: {new Date(kq.chi_dao.ngay_chi_dao).toLocaleDateString('vi-VN')}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Khung nhập / sửa chỉ đạo của cấp trên */}
                          {laDangChiDao ? (
                            <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-800 text-[11px] flex items-center gap-1">
                                  <Shield className="size-3 text-amber-600" /> Ý kiến chỉ đạo của Cấp trên
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => xuLyLuuChiDao(kq.id)}
                                    className="h-6 px-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold inline-flex items-center gap-1"
                                  >
                                    <Check className="size-3" /> Lưu chỉ đạo
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
                                placeholder="Nhập ý kiến chỉ đạo, nhận xét, định hướng cho nhân viên..."
                                className="w-full rounded-md border border-amber-500/40 bg-background p-2 text-xs font-medium"
                              />
                            </div>
                          ) : (
                            /* Nút mở ô chỉ đạo (chỉ hiển thị cho Cấp trên và khi chưa có chỉ đạo) */
                            laQuanLyHoacGiamDoc && !kq.chi_dao && (
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => xuLyBatDauChiDao(kq)}
                                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 transition-colors"
                                >
                                  <MessageSquareQuote className="size-3" /> + Thêm ý kiến chỉ đạo của Cấp trên
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
            Lưu toàn bộ kết quả
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
