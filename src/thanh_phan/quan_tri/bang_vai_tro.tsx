'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  Pencil,
  Trash2,
  Loader2,
  X,
  Save,
  Users,
  Lock,
  Plus,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { VaiTro, NhanSu, KieuBadgeVaiTro } from '../../thu_vien/types/nhan_su';
import type { TaoMoiVaiTroDTO, CapNhatVaiTroDTO } from '../../dich_vu/nhan_su/dich_vu_vai_tro';
import { Nut, Hieu } from '../ui';

interface BangVaiTroProps {
  danhSach: VaiTro[];
  dsNhanSu: NhanSu[];
  dangTai: boolean;
  onLuu: (dto: TaoMoiVaiTroDTO | CapNhatVaiTroDTO, idSua?: string) => Promise<void>;
  onXoa?: (id: string) => Promise<void>;
}

// Bảng vai trò chuẩn hóa hệ thống gắn liền với logic bảo mật Firestore Rules
const CAC_VAI_TRO_CHUAN: Array<{
  key: string;
  tenMacDinh: string;
  phamVi: string;
  moTa: string;
  badge: KieuBadgeVaiTro;
}> = [
  {
    key: 'quan_tri_he_thong',
    tenMacDinh: 'Quản trị hệ thống',
    phamVi: 'Toàn hệ thống',
    moTa: 'Toàn quyền cấu hình hệ thống, quản trị danh mục, tài khoản và phân quyền.',
    badge: 'danger'
  },
  {
    key: 'giam_doc',
    tenMacDinh: 'Ban Giám Đốc',
    phamVi: 'Toàn công ty',
    moTa: 'Xem và theo dõi số liệu tất cả chi nhánh, mọi dự án, hợp đồng và báo cáo tài chính.',
    badge: 'primary'
  },
  {
    key: 'truong_phong_kd',
    tenMacDinh: 'Trưởng phòng Kinh doanh',
    phamVi: 'Phòng Kinh doanh & Chi nhánh',
    moTa: 'Điều hành kế hoạch kinh doanh, tiếp nhận và chuyển tiếp yêu cầu phối hợp dự án.',
    badge: 'warning'
  },
  {
    key: 'truong_phong_khth',
    tenMacDinh: 'Trưởng phòng KHTH',
    phamVi: 'Phòng Kế hoạch Kỹ thuật / KHTH',
    moTa: 'Tiếp nhận yêu cầu phối hợp, phân công chuyên viên kỹ thuật và duyệt kết quả kỹ thuật.',
    badge: 'warning'
  },
  {
    key: 'truong_phong',
    tenMacDinh: 'Trưởng phòng / Quản lý chung',
    phamVi: 'Chi nhánh & Phòng ban',
    moTa: 'Quản lý nhân sự, phân công công việc, theo dõi tiến độ thuộc chi nhánh/phòng ban phụ trách.',
    badge: 'warning'
  },
  {
    key: 'nhan_vien_kinh_doanh',
    tenMacDinh: 'Nhân viên Kinh doanh',
    phamVi: 'Dữ liệu được phân công',
    moTa: 'Quản lý khách hàng, hồ sơ dự án, báo giá và công việc kinh doanh được giao.',
    badge: 'success'
  },
  {
    key: 'nhan_vien_ky_thuat',
    tenMacDinh: 'Nhân viên Kỹ thuật',
    phamVi: 'Dữ liệu được phân công',
    moTa: 'Cập nhật tiến độ khảo sát, giải pháp, triển khai kỹ thuật và nghiệm thu dự án.',
    badge: 'secondary'
  },
  {
    key: 'hanh_chinh_van_phong',
    tenMacDinh: 'Hành chính / Văn phòng',
    phamVi: 'Vận hành nội bộ',
    moTa: 'Theo dõi hợp đồng, tài liệu pháp lý và hỗ trợ thủ tục văn phòng.',
    badge: 'muted'
  }
];

interface DongHienThi {
  id: string;
  ma_vai_tro: string;
  ten_vai_tro: string;
  pham_vi: string;
  mo_ta: string;
  kieu_hien_thi: KieuBadgeVaiTro;
  is_he_thong: boolean;
  so_luong_nhan_su: number;
  banGhiGoc?: VaiTro;
}

export default function BangVaiTro({
  danhSach,
  dsNhanSu,
  dangTai,
  onLuu,
  onXoa
}: BangVaiTroProps) {
  const [moModal, setMoModal] = useState(false);
  const [dangSuaDong, setDangSuaDong] = useState<DongHienThi | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXoaId, setDangXoaId] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  const [form, setForm] = useState<{
    ma_vai_tro: string;
    ten_vai_tro: string;
    kieu_hien_thi: KieuBadgeVaiTro;
    mo_ta: string;
  }>({
    ma_vai_tro: '',
    ten_vai_tro: '',
    kieu_hien_thi: 'primary',
    mo_ta: ''
  });

  const demSoNhanSu = (key: string) => {
    return dsNhanSu.filter(
      (ns) => ns.vai_tro === key || ns.vai_tro === danhSach.find((v) => v.ma_vai_tro === key)?.id
    ).length;
  };

  // Kết hợp vai trò hệ thống chuẩn hóa và các vai trò tùy chỉnh
  const danhSachHienThi: DongHienThi[] = useMemo(() => {
    const list: DongHienThi[] = [];
    const setKeysDaXuLy = new Set<string>();

    // 1. Nạp vai trò chuẩn hệ thống
    CAC_VAI_TRO_CHUAN.forEach((std) => {
      const banGhiTuyChinh = danhSach.find(
        (v) => (v.ma_vai_tro === std.key || v.id === std.key) && v.trang_thai_du_lieu !== 'da_xoa'
      );

      list.push({
        id: banGhiTuyChinh?.id || std.key,
        ma_vai_tro: std.key,
        ten_vai_tro: banGhiTuyChinh?.ten_vai_tro || std.tenMacDinh,
        pham_vi: std.phamVi,
        mo_ta: banGhiTuyChinh?.mo_ta || std.moTa,
        kieu_hien_thi: banGhiTuyChinh?.kieu_hien_thi || std.badge,
        is_he_thong: true,
        so_luong_nhan_su: demSoNhanSu(std.key),
        banGhiGoc: banGhiTuyChinh
      });

      setKeysDaXuLy.add(std.key);
      if (banGhiTuyChinh) {
        setKeysDaXuLy.add(banGhiTuyChinh.id);
        if (banGhiTuyChinh.ma_vai_tro) setKeysDaXuLy.add(banGhiTuyChinh.ma_vai_tro);
      }
    });

    // 2. Nạp thêm các vai trò tùy chỉnh do người dùng tạo
    danhSach.forEach((vt) => {
      if (vt.trang_thai_du_lieu === 'da_xoa') return;
      const key = vt.ma_vai_tro || vt.id;
      if (!setKeysDaXuLy.has(vt.id) && !setKeysDaXuLy.has(key)) {
        list.push({
          id: vt.id,
          ma_vai_tro: key,
          ten_vai_tro: vt.ten_vai_tro,
          pham_vi: 'Tùy chỉnh',
          mo_ta: vt.mo_ta || 'Vai trò tùy chỉnh phân quyền',
          kieu_hien_thi: vt.kieu_hien_thi || 'secondary',
          is_he_thong: false,
          so_luong_nhan_su: demSoNhanSu(key),
          banGhiGoc: vt
        });
        setKeysDaXuLy.add(vt.id);
        setKeysDaXuLy.add(key);
      }
    });

    return list;
  }, [danhSach, dsNhanSu]);

  const moChinhSua = (row: DongHienThi) => {
    setDangSuaDong(row);
    setLoi(null);
    setForm({
      ma_vai_tro: row.ma_vai_tro,
      ten_vai_tro: row.ten_vai_tro,
      kieu_hien_thi: row.kieu_hien_thi,
      mo_ta: row.mo_ta
    });
    setMoModal(true);
  };

  const moThemMoi = () => {
    setDangSuaDong(null);
    setLoi(null);
    setForm({
      ma_vai_tro: '',
      ten_vai_tro: '',
      kieu_hien_thi: 'primary',
      mo_ta: ''
    });
    setMoModal(true);
  };

  const handleLuu = async () => {
    const tenTrimmed = form.ten_vai_tro.trim();
    if (!tenTrimmed) {
      setLoi('Vui lòng nhập tên hiển thị của vai trò');
      return;
    }

    setDangLuu(true);
    setLoi(null);
    try {
      if (dangSuaDong) {
        // Cập nhật vai trò hiện có
        if (dangSuaDong.banGhiGoc?.id) {
          await onLuu(
            {
              id: dangSuaDong.banGhiGoc.id,
              ten_vai_tro: tenTrimmed,
              kieu_hien_thi: form.kieu_hien_thi,
              mo_ta: form.mo_ta.trim() || null
            },
            dangSuaDong.banGhiGoc.id
          );
        } else {
          // Vai trò chuẩn hệ thống chưa lưu bản ghi tùy chỉnh -> tạo/lưu theo key
          await onLuu(
            {
              id: dangSuaDong.ma_vai_tro,
              ma_vai_tro: dangSuaDong.ma_vai_tro,
              ten_vai_tro: tenTrimmed,
              kieu_hien_thi: form.kieu_hien_thi,
              mo_ta: form.mo_ta.trim() || null,
              trang_thai_du_lieu: 'hoat_dong'
            } as any,
            dangSuaDong.ma_vai_tro
          );
        }
      } else {
        // Tạo vai trò mới
        let maKey = form.ma_vai_tro.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (!maKey) {
          maKey = `vai_tro_${Date.now()}`;
        }
        await onLuu({
          ma_vai_tro: maKey,
          ten_vai_tro: tenTrimmed,
          kieu_hien_thi: form.kieu_hien_thi,
          mo_ta: form.mo_ta.trim() || null,
          trang_thai_du_lieu: 'hoat_dong'
        });
      }
      setMoModal(false);
    } catch (err: any) {
      setLoi(err?.message || 'Có lỗi xảy ra');
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoa = async (row: DongHienThi) => {
    if (row.is_he_thong) return;
    if (!onXoa) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${row.ten_vai_tro}"?`)) {
      return;
    }
    setDangXoaId(row.id);
    try {
      await onXoa(row.id);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi xóa vai trò');
    } finally {
      setDangXoaId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh mục vai trò & Chức năng</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Định nghĩa các vai trò hệ thống chuẩn hóa và vai trò tùy chỉnh do công ty tự thêm
          </p>
        </div>
        <Nut
          kieu="primary"
          kich_thuoc="sm"
          icon_trai={Plus}
          onClick={moThemMoi}
          className="font-bold text-xs shrink-0"
        >
          + Thêm vai trò mới
        </Nut>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3 text-left w-12">STT</th>
              <th className="p-3 text-left w-56">Tên vai trò</th>
              <th className="p-3 text-left w-48">Phạm vi truy cập</th>
              <th className="p-3 text-left">Mô tả quyền hạn</th>
              <th className="p-3 text-center w-24">Nhân sự</th>
              <th className="p-3 text-right w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {danhSachHienThi.map((item, idx) => {
              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Hieu kieu={item.kieu_hien_thi} kich_thuoc="sm">
                        {item.ten_vai_tro}
                      </Hieu>
                      {item.is_he_thong ? (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Hệ thống
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          Tùy chỉnh
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-1">{item.ma_vai_tro}</div>
                  </td>
                  <td className="p-3 text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100">
                      <Lock className="size-3 text-slate-400" />
                      {item.pham_vi}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-600 leading-relaxed">
                    {item.mo_ta}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 tabular-nums">
                      <Users className="size-3.5 text-slate-400" />
                      {item.so_luong_nhan_su}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => moChinhSua(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition"
                        title="Chỉnh sửa nhãn & mô tả"
                      >
                        <Pencil className="size-4" />
                      </button>
                      {!item.is_he_thong && onXoa && (
                        <button
                          type="button"
                          onClick={() => handleXoa(item)}
                          disabled={dangXoaId === item.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Xóa vai trò tùy chỉnh"
                        >
                          {dangXoaId === item.id ? (
                            <Loader2 className="size-4 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {moModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {dangSuaDong ? 'Tùy chỉnh vai trò' : 'Thêm vai trò mới'}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {dangSuaDong ? dangSuaDong.ma_vai_tro : 'Tạo mới vai trò người dùng'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Mã định danh vai trò (Key) <span className="text-rose-500">*</span>
                </label>
                {dangSuaDong ? (
                  <div className="w-full h-10 px-3.5 flex items-center text-sm font-mono text-slate-500 bg-slate-100 rounded-xl border border-slate-200">
                    <Lock className="size-3.5 text-slate-400 mr-2 shrink-0" />
                    <span>{dangSuaDong.ma_vai_tro}</span>
                  </div>
                ) : (
                  <input
                    value={form.ma_vai_tro}
                    onChange={(e) => setForm({ ...form, ma_vai_tro: e.target.value })}
                    placeholder="Ví dụ: truong_phong_ke_toan, tro_ly..."
                    className="w-full h-10 px-3.5 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  {dangSuaDong?.is_he_thong
                    ? 'Mã vai trò hệ thống được cố định để đảm bảo tương thích logic bảo mật.'
                    : 'Mã định danh viết thường, dùng dấu gạch dưới (VD: truong_phong_kd).'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Tên hiển thị <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.ten_vai_tro}
                  onChange={(e) => setForm({ ...form, ten_vai_tro: e.target.value })}
                  placeholder="Ví dụ: Trưởng phòng Kinh doanh"
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Màu sắc huy hiệu (Badge)
                </label>
                <select
                  value={form.kieu_hien_thi}
                  onChange={(e) => setForm({ ...form, kieu_hien_thi: e.target.value as any })}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900"
                >
                  <option value="primary">Chính (Xanh dương)</option>
                  <option value="secondary">Thứ cấp (Tím)</option>
                  <option value="success">Thành công (Xanh lá)</option>
                  <option value="warning">Cảnh báo (Vàng cam)</option>
                  <option value="danger">Bảo mật cao (Đỏ)</option>
                  <option value="muted">Tiêu chuẩn (Xám)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Mô tả phạm vi quyền hạn
                </label>
                <textarea
                  rows={3}
                  value={form.mo_ta}
                  onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
                  placeholder="Mô tả chức năng, thẩm quyền của vai trò..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {loi && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{loi}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <Nut kieu="ghost" kich_thuoc="sm" onClick={() => setMoModal(false)}>
                Hủy
              </Nut>
              <Nut
                kieu="primary"
                kich_thuoc="sm"
                icon_trai={dangLuu ? Loader2 : Save}
                onClick={handleLuu}
                disabled={dangLuu}
              >
                {dangLuu ? 'Đang lưu...' : dangSuaDong ? 'Lưu thay đổi' : 'Thêm vai trò'}
              </Nut>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
