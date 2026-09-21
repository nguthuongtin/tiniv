'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  RotateCcw,
  CheckCheck,
  XCircle,
  Undo2
} from 'lucide-react';
import type { VaiTro } from '../../thu_vien/types/nhan_su';
import {
  DANH_SACH_QUYEN_HAN_HE_THONG,
  CAC_VAI_TRO_CHUAN_HE_THONG,
  type ItemQuyenHan
} from '../../thu_vien/types/nhan_su';
import {
  capNhatQuyenHanVaiTro,
  capNhatHangLoatQuyenHanVaiTro
} from '../../dich_vu/nhan_su/dich_vu_vai_tro';
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
  giam_doc: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen).filter((m) => m !== 'he_thong.quan_tri' && m !== 'du_an.khoi_phuc'),
  truong_phong: ['du_an.xem', 'du_an.tao_sua', 'du_an.xoa', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
  nhan_vien_kinh_doanh: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  nhan_vien_ky_thuat: ['du_an.xem', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  hanh_chinh_van_phong: ['nhan_su.xem', 'nhan_su.quan_ly', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.xuat_file']
};

export default function BangMaTranPhanQuyen({ danhSachVaiTro, onThayDoi }: Props) {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const [quyenState, setQuyenState] = useState<Record<string, string[]>>({});
  const [vaiTroDaSua, setVaiTroDaSua] = useState<Set<string>>(new Set());
  const [dangLuu, setDangLuu] = useState<Record<string, boolean>>({});
  const [dangLuuTatCa, setDangLuuTatCa] = useState(false);
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

  // Initial map of permissions from database/defaults
  const initialMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    danhSachEffective.forEach((vt) => {
      if (Array.isArray(vt.danh_sach_quyen)) {
        map[vt.id] = vt.danh_sach_quyen;
      } else if (vt.ma_vai_tro && QUYEN_MAC_DINH_SYSTEM[vt.ma_vai_tro]) {
        map[vt.id] = QUYEN_MAC_DINH_SYSTEM[vt.ma_vai_tro];
      } else {
        map[vt.id] = [];
      }
    });
    return map;
  }, [danhSachEffective]);

  // Sync initial roles state without overwriting active user edits
  useEffect(() => {
    setQuyenState((prev) => {
      const next = { ...prev };
      danhSachEffective.forEach((vt) => {
        if (!next[vt.id] || !vaiTroDaSua.has(vt.id)) {
          next[vt.id] = initialMap[vt.id] ?? [];
        }
      });
      return next;
    });
  }, [initialMap, danhSachEffective, vaiTroDaSua]);

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

  const tatCaMaQuyen = useMemo(() => {
    return DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen);
  }, []);

  const coThayDoi = (vaiTroId: string): boolean => {
    const curr = quyenState[vaiTroId] ?? [];
    const init = initialMap[vaiTroId] ?? [];
    if (curr.length !== init.length) return true;
    const setInit = new Set(init);
    return curr.some((q) => !setInit.has(q));
  };

  const danhSachVaiTroCoThayDoi = useMemo(() => {
    return danhSachEffective.filter((vt) => {
      if (vt.ma_vai_tro === 'quan_tri_he_thong') return false;
      return coThayDoi(vt.id);
    });
  }, [danhSachEffective, quyenState, initialMap]);

  const toggleQuyen = (vaiTroId: string, maQuyen: string) => {
    setVaiTroDaSua((prev) => new Set(prev).add(vaiTroId));
    setQuyenState((prev) => {
      const currentList = prev[vaiTroId] ?? [];
      const hasQuyen = currentList.includes(maQuyen);
      const newList = hasQuyen
        ? currentList.filter((q) => q !== maQuyen)
        : [...currentList, maQuyen];
      return { ...prev, [vaiTroId]: newList };
    });
  };

  const chonTatCaQuyen = (vaiTroId: string) => {
    setVaiTroDaSua((prev) => new Set(prev).add(vaiTroId));
    setQuyenState((prev) => ({
      ...prev,
      [vaiTroId]: [...tatCaMaQuyen]
    }));
  };

  const boChonTatCaQuyen = (vaiTroId: string) => {
    setVaiTroDaSua((prev) => new Set(prev).add(vaiTroId));
    setQuyenState((prev) => ({
      ...prev,
      [vaiTroId]: []
    }));
  };

  const khoiPhucMacDinh = (vt: VaiTro) => {
    const def = (vt.ma_vai_tro && QUYEN_MAC_DINH_SYSTEM[vt.ma_vai_tro]) || [];
    setVaiTroDaSua((prev) => new Set(prev).add(vt.id));
    setQuyenState((prev) => ({
      ...prev,
      [vt.id]: [...def]
    }));
  };

  const huyThayDoi = (vaiTroId: string) => {
    setVaiTroDaSua((prev) => {
      const copy = new Set(prev);
      copy.delete(vaiTroId);
      return copy;
    });
    setQuyenState((prev) => ({
      ...prev,
      [vaiTroId]: initialMap[vaiTroId] ? [...initialMap[vaiTroId]] : []
    }));
  };

  const huyTatCaThayDoi = () => {
    setVaiTroDaSua(new Set());
    setQuyenState({ ...initialMap });
    setThongBao(null);
  };

  const luuPhanQuyen = async (vt: VaiTro) => {
    setDangLuu((prev) => ({ ...prev, [vt.id]: true }));
    setThongBao(null);
    try {
      const listQuyen = quyenState[vt.id] ?? [];
      await capNhatQuyenHanVaiTro(vt.id, listQuyen, nguoiDungHienTai);
      setVaiTroDaSua((prev) => {
        const copy = new Set(prev);
        copy.delete(vt.id);
        return copy;
      });
      setThongBao({
        loai: 'thanh_cong',
        text: `Đã lưu thành công ma trận phân quyền cho vai trò "${vt.ten_vai_tro}" (${listQuyen.length} quyền)!`
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

  const luuTatCaThayDoi = async () => {
    if (danhSachVaiTroCoThayDoi.length === 0) return;
    setDangLuuTatCa(true);
    setThongBao(null);
    try {
      const danhSachCapNhat = danhSachVaiTroCoThayDoi.map((vt) => ({
        vai_tro_id: vt.id,
        danh_sach_quyen: quyenState[vt.id] ?? []
      }));

      await capNhatHangLoatQuyenHanVaiTro(danhSachCapNhat, nguoiDungHienTai);
      setVaiTroDaSua(new Set());
      setThongBao({
        loai: 'thanh_cong',
        text: `Đã lưu thành công phân quyền cho tất cả ${danhSachCapNhat.length} vai trò!`
      });
      onThayDoi?.();
    } catch (err: any) {
      setThongBao({ loai: 'loi', text: 'Lưu tất cả thất bại: ' + (err?.message || 'Lỗi hệ thống') });
    } finally {
      setDangLuuTatCa(false);
    }
  };

  const soLuongThayDoi = danhSachVaiTroCoThayDoi.length;

  return (
    <div className="space-y-5">
      {/* Alert banner */}
      {thongBao && (
        <div
          className={cn(
            'p-3.5 rounded-xl border text-sm font-medium flex items-center justify-between gap-3 shadow-xs transition-all duration-200',
            thongBao.loai === 'thanh_cong'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
              : 'bg-red-500/10 border-red-500/30 text-red-700'
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
            className="text-xs underline font-semibold hover:opacity-80"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Grid Matrix Table Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {/* Header with Save All Bar */}
        <div className="p-4 border-b border-border/80 bg-muted/20 flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Ma Trận Phân Quyền Hệ Thống (Permission Matrix)
            </h3>
            <p className="text-xs text-muted-foreground">
              Tích chọn các quyền được phép thực thi cho từng vai trò người dùng trong hệ thống
            </p>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {soLuongThayDoi > 0 && (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30 animate-pulse">
                  <span className="size-2 rounded-full bg-amber-500" />
                  {soLuongThayDoi} vai trò chưa lưu
                </span>

                <Nut
                  kieu="outline"
                  kich_thuoc="sm"
                  onClick={huyTatCaThayDoi}
                  disabled={dangLuuTatCa}
                  icon_trai={Undo2}
                  className="h-8 text-xs font-semibold"
                >
                  Hủy thay đổi
                </Nut>

                <Nut
                  kieu="primary"
                  kich_thuoc="sm"
                  onClick={luuTatCaThayDoi}
                  disabled={dangLuuTatCa}
                  icon_trai={dangLuuTatCa ? Loader2 : Save}
                  className="h-8 text-xs font-bold px-4 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {dangLuuTatCa ? 'Đang lưu...' : `Lưu tất cả (${soLuongThayDoi})`}
                </Nut>
              </>
            )}
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
                  <th className="py-3 px-4 min-w-[240px] max-w-[260px] sticky left-0 bg-muted/95 backdrop-blur-xs z-30 border-r border-border shadow-xs">
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
                  <th className="py-3 px-4 w-32 text-center sticky right-0 bg-muted/95 backdrop-blur-xs z-30 border-l border-border shadow-xs">
                    Hành động
                  </th>
                </tr>
                <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold text-muted-foreground">
                  <th className="py-2 px-4 sticky left-0 bg-muted/95 backdrop-blur-xs z-30 border-r border-border">
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
                  <th className="py-2 px-4 sticky right-0 bg-muted/95 backdrop-blur-xs z-30 border-l border-border"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-background">
                {danhSachEffective.map((vt) => {
                  const isSystemAdmin = vt.ma_vai_tro === 'quan_tri_he_thong';
                  const isSaving = Boolean(dangLuu[vt.id]) || dangLuuTatCa;
                  const currentPermissions = quyenState[vt.id] ?? [];
                  const isDirty = !isSystemAdmin && coThayDoi(vt.id);

                  return (
                    <tr
                      key={vt.id}
                      className={cn(
                        'transition-colors group',
                        isDirty ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]' : 'hover:bg-muted/40'
                      )}
                    >
                      {/* Role Info Cell */}
                      <td
                        className={cn(
                          'py-3 px-4 sticky left-0 z-20 border-r border-border backdrop-blur-xs',
                          isDirty ? 'bg-background/95' : 'bg-background/95 group-hover:bg-muted/40'
                        )}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-foreground">{vt.ten_vai_tro}</span>
                            {vt.is_he_thong && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                                <Lock className="size-3" /> Hệ thống
                              </span>
                            )}
                            {isDirty ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 border border-amber-500/30 shrink-0">
                                • Chưa lưu
                              </span>
                            ) : (
                              !isSystemAdmin && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 shrink-0">
                                  ✓ Đã lưu
                                </span>
                              )
                            )}
                          </div>

                          {vt.mo_ta && (
                            <p className="text-[11px] font-normal text-muted-foreground line-clamp-1">
                              {vt.mo_ta}
                            </p>
                          )}

                          {/* Quick Role Actions */}
                          {!isSystemAdmin && (
                            <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground">
                              <button
                                type="button"
                                onClick={() => chonTatCaQuyen(vt.id)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1 hover:text-primary transition font-medium"
                                title="Chọn tất cả quyền"
                              >
                                <CheckCheck className="size-3" /> Chọn hết
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => boChonTatCaQuyen(vt.id)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1 hover:text-red-600 transition font-medium"
                                title="Bỏ chọn tất cả quyền"
                              >
                                <XCircle className="size-3" /> Bỏ hết
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => khoiPhucMacDinh(vt)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1 hover:text-amber-600 transition font-medium"
                                title="Khôi phục quyền mặc định ban đầu"
                              >
                                <RotateCcw className="size-3" /> Mặc định
                              </button>
                            </div>
                          )}
                        </div>
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
                                className="size-4 rounded text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition"
                                title={`${vt.ten_vai_tro}: ${q.ten_quyen}`}
                              />
                            </td>
                          );
                        })
                      )}

                      {/* Action Cell */}
                      <td
                        className={cn(
                          'py-3 px-4 text-center sticky right-0 z-20 border-l border-border backdrop-blur-xs',
                          isDirty ? 'bg-background/95' : 'bg-background/95 group-hover:bg-muted/40'
                        )}
                      >
                        {isSystemAdmin ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                            Full Admin
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            {isDirty && (
                              <button
                                type="button"
                                onClick={() => huyThayDoi(vt.id)}
                                disabled={isSaving}
                                title="Hoàn tác thay đổi của vai trò này"
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
                              >
                                <Undo2 className="size-3.5" />
                              </button>
                            )}

                            <Nut
                              kieu={isDirty ? 'primary' : 'secondary'}
                              kich_thuoc="sm"
                              onClick={() => luuPhanQuyen(vt)}
                              disabled={isSaving || !isDirty}
                              icon_trai={isSaving ? Loader2 : Save}
                              className={cn(
                                'h-7.5 text-xs font-bold px-3 shadow-xs transition',
                                isDirty && 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                              )}
                            >
                              {isSaving ? 'Lưu...' : isDirty ? 'Lưu' : 'Đã lưu'}
                            </Nut>
                          </div>
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
