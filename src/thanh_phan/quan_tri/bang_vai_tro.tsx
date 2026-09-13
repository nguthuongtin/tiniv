'use client';

import { useState } from 'react';
import {
  Shield,
  Pencil,
  RotateCcw,
  Loader2,
  X,
  Save,
  Users,
  CheckCircle2,
  Lock,
  Plus
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
    moTa: 'Xem và giám sát số liệu tất cả chi nhánh, mọi dự án, hợp đồng và báo cáo tài chính.',
    badge: 'primary'
  },
  {
    key: 'truong_phong',
    tenMacDinh: 'Trưởng phòng / Quản lý',
    phamVi: 'Chi nhánh & Phòng ban',
    moTa: 'Quản lý nhân sự, phân công công việc, phê duyệt tiến độ thuộc chi nhánh phụ trách.',
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

export default function BangVaiTro({
  danhSach,
  dsNhanSu,
  dangTai,
  onLuu
}: BangVaiTroProps) {
  const [moModal, setMoModal] = useState(false);
  const [dangSua, setDangSua] = useState<VaiTro | null>(null);
  const [dangSuaKey, setDangSuaKey] = useState<string>('');
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  const [form, setForm] = useState<{
    ten_vai_tro: string;
    kieu_hien_thi: KieuBadgeVaiTro;
    mo_ta: string;
  }>({
    ten_vai_tro: '',
    kieu_hien_thi: 'primary',
    mo_ta: ''
  });

  const moChinhSua = (itemChuan: typeof CAC_VAI_TRO_CHUAN[0]) => {
    const tonTai = danhSach.find((v) => v.ma_vai_tro === itemChuan.key || v.id === itemChuan.key);
    setDangSua(tonTai || null);
    setDangSuaKey(itemChuan.key);
    setLoi(null);
    setForm({
      ten_vai_tro: tonTai?.ten_vai_tro || itemChuan.tenMacDinh,
      kieu_hien_thi: tonTai?.kieu_hien_thi || itemChuan.badge,
      mo_ta: tonTai?.mo_ta || itemChuan.moTa
    });
    setMoModal(true);
  };

  const handleLuu = async () => {
    if (!form.ten_vai_tro.trim()) {
      setLoi('Vui lòng nhập tên hiển thị của vai trò');
      return;
    }
    setDangLuu(true);
    setLoi(null);
    try {
      if (dangSua) {
        await onLuu(
          {
            id: dangSua.id,
            ten_vai_tro: form.ten_vai_tro.trim(),
            kieu_hien_thi: form.kieu_hien_thi,
            mo_ta: form.mo_ta.trim() || null
          },
          dangSua.id
        );
      } else {
        await onLuu({
          ma_vai_tro: dangSuaKey,
          ten_vai_tro: form.ten_vai_tro.trim(),
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

  const demSoNhanSu = (key: string) => {
    return dsNhanSu.filter(
      (ns) => ns.vai_tro === key || ns.vai_tro === danhSach.find((v) => v.ma_vai_tro === key)?.id
    ).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh mục vai trò & Chức năng</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Định nghĩa các vai trò hệ thống và vai trò tùy chỉnh do công ty tự thêm
          </p>
        </div>
        <Nut
          kieu="primary"
          kich_thuoc="sm"
          icon_trai={Plus}
          onClick={() => {
            setDangSua(null);
            setDangSuaKey(`custom_role_${Date.now()}`);
            setForm({ ten_vai_tro: '', kieu_hien_thi: 'primary', mo_ta: '' });
            setLoi(null);
            setMoModal(true);
          }}
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
              <th className="p-3 text-left w-48">Tên vai trò</th>
              <th className="p-3 text-left w-44">Phạm vi truy cập</th>
              <th className="p-3 text-left">Mô tả quyền hạn</th>
              <th className="p-3 text-center w-28">Nhân sự</th>
              <th className="p-3 text-right w-20">Sửa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CAC_VAI_TRO_CHUAN.map((item, idx) => {
              const banGhiTuyChinh = danhSach.find(
                (v) => v.ma_vai_tro === item.key || v.id === item.key
              );
              const tenHienThi = banGhiTuyChinh?.ten_vai_tro || item.tenMacDinh;
              const badgeStyle = banGhiTuyChinh?.kieu_hien_thi || item.badge;
              const moTa = banGhiTuyChinh?.mo_ta || item.moTa;
              const soLuong = demSoNhanSu(item.key);

              return (
                <tr key={item.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Hieu kieu={badgeStyle} kich_thuoc="sm">
                        {tenHienThi}
                      </Hieu>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">{item.key}</div>
                  </td>
                  <td className="p-3 text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100">
                      <Lock className="size-3 text-slate-400" />
                      {item.phamVi}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-600 leading-relaxed">
                    {moTa}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 tabular-nums">
                      <Users className="size-3.5 text-slate-400" />
                      {soLuong}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => moChinhSua(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition"
                      title="Chỉnh sửa nhãn & mô tả"
                    >
                      <Pencil className="size-4" />
                    </button>
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
                  <h3 className="font-bold text-slate-900">Tùy chỉnh vai trò</h3>
                  <p className="text-[11px] font-mono text-slate-400">{dangSuaKey}</p>
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
                  Tên hiển thị <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.ten_vai_tro}
                  onChange={(e) => setForm({ ...form, ten_vai_tro: e.target.value })}
                  placeholder="Ví dụ: Ban Giám Đốc"
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
                  placeholder="Mô tả tóm tắt quyền..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {loi && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-medium">
                  {loi}
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
                {dangLuu ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Nut>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
