'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  type QueryConstraint,
  type DocumentData,
  onSnapshot
} from 'firebase/firestore';
import type { Lead, TrangThaiLead, NguonLead } from '../../thu_vien/types/lead';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'leads' as const;
const GIOI_HAN_MAC_DINH = 200;

export interface DieuKienLocLead {
  tuKhoa?: string | null;
  trang_thai?: TrangThaiLead | 'tat_ca' | null;
  nguon?: NguonLead | 'tat_ca' | null;
  nguoi_phu_trach_id?: string | null;
  chi_nhanh_id?: string | null;
  khach_hang_id?: string | null;
}

export type TaoMoiLeadDTO = Omit<Lead, 'id' | 'ngay_tao' | 'ngay_cap_nhat' | 'da_xoa'>;
export type CapNhatLeadDTO = Partial<TaoMoiLeadDTO>;

let _cacheDanhSachLead: { data: Lead[]; time: number; key: string } | null = null;
const CACHE_TTL_MS = 30_000;

const chuyenDoiDocThanhLead = (id: string, raw: DocumentData | undefined | null): Lead => {
  const r = (raw ?? {}) as Partial<Lead>;
  const now = new Date().toISOString();
  return {
    id,
    khach_hang_id: r.khach_hang_id || '',
    nguoi_lien_he_id: r.nguoi_lien_he_id || null,
    ten_khach_hang: r.ten_khach_hang || '',
    ten_nguoi_lien_he: r.ten_nguoi_lien_he || null,
    so_dien_thoai: r.so_dien_thoai || null,
    email: r.email || null,
    nguon: r.nguon || 'khac',
    trang_thai: (r.trang_thai as TrangThaiLead) || 'moi_tiep_can',
    ngay_hen_lai: r.ngay_hen_lai || null,
    ghi_chu: r.ghi_chu || null,
    ly_do_that_bai: r.ly_do_that_bai || null,
    du_an_id: r.du_an_id || null,
    ten_du_an: r.ten_du_an || null,
    nguoi_phu_trach_id: r.nguoi_phu_trach_id || '',
    chi_nhanh_id: r.chi_nhanh_id || null,
    nguoi_tao_id: r.nguoi_tao_id || '',
    ngay_tao: r.ngay_tao || now,
    ngay_cap_nhat: r.ngay_cap_nhat || now,
    da_xoa: Boolean(r.da_xoa)
  };
};

export async function danhSachLead(
  loc?: DieuKienLocLead,
  gioiHan: number = GIOI_HAN_MAC_DINH
): Promise<Lead[]> {
  const cacheKey = JSON.stringify(loc || {});
  const now = Date.now();
  if (
    _cacheDanhSachLead &&
    _cacheDanhSachLead.key === cacheKey &&
    now - _cacheDanhSachLead.time < CACHE_TTL_MS
  ) {
    return _cacheDanhSachLead.data;
  }

  const colRef = thamChieuCollection(TEN_COLLECTION);
  const dk: QueryConstraint[] = [];

  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    dk.push(where('trang_thai', '==', loc.trang_thai));
  }
  if (loc?.nguoi_phu_trach_id) {
    dk.push(where('nguoi_phu_trach_id', '==', loc.nguoi_phu_trach_id));
  }
  if (loc?.chi_nhanh_id) {
    dk.push(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
  }
  if (loc?.khach_hang_id) {
    dk.push(where('khach_hang_id', '==', loc.khach_hang_id));
  }

  dk.push(limit(gioiHan));
  const snap = await getDocs(query(colRef, ...dk));

  let kq = snap.docs
    .map(d => chuyenDoiDocThanhLead(d.id, d.data()))
    .filter(x => !x.da_xoa);

  if (loc?.nguon && loc.nguon !== 'tat_ca') {
    kq = kq.filter(x => x.nguon === loc.nguon);
  }

  if (loc?.tuKhoa && loc.tuKhoa.trim()) {
    const kw = loc.tuKhoa.trim().toLowerCase();
    kq = kq.filter(
      x =>
        x.ten_khach_hang.toLowerCase().includes(kw) ||
        (x.ten_nguoi_lien_he && x.ten_nguoi_lien_he.toLowerCase().includes(kw)) ||
        (x.so_dien_thoai && x.so_dien_thoai.includes(kw)) ||
        (x.ghi_chu && x.ghi_chu.toLowerCase().includes(kw))
    );
  }

  // Sắp xếp ngày tạo mới nhất lên đầu
  kq.sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime());

  _cacheDanhSachLead = { data: kq, time: now, key: cacheKey };
  return kq;
}

export function langNgheDanhSachLead(
  loc: DieuKienLocLead | undefined,
  khiCoDuLieu: (ds: Lead[]) => void,
  khiCoLoi?: (loi: Error) => void
) {
  const colRef = thamChieuCollection(TEN_COLLECTION);
  const dk: QueryConstraint[] = [];

  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    dk.push(where('trang_thai', '==', loc.trang_thai));
  }
  if (loc?.nguoi_phu_trach_id) {
    dk.push(where('nguoi_phu_trach_id', '==', loc.nguoi_phu_trach_id));
  }

  dk.push(limit(GIOI_HAN_MAC_DINH));
  const q = query(colRef, ...dk);

  return onSnapshot(
    q,
    snap => {
      let kq = snap.docs
        .map(d => chuyenDoiDocThanhLead(d.id, d.data()))
        .filter(x => !x.da_xoa);

      if (loc?.nguon && loc.nguon !== 'tat_ca') {
        kq = kq.filter(x => x.nguon === loc.nguon);
      }
      if (loc?.tuKhoa && loc.tuKhoa.trim()) {
        const kw = loc.tuKhoa.trim().toLowerCase();
        kq = kq.filter(
          x =>
            x.ten_khach_hang.toLowerCase().includes(kw) ||
            (x.ten_nguoi_lien_he && x.ten_nguoi_lien_he.toLowerCase().includes(kw)) ||
            (x.so_dien_thoai && x.so_dien_thoai.includes(kw))
        );
      }
      kq.sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime());
      khiCoDuLieu(kq);
    },
    loi => {
      if (khiCoLoi) khiCoLoi(loi);
    }
  );
}

export async function taoLeadMoi(dto: TaoMoiLeadDTO): Promise<Lead> {
  const now = new Date().toISOString();
  const banGhi = {
    ...dto,
    da_xoa: false,
    ngay_tao: now,
    ngay_cap_nhat: now
  };

  const colRef = thamChieuCollection(TEN_COLLECTION);
  const docRef = await addDoc(colRef, banGhi);

  await ghiNhatKyHoatDong(
    dto.nguoi_tao_id,
    'khach_hang',
    'tao',
    docRef.id,
    `Tạo Lead mới: ${dto.ten_khach_hang}`
  ).catch(() => {});

  _cacheDanhSachLead = null;
  return { id: docRef.id, ...banGhi };
}

export async function capNhatLead(id: string, dto: CapNhatLeadDTO): Promise<void> {
  const docRef = thamChieuBanGhi(TEN_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...dto, ngay_cap_nhat: now }, { merge: true });

  await ghiNhatKyHoatDong(
    dto.nguoi_phu_trach_id || null,
    'khach_hang',
    'cap_nhat',
    id,
    `Cập nhật Lead ${id}`
  ).catch(() => {});

  _cacheDanhSachLead = null;
}

export async function doiTrangThaiLead(id: string, trang_thai: TrangThaiLead): Promise<void> {
  await capNhatLead(id, { trang_thai });
}

export async function xoaLead(id: string): Promise<void> {
  await capNhatLead(id, { da_xoa: true } as any);
}
