'use client';

import {
  addDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  onSnapshot,
  type DocumentData
} from 'firebase/firestore';
import type { LichGapKH, TrangThaiLichGap } from '../../thu_vien/types/lich_gap_kh';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'lich_gap_kh' as const;
const COLLECTION_FALLBACK = 'cong_viec' as const;
const LOAI_BAN_GHI_LICH = 'lich_gap_kh' as const;
const CACHE_KEYS = [
  'ebms_lich_gap_kh_cache_v2',
  'ebms_lich_gap_kh_cache_v1',
  'ebms_lich_gap_kh_cache'
];
const GIOI_HAN_MAC_DINH = 500;

export interface DieuKienLocLichGap {
  tuKhoa?: string | null;
  trang_thai?: TrangThaiLichGap | 'tat_ca' | null;
  nguoi_phu_trach_id?: string | null;
  chi_nhanh_id?: string | null;
  tu_ngay?: string | null;
  den_ngay?: string | null;
}

export type TaoMoiLichGapDTO = Omit<LichGapKH, 'id' | 'ngay_tao' | 'ngay_cap_nhat' | 'da_xoa'>;
export type CapNhatLichGapDTO = Partial<TaoMoiLichGapDTO>;

let _cacheDanhSachLich: { data: LichGapKH[]; time: number } | null = null;
let _suDungFallbackCongViec = false;
const CACHE_TTL_MS = 15_000;

const docCacheLocal = (): LichGapKH[] => {
  if (typeof window === 'undefined') return [];
  try {
    for (const key of CACHE_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        } catch {}
      }
    }
    return [];
  } catch {
    return [];
  }
};

const ghiCacheLocal = (ds: LichGapKH[]) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(ds);
    CACHE_KEYS.forEach((k) => localStorage.setItem(k, raw));
  } catch {
    // ignore
  }
};

const phatSuKienCapNhat = (lich?: LichGapKH) => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ebms_cap_nhat_lich_gap', { detail: lich }));
    } catch {}
  }
};

export const xoaCacheLichGapKH = () => {
  _cacheDanhSachLich = null;
};

const chuyenDoiDocThanhLichGap = (id: string, raw: DocumentData | undefined | null): LichGapKH => {
  const r = (raw ?? {}) as Partial<LichGapKH>;
  const now = new Date().toISOString();
  return {
    id,
    tieu_de: r.tieu_de || `Gặp KH ${r.ten_khach_hang || ''}`.trim(),
    khach_hang_id: r.khach_hang_id || null,
    ten_khach_hang: r.ten_khach_hang || '',
    nguoi_lien_he_id: r.nguoi_lien_he_id || null,
    ten_nguoi_lien_he: r.ten_nguoi_lien_he || null,
    so_dien_thoai: r.so_dien_thoai || null,
    nguoi_phu_trach_id: r.nguoi_phu_trach_id || (raw as any)?.nguoi_thuc_hien_id || '',
    nguoi_tham_gia_ids: Array.isArray(r.nguoi_tham_gia_ids) ? r.nguoi_tham_gia_ids : [],
    chi_nhanh_id: r.chi_nhanh_id || null,
    ngay: r.ngay || now.slice(0, 10),
    gio_bat_dau: r.gio_bat_dau || '09:00',
    gio_ket_thuc: r.gio_ket_thuc || '10:30',
    dia_diem: r.dia_diem || null,
    noi_dung: r.noi_dung || null,
    ket_qua: r.ket_qua || null,
    trang_thai: (r.trang_thai as TrangThaiLichGap) || 'sap_toi',
    nguon_lead_id: r.nguon_lead_id || null,
    du_an_id: r.du_an_id || null,
    nguoi_tao_id: r.nguoi_tao_id || '',
    ngay_tao: typeof r.ngay_tao === 'string' ? r.ngay_tao : now,
    ngay_cap_nhat: typeof r.ngay_cap_nhat === 'string' ? r.ngay_cap_nhat : now,
    da_xoa: Boolean(r.da_xoa)
  };
};

export const danhSachLichGapKH = async (
  dieuKien?: DieuKienLocLichGap
): Promise<LichGapKH[]> => {
  const local = docCacheLocal().filter((x) => !x.da_xoa);
  const map = new Map<string, LichGapKH>();
  local.forEach((x) => {
    if (x && x.id) map.set(x.id, x);
  });

  // 1. Luôn đọc từ collection chính 'lich_gap_kh'
  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), limit(GIOI_HAN_MAC_DINH));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const lich = chuyenDoiDocThanhLichGap(d.id, d.data());
      if (!lich.da_xoa) map.set(lich.id, lich);
    });
  } catch (err) {
    console.warn('[danhSachLichGapKH] Đọc lich_gap_kh:', err);
  }

  // 2. Đồng thời đọc từ collection fallback 'cong_viec' (nơi lưu các lịch công tác cũ)
  try {
    const qFallback = query(
      thamChieuCollection(COLLECTION_FALLBACK),
      where('loai_ban_ghi', '==', LOAI_BAN_GHI_LICH),
      limit(GIOI_HAN_MAC_DINH)
    );
    const snapFallback = await getDocs(qFallback);
    snapFallback.docs.forEach((d) => {
      const lich = chuyenDoiDocThanhLichGap(d.id, d.data());
      if (!lich.da_xoa) map.set(lich.id, lich);
    });
  } catch (err) {
    console.warn('[danhSachLichGapKH] Đọc cong_viec fallback:', err);
  }

  let dsGoc = Array.from(map.values()).sort((a, b) => {
    if (a.ngay !== b.ngay) return a.ngay.localeCompare(b.ngay);
    return a.gio_bat_dau.localeCompare(b.gio_bat_dau);
  });

  _cacheDanhSachLich = { data: dsGoc, time: Date.now() };
  ghiCacheLocal(dsGoc);

  let ketQua = [...dsGoc];

  if (dieuKien) {
    if (dieuKien.trang_thai && dieuKien.trang_thai !== 'tat_ca') {
      ketQua = ketQua.filter((x) => x.trang_thai === dieuKien.trang_thai);
    }
    if (dieuKien.nguoi_phu_trach_id && dieuKien.nguoi_phu_trach_id !== 'tat_ca') {
      const nptId = dieuKien.nguoi_phu_trach_id;
      ketQua = ketQua.filter(
        (x) =>
          x.nguoi_phu_trach_id === nptId ||
          x.nguoi_tao_id === nptId ||
          (Array.isArray(x.nguoi_tham_gia_ids) && x.nguoi_tham_gia_ids.includes(nptId))
      );
    }
    if (dieuKien.chi_nhanh_id && dieuKien.chi_nhanh_id !== 'tat_ca') {
      ketQua = ketQua.filter((x) => x.chi_nhanh_id === dieuKien.chi_nhanh_id);
    }
    if (dieuKien.tu_ngay) {
      ketQua = ketQua.filter((x) => x.ngay >= dieuKien.tu_ngay!);
    }
    if (dieuKien.den_ngay) {
      ketQua = ketQua.filter((x) => x.ngay <= dieuKien.den_ngay!);
    }
    if (dieuKien.tuKhoa?.trim()) {
      const kw = dieuKien.tuKhoa.trim().toLowerCase();
      ketQua = ketQua.filter(
        (x) =>
          x.ten_khach_hang.toLowerCase().includes(kw) ||
          x.tieu_de.toLowerCase().includes(kw) ||
          (x.ten_nguoi_lien_he && x.ten_nguoi_lien_he.toLowerCase().includes(kw)) ||
          (x.dia_diem && x.dia_diem.toLowerCase().includes(kw)) ||
          (x.noi_dung && x.noi_dung.toLowerCase().includes(kw))
      );
    }
  }

  return ketQua;
};

export const langNgheLichGapKH = (
  callback: (danhSach: LichGapKH[]) => void
): (() => void) => {
  // 1. Phục vụ ngay từ cache / fetch đầu tiên
  danhSachLichGapKH()
    .then((ds) => callback(ds))
    .catch(() => {
      const local = docCacheLocal().filter((x) => !x.da_xoa);
      callback(local);
    });

  // 2. Lắng nghe real-time qua onSnapshot trên Firestore
  let unsubFirestore = () => {};
  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), limit(GIOI_HAN_MAC_DINH));
    unsubFirestore = onSnapshot(
      q,
      (snap) => {
        const tuRemote: LichGapKH[] = [];
        snap.forEach((d) => {
          const l = chuyenDoiDocThanhLichGap(d.id, d.data());
          if (!l.da_xoa) tuRemote.push(l);
        });
        const currentLocal = docCacheLocal().filter((x) => !x.da_xoa);
        const map = new Map<string, LichGapKH>();
        currentLocal.forEach((x) => map.set(x.id, x));
        tuRemote.forEach((x) => map.set(x.id, x));
        const merged = Array.from(map.values()).sort((a, b) => {
          if (a.ngay !== b.ngay) return a.ngay.localeCompare(b.ngay);
          return a.gio_bat_dau.localeCompare(b.gio_bat_dau);
        });
        ghiCacheLocal(merged);
        _cacheDanhSachLich = { data: merged, time: Date.now() };
        callback(merged);
      },
      (err) => {
        console.warn('[langNgheLichGapKH] Lỗi onSnapshot Firestore:', err);
      }
    );
  } catch (err) {
    console.warn('[langNgheLichGapKH] Không thể khởi tạo onSnapshot:', err);
  }

  // 3. Lắng nghe event cục bộ cùng tab (phản hồi tức thì 0ms)
  const handleCustomEvent = (ev: Event) => {
    const custom = ev as CustomEvent<LichGapKH | undefined>;
    const updated = custom.detail;
    const current = docCacheLocal();
    let next: LichGapKH[];
    if (updated && updated.id) {
      next = current.some((x) => x.id === updated.id)
        ? current.map((x) => (x.id === updated.id ? updated : x))
        : [updated, ...current];
    } else {
      next = current;
    }
    const valid = next.filter((x) => !x.da_xoa).sort((a, b) => {
      if (a.ngay !== b.ngay) return a.ngay.localeCompare(b.ngay);
      return a.gio_bat_dau.localeCompare(b.gio_bat_dau);
    });
    ghiCacheLocal(valid);
    _cacheDanhSachLich = { data: valid, time: Date.now() };
    callback(valid);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('ebms_cap_nhat_lich_gap', handleCustomEvent);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('ebms_cap_nhat_lich_gap', handleCustomEvent);
    }
  };
};

export const taoLichGapKHMoi = async (dto: TaoMoiLichGapDTO): Promise<LichGapKH> => {
  const now = new Date().toISOString();
  const payload = {
    ...dto,
    tieu_de: dto.tieu_de?.trim() || `Gặp KH ${dto.ten_khach_hang}`,
    loai_ban_ghi: LOAI_BAN_GHI_LICH,
    nguoi_thuc_hien_id: dto.nguoi_phu_trach_id || dto.nguoi_tao_id,
    ngay_tao: now,
    ngay_cap_nhat: now,
    da_xoa: false
  };

  let docId = `lich_${Date.now()}`;
  let daLuuCloud = false;

  if (!_suDungFallbackCongViec) {
    try {
      const docRef = await addDoc(thamChieuCollection(TEN_COLLECTION), payload);
      docId = docRef.id;
      daLuuCloud = true;
    } catch {
      _suDungFallbackCongViec = true;
    }
  }

  if (!daLuuCloud) {
    try {
      const docRef = await addDoc(thamChieuCollection(COLLECTION_FALLBACK), payload);
      docId = docRef.id;
      daLuuCloud = true;
    } catch {
      // Fallback local cache
    }
  }

  const banGhiMoi = chuyenDoiDocThanhLichGap(docId, payload);
  const dsHienTai = [...docCacheLocal().filter((x) => x.id !== docId), banGhiMoi];
  ghiCacheLocal(dsHienTai);
  xoaCacheLichGapKH();
  phatSuKienCapNhat(banGhiMoi);

  await ghiNhatKyHoatDong(
    dto.nguoi_tao_id,
    'lich_gap_kh',
    'tao_moi',
    docId,
    `Đăng ký lịch gặp KH "${dto.ten_khach_hang}" vào ${dto.gio_bat_dau} ngày ${dto.ngay}`
  );

  if (dto.khach_hang_id) {
    void ghiNhatKyHoatDong(
      dto.nguoi_tao_id,
      'khach_hang',
      'cap_nhat',
      dto.khach_hang_id,
      `Đặt lịch hẹn gặp vào ${dto.gio_bat_dau} ngày ${dto.ngay}${dto.dia_diem ? ` tại ${dto.dia_diem}` : ''}`
    );
  }

  return banGhiMoi;
};

export const capNhatLichGapKH = async (
  id: string,
  dto: CapNhatLichGapDTO,
  nguoiCapNhatId?: string
): Promise<void> => {
  const now = new Date().toISOString();
  const patch: Record<string, any> = {
    ...dto,
    ngay_cap_nhat: now
  };
  if (dto.nguoi_phu_trach_id) {
    patch.nguoi_thuc_hien_id = dto.nguoi_phu_trach_id;
  }

  let daCapNhat = false;
  if (!_suDungFallbackCongViec) {
    try {
      await setDoc(thamChieuBanGhi(TEN_COLLECTION, id), patch, { merge: true });
      daCapNhat = true;
    } catch {
      _suDungFallbackCongViec = true;
    }
  }

  if (!daCapNhat) {
    try {
      await setDoc(thamChieuBanGhi(COLLECTION_FALLBACK, id), patch, { merge: true });
    } catch {
      // Fallback local cache
    }
  }

  const dsLocal = docCacheLocal().map((x) => (x.id === id ? { ...x, ...patch } : x));
  ghiCacheLocal(dsLocal);
  xoaCacheLichGapKH();
  const banGhiCapNhat = dsLocal.find((x) => x.id === id);
  if (banGhiCapNhat) phatSuKienCapNhat(banGhiCapNhat);

  if (nguoiCapNhatId) {
    await ghiNhatKyHoatDong(
      nguoiCapNhatId,
      'lich_gap_kh',
      'cap_nhat',
      id,
      `Cập nhật lịch gặp KH ${dto.ten_khach_hang || ''}`.trim()
    );

    const khId = dto.khach_hang_id || dsLocal.find((x) => x.id === id)?.khach_hang_id;
    if (khId && (dto.ket_qua || dto.trang_thai)) {
      const noiDungKQ = dto.ket_qua
        ? `Kết quả lịch hẹn: ${dto.ket_qua}`
        : dto.trang_thai === 'da_hoan_thanh'
        ? 'Hoàn thành lịch gặp'
        : `Cập nhật trạng thái lịch hẹn: ${dto.trang_thai}`;
      void ghiNhatKyHoatDong(
        nguoiCapNhatId,
        'khach_hang',
        'cap_nhat',
        khId,
        noiDungKQ
      );
    }
  }
};

export const doiTrangThaiLichGapKH = async (
  id: string,
  trang_thai: TrangThaiLichGap,
  ket_qua?: string | null
): Promise<void> => {
  const payload: Record<string, any> = { trang_thai };
  if (ket_qua !== undefined) payload.ket_qua = ket_qua;
  await capNhatLichGapKH(id, payload);
};

export const xoaLichGapKH = async (id: string, nguoiXoaId?: string): Promise<void> => {
  const patch = {
    da_xoa: true,
    ngay_cap_nhat: new Date().toISOString()
  };

  let daXoaCloud = false;
  if (!_suDungFallbackCongViec) {
    try {
      await setDoc(thamChieuBanGhi(TEN_COLLECTION, id), patch, { merge: true });
      daXoaCloud = true;
    } catch {
      _suDungFallbackCongViec = true;
    }
  }

  if (!daXoaCloud) {
    try {
      await setDoc(thamChieuBanGhi(COLLECTION_FALLBACK, id), patch, { merge: true });
    } catch {
      // Fallback local cache
    }
  }

  const dsLocal = docCacheLocal().filter((x) => x.id !== id);
  ghiCacheLocal(dsLocal);
  xoaCacheLichGapKH();
  phatSuKienCapNhat({ id, da_xoa: true } as any);

  if (nguoiXoaId) {
    await ghiNhatKyHoatDong(nguoiXoaId, 'lich_gap_kh', 'xoa', id, 'Xóa lịch gặp khách hàng');
  }
};

// Kiểm tra trùng khung giờ trong cùng ngày
const doiGioSangPhut = (hhmm: string): number => {
  const [h, m] = (hhmm || '00:00').split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
};

export interface KetQuaTrungLich {
  trungCaNhan: LichGapKH[];
  trungChiNhanh: LichGapKH[];
}

export const kiemTraTrungLich = (
  danhSachLich: LichGapKH[],
  ngay: string,
  gioBatDau: string,
  gioKetThuc: string,
  nguoiPhuTrachId?: string | null,
  chiNhanhId?: string | null,
  boQuaId?: string | null
): KetQuaTrungLich => {
  const batDau = doiGioSangPhut(gioBatDau);
  const ketThuc = Math.max(batDau + 30, doiGioSangPhut(gioKetThuc));

  const lichCungNgay = danhSachLich.filter(
    (x) =>
      !x.da_xoa &&
      x.trang_thai !== 'huy' &&
      x.ngay === ngay &&
      (!boQuaId || x.id !== boQuaId)
  );

  const trungCaNhan: LichGapKH[] = [];
  const trungChiNhanh: LichGapKH[] = [];

  for (const lich of lichCungNgay) {
    const lBatDau = doiGioSangPhut(lich.gio_bat_dau);
    const lKetThuc = Math.max(lBatDau + 30, doiGioSangPhut(lich.gio_ket_thuc));

    const coGiaoNhau = batDau < lKetThuc && ketThuc > lBatDau;
    if (!coGiaoNhau) continue;

    if (
      nguoiPhuTrachId &&
      (lich.nguoi_phu_trach_id === nguoiPhuTrachId ||
        (lich.nguoi_tham_gia_ids && lich.nguoi_tham_gia_ids.includes(nguoiPhuTrachId)))
    ) {
      trungCaNhan.push(lich);
    } else if (!chiNhanhId || !lich.chi_nhanh_id || lich.chi_nhanh_id === chiNhanhId) {
      trungChiNhanh.push(lich);
    }
  }

  return { trungCaNhan, trungChiNhanh };
};
