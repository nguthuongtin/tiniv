'use client';

import {
  addDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
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
const LOCAL_STORAGE_KEY = 'ebms_lich_gap_kh_cache_v1';
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
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const ghiCacheLocal = (ds: LichGapKH[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ds));
  } catch {
    // ignore
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
  const now = Date.now();
  let dsGoc: LichGapKH[] = [];

  if (_cacheDanhSachLich && now - _cacheDanhSachLich.time < CACHE_TTL_MS) {
    dsGoc = _cacheDanhSachLich.data;
  } else {
    let thanhCong = false;

    if (!_suDungFallbackCongViec) {
      try {
        const q = query(thamChieuCollection(TEN_COLLECTION), limit(GIOI_HAN_MAC_DINH));
        const snap = await getDocs(q);
        dsGoc = snap.docs
          .map((d) => chuyenDoiDocThanhLichGap(d.id, d.data()))
          .filter((x) => !x.da_xoa);
        thanhCong = true;
      } catch {
        _suDungFallbackCongViec = true;
      }
    }

    if (!thanhCong) {
      try {
        const qFallback = query(
          thamChieuCollection(COLLECTION_FALLBACK),
          where('loai_ban_ghi', '==', LOAI_BAN_GHI_LICH),
          limit(GIOI_HAN_MAC_DINH)
        );
        const snap = await getDocs(qFallback);
        dsGoc = snap.docs
          .map((d) => chuyenDoiDocThanhLichGap(d.id, d.data()))
          .filter((x) => !x.da_xoa);
        thanhCong = true;
      } catch {
        dsGoc = docCacheLocal().filter((x) => !x.da_xoa);
      }
    }

    // Sắp xếp theo ngày tăng dần, giờ bắt đầu tăng dần
    dsGoc.sort((a, b) => {
      if (a.ngay !== b.ngay) return a.ngay.localeCompare(b.ngay);
      return a.gio_bat_dau.localeCompare(b.gio_bat_dau);
    });

    _cacheDanhSachLich = { data: dsGoc, time: now };
    ghiCacheLocal(dsGoc);
  }

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
          (x.nguoi_tham_gia_ids && x.nguoi_tham_gia_ids.includes(nptId))
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
  let active = true;
  danhSachLichGapKH()
    .then((ds) => {
      if (active) callback(ds);
    })
    .catch(() => {
      if (active) callback([]);
    });

  return () => {
    active = false;
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

  await ghiNhatKyHoatDong(
    dto.nguoi_tao_id,
    'lich_gap_kh',
    'tao_moi',
    docId,
    `Đăng ký lịch gặp KH "${dto.ten_khach_hang}" vào ${dto.gio_bat_dau} ngày ${dto.ngay}`
  );

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

  if (nguoiCapNhatId) {
    await ghiNhatKyHoatDong(
      nguoiCapNhatId,
      'lich_gap_kh',
      'cap_nhat',
      id,
      `Cập nhật lịch gặp KH ${dto.ten_khach_hang || ''}`.trim()
    );
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
