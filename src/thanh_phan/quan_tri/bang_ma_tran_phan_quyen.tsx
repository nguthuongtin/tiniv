'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';
import type { VaiTro } from '../../thu_vien/types/nhan_su';
import {
  DANH_SACH_QUYEN_HAN_HE_THONG,
  CAC_VAI_TRO_CHUAN_HE_THONG,
  type ItemQuyenHan
} from '../../thu_vien/types/nhan_su';
import { capNhatQuyenHanVaiTro } from '../../dich_vu/nhan_su/dich_vu_vai_tro';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import { Nut } from '../ui';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  danhSachVaiTro: VaiTro[];
  onThayDoi?: () => void;
}

const NHOM_QUYEN_TIEN_TE: Record<ItemQuyenHan['nhom'], { ten: string; icon: string; mau: string }> = {
  du_an: { ten: 'Phân hệ Dự án', icon: '📁', mau: 'text-blue-600 bg-blue-50 border-blue-200' },
  ke_hoach: { ten: 'Kế hoạch tác chiến', icon: '🎯', mau: 'text-purple-600 bg-purple-50 border-purple-200' },
  bao_cao: { ten: 'Báo cáo ngày', icon: '📝', mau: 'text-amber-600 bg-amber-50 border-amber-200' },
  nhan_su: { ten: 'Quản lý Nhân sự', icon: '👥', mau: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  he_thong: { ten: 'Quản trị Hệ thống', icon: '⚙️', mau: 'text-red-600 bg-red-50 border-red-200' }
};

const QUYEN_MAC_DINH_SYSTEM: Record<string, string[]> = {
  quan_tri_he_thong: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen),
  giam_doc: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen).filter((m) => m !== 'he_thong.quan_tri'),
  truong_phong: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
  nhan_vien_kinh_doanh: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  nhan_vien_ky_thuat: ['du_an.xem', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  hanh_chinh_van_phong: ['nhan_su.xem', 'nhan_su.quan_ly', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.xuat_file']
};

export default function BangMaTranPhanQuyen({ danhSachVaiTro, onThayDoi }: Props) {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const [quyenState, setQuyenState] = useState<Record<string, string[]>>({});
  const [dangLuu, setDangLuu] = useState<Record<string, boolean>>({});
  const [thongBao, setThongBao] = useState<{ loai: 'thanh_cong' | 'loi'; text: string } | null>(null);

  // Combine standard system roles + custom roles
  const danhSachEffective = useMemo(() => {
    const list: VaiTro[] = [];
    const setProcessedKeys = new Set<string>();

    CAC_VAI_TRO_CHUAN_HE_THONG.forEach((std) => {
      const tonTai = danhSachVaiTro.find((v) => v.ma_vai_tro === std.key || v.id === std.key);
      if (tonTai) {
        list.push({
          ...tonTai,
          ten_vai_tro: tonTai.ten_vai_tro || std.tenMacDinh,
          is_he_thong: true
        });
        setProcessedKeys.add(tonTai.id);
        if (tonTai.ma_vai_tro) setProcessedKeys.add(tonTai.ma_vai_tro);
      } else {
        list.push({
          id: std.key,
          ma_vai_tro: std.key,
          ten_vai_tro: std.tenMacDinh,
          mo_ta: std.moTa,
          kieu_hien_thi: std.badge,
          thu_tu_sap_xep: 0,
          danh_sach_quyen: QUYEN_MAC_DINH_SYSTEM[std.key] ?? [],
          is_he_thong: true,
          nguoi_tao_id: null,
          ngay_tao: new Date().toISOString(),
          ngay_cap_nhat: new Date().toISOString(),
          trang_thai_du_lieu: 'hoat_dong'
        });
        setProcessedKeys.add(std.key);
      }
    });

    danhSachVaiTro.forEach((vt) => {
      if (!setProcessedKeys.has(vt.id) && (!vt.ma_vai_tro || !setProcessedKeys.has(vt.ma_vai_tro))) {
        list.push(vt);
      }
    });

    return list;
  }, [danhSachVaiTro]);

  // Sync initial roles state
  useEffect(() => {
    const mapQuyen: Record<string, string[]> = {};
    danhSachEffective.forEach((vt) => {
      if (vt.danh_sach_quyen && vt.danh_sach_quyen.length > 0) {
        mapQuyen[vt.id] = vt.danh_sach_quyen;
      } else if (vt.ma_vai_tro && QUYEN_MAC_DINH_SYSTEM[vt.ma_vai_tro]) {
        mapQuyen[vt.id] = QUYEN_MAC_DINH_SYSTEM[vt.ma_vai_tro];
      } else {
        mapQuyen[vt.id] = [];
      }
    });
    setQuyenState(mapQuyen);
  }, [danhSachEffective]);

  // Group permissions by module
  const nhomQuyen = useMemo(() => {
    const map: Record<string, ItemQuyenHan[]> = {
      du_an: [],
      ke_hoach: [],
      bao_cao: [],
      nhan_su: [],
      he_thong: []
    };
    DANH_SACH_QUYEN_HAN_HE_THONG.forEach((q) => {
      if (map[q.nhom]) map[q.nhom].push(q);
    });
    return map;
  }, []);

  const toggleQuyen = (vaiTroId: string, maQuyen: string) => {
    setQuyenState((prev) => {
      const currentList = prev[vaiTroId] ?? [];
      const hasQuyen = currentList.includes(maQuyen);
      const newList = hasQuyen
        ? currentList.filter((q) => q !== maQuyen)
        : [...currentList, maQuyen];
      return { ...prev, [vaiTroId]: newList };
    });
  };

  const luuPhanQuyen = async (vt: VaiTro) => {
    setDangLuu((prev) => ({ ...prev, [vt.id]: true }));
    setThongBao(null);
    try {
      const listQuyen = quyenState[vt.id] ?? [];
      await capNhatQuyenHanVaiTro(vt.id, listQuyen, nguoiDungHienTai);
      setThongBao({
        loai: 'thanh_cong',
        text: `Đã lưu ma trận phân quyền cho vai trò "${vt.ten_vai_tro}"!`
      });
      onThayDoi?.();
    } catch (err: any) {
      setThongBao({ loai: 'loi', text: 'Lưu thất bại: ' + (err?.message || 'Lỗi hệ thống') });
    } finally {
      setDangLuu((prev) => {
        const copy = { ...prev };
        delete copy[vt.id];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Alert banner */}
      {thongBao && (
        <div
          className={cn(
            'p-3.5 rounded-xl border text-sm font-medium flex items-center justify-between gap-3 shadow-xs',
            thongBao.loai === 'thanh_cong'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
          )}
        >
          <div className="flex items-center gap-2.5">
            {thongBao.loai === 'thanh_cong' ? (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="size-5 shrink-0 text-red-600" />
            )}
            <span>{thongBao.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setThongBao(null)}
            className="text-xs underline font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Grid Matrix Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/80 bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Ma Trận Phân Quyền Hệ Thống (Permission Matrix)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tích chọn các quyền được phép thực thi cho từng vai trò người dùng trong hệ thống
            </p>
          </div>
        </div>

        {danhSachEffective.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-2">
            <p className="font-semibold text-xs">Chưa có vai trò nào được định nghĩa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[220px] max-w-[240px] sticky left-0 bg-muted/90 backdrop-blur-xs z-30 border-r border-border shadow-xs">
                    Vai trò người dùng
                  </th>
                  {Object.entries(nhomQuyen).map(([keyModule, listQuyen]) => {
                    const info = NHOM_QUYEN_TIEN_TE[keyModule as keyof typeof NHOM_QUYEN_TIEN_TE];
                    return (
                      <th
                        key={keyModule}
                        colSpan={listQuyen.length}
                        className="py-2.5 px-3 text-center border-l border-border/80 bg-muted/40"
                      >
                        <div className="inline-flex items-center gap-1.5 font-bold text-foreground text-xs">
                          <span>{info.icon}</span>
                          <span>{info.ten}</span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-4 w-28 text-center sticky right-0 bg-muted/90 backdrop-blur-xs z-30 border-l border-border shadow-xs">
                    Hành động
                  </th>
                </tr>
                <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold text-muted-foreground">
                  <th className="py-2 px-4 sticky left-0 bg-muted/90 backdrop-blur-xs z-30 border-r border-border">
                    Chi tiết quyền
                  </th>
                  {Object.values(nhomQuyen).flatMap((listQuyen) =>
                    listQuyen.map((q) => (
                      <th
                        key={q.ma_quyen}
                        className="py-2 px-2 text-center border-l border-border/40 min-w-[120px] max-w-[140px] leading-tight bg-muted/20"
                        title={q.ten_quyen}
                      >
                        {q.ten_quyen}
                      </th>
                    ))
                  )}
                  <th className="py-2 px-4 sticky right-0 bg-muted/90 backdrop-blur-xs z-30 border-l border-border"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-background">
                {danhSachEffective.map((vt) => {
                  const isSystemAdmin = vt.ma_vai_tro === 'quan_tri_he_thong';
                  const isSaving = Boolean(dangLuu[vt.id]);
                  const currentPermissions = quyenState[vt.id] ?? [];

                  return (
                    <tr key={vt.id} className="hover:bg-muted/40 transition-colors group">
                      {/* Role Info Cell */}
                      <td className="py-3.5 px-4 font-bold text-foreground sticky left-0 bg-background group-hover:bg-muted/40 z-20 border-r border-border">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm">{vt.ten_vai_tro}</span>
                          {vt.is_he_thong && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                              <Lock className="size-3" /> Hệ thống
                            </span>
                          )}
                        </div>
                        {vt.mo_ta && (
                          <p className="text-[11px] font-normal text-muted-foreground mt-0.5 line-clamp-1">
                            {vt.mo_ta}
                          </p>
                        )}
                      </td>

                      {/* Permissions Grid Cells */}
                      {Object.values(nhomQuyen).flatMap((listQuyen) =>
                        listQuyen.map((q) => {
                          const isChecked = isSystemAdmin || currentPermissions.includes(q.ma_quyen);
                          return (
                            <td
                              key={q.ma_quyen}
                              className="py-3 px-2 text-center border-l border-border/40"
                            >
                              <input
                                type="checkbox"
                                disabled={isSystemAdmin || isSaving}
                                checked={isChecked}
                                onChange={() => toggleQuyen(vt.id, q.ma_quyen)}
                                className="size-4 rounded text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                title={`${vt.ten_vai_tro}: ${q.ten_quyen}`}
                              />
                            </td>
                          );
                        })
                      )}

                      {/* Action Cell */}
                      <td className="py-3.5 px-4 text-center sticky right-0 bg-background group-hover:bg-muted/40 z-20 border-l border-border">
                        {isSystemAdmin ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md inline-block">
                            Full Admin
                          </span>
                        ) : (
                          <Nut
                            kieu="primary"
                            kich_thuoc="sm"
                            onClick={() => luuPhanQuyen(vt)}
                            disabled={isSaving}
                            icon_trai={isSaving ? Loader2 : Save}
                            className="h-7.5 text-xs font-bold px-3 shadow-xs"
                          >
                            {isSaving ? 'Lưu...' : 'Lưu'}
                          </Nut>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
