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
import type {
  TaiLieuLienKet,
  TaoTaiLieuDTO,
  CapNhatTaiLieuDTO,
  PhamViTaiLieu,
  LoaiLienKet
} from '../../thu_vien/types/kho_tai_lieu';
import type { NhanSu, NguoiDungDangNhap } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong,
  firebaseAuth
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'kho_tai_lieu' as const;
const GIOI_HAN_MAC_DINH = 300;

export interface DieuKienLocTaiLieu {
  tuKhoa?: string | null;
  pham_vi?: 'tat_ca' | PhamViTaiLieu | null;
  danh_muc?: string | 'tat_ca' | null;
  loai_lien_ket?: string | 'tat_ca' | null;
  nguoi_dung_id?: string | null;
  trang_thai?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  chi_lay_cua_toi?: boolean;
}

type RawBanGhiTL = Omit<TaiLieuLienKet, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiTL | undefined | null
): TaiLieuLienKet => {
  const r = (raw ?? {}) as Partial<RawBanGhiTL>;
  const today = new Date().toISOString();
  return {
    id,
    tieu_de: (r.tieu_de as string) ?? '(Chưa đặt tên)',
    url: (r.url as string) ?? '',
    mo_ta: (r.mo_ta as string | null) ?? null,
    pham_vi: (r.pham_vi as PhamViTaiLieu) ?? 'chung',
    danh_muc: (r.danh_muc as string | null) ?? null,
    loai_lien_ket: (r.loai_lien_ket as LoaiLienKet) ?? 'trang_web',
    the_tags: Array.isArray(r.the_tags) ? r.the_tags : [],
    anh_thu_nho: (r.anh_thu_nho as string | null) ?? null,
    nguoi_tao_id: (r.nguoi_tao_id as string) ?? '',
    ten_nguoi_tao: (r.ten_nguoi_tao as string | null) ?? null,
    chuc_vu_nguoi_tao: (r.chuc_vu_nguoi_tao as string | null) ?? null,
    url_anh_nguoi_tao: (r.url_anh_nguoi_tao as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai: (r.trang_thai as TaiLieuLienKet['trang_thai']) ?? 'hoat_dong',
    ghim: Boolean(r.ghim),
    luot_mo: Number(r.luot_mo) || 0
  };
};

const sapXepVaLocThem = (
  mang: TaiLieuLienKet[],
  loc?: DieuKienLocTaiLieu
): TaiLieuLienKet[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';

  return mang.filter((tl) => {
    // 1. Lọc trạng thái xóa mềm (mặc định ẩn đã xóa)
    if (loc?.trang_thai === 'da_xoa') {
      if (tl.trang_thai !== 'da_xoa') return false;
    } else if (loc?.trang_thai === 'hoat_dong' || !loc?.trang_thai) {
      if (tl.trang_thai === 'da_xoa') return false;
    }

    // 2. Lọc phạm vi
    // Kho riêng: chỉ người tạo mới thấy tài liệu có pham_vi === 'rieng'
    if (tl.pham_vi === 'rieng') {
      if (loc?.nguoi_dung_id && tl.nguoi_tao_id !== loc.nguoi_dung_id) {
        return false;
      }
    }

    if (loc?.pham_vi && loc.pham_vi !== 'tat_ca') {
      if (tl.pham_vi !== loc.pham_vi) return false;
    }

    // 3. Lọc theo danh mục
    if (loc?.danh_muc && loc.danh_muc !== 'tat_ca') {
      if (tl.danh_muc !== loc.danh_muc) return false;
    }

    // 4. Lọc theo loại liên kết
    if (loc?.loai_lien_ket && loc.loai_lien_ket !== 'tat_ca') {
      if (tl.loai_lien_ket !== loc.loai_lien_ket) return false;
    }

    // 5. Tìm kiếm tức thời theo từ khóa
    if (tuKhoaLower) {
      const tagStr = (tl.the_tags ?? []).join(' ').toLowerCase();
      const khop =
        tl.tieu_de.toLowerCase().includes(tuKhoaLower) ||
        (tl.mo_ta ?? '').toLowerCase().includes(tuKhoaLower) ||
        tl.url.toLowerCase().includes(tuKhoaLower) ||
        (tl.danh_muc ?? '').toLowerCase().includes(tuKhoaLower) ||
        (tl.ten_nguoi_tao ?? '').toLowerCase().includes(tuKhoaLower) ||
        tagStr.includes(tuKhoaLower);
      if (!khop) return false;
    }

    return true;
  });
};

export const danhSachTaiLieu = async (
  loc?: DieuKienLocTaiLieu
): Promise<{ mang: TaiLieuLienKet[]; tong_so: number }> => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];

  if (loc?.trang_thai === 'da_xoa') {
    mangRangBuoc.unshift(where('trang_thai', '==', 'da_xoa'));
  }

  if (loc?.chi_lay_cua_toi && loc?.nguoi_dung_id) {
    mangRangBuoc.unshift(where('nguoi_tao_id', '==', loc.nguoi_dung_id));
  } else if (loc?.pham_vi === 'chung') {
    mangRangBuoc.unshift(where('pham_vi', '==', 'chung'));
  } else if (loc?.pham_vi === 'rieng' && loc?.nguoi_dung_id) {
    mangRangBuoc.unshift(where('nguoi_tao_id', '==', loc.nguoi_dung_id));
  }

  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
    const snapshot = await getDocs(q);
    const resultsRaw: TaiLieuLienKet[] = [];
    for (const d of snapshot.docs) {
      resultsRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    }

    // Sắp xếp: Ghim lên đầu, sau đó ngày cập nhật mới nhất
    resultsRaw.sort((a, b) => {
      if (a.ghim && !b.ghim) return -1;
      if (!a.ghim && b.ghim) return 1;
      return (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? '');
    });

    const daLoc = sapXepVaLocThem(resultsRaw, loc);
    return { mang: daLoc, tong_so: daLoc.length };
  } catch (err) {
    console.warn('[dich_vu_kho_tai_lieu] danhSachTaiLieu catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const langNgheThayDoiDanhSachTaiLieu = (
  callback: (mang: TaiLieuLienKet[]) => void,
  loc?: DieuKienLocTaiLieu,
  onError?: (err: any) => void
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];

  if (loc?.trang_thai === 'da_xoa') {
    mangRangBuoc.unshift(where('trang_thai', '==', 'da_xoa'));
  }

  if (loc?.chi_lay_cua_toi && loc?.nguoi_dung_id) {
    mangRangBuoc.unshift(where('nguoi_tao_id', '==', loc.nguoi_dung_id));
  } else if (loc?.pham_vi === 'chung') {
    mangRangBuoc.unshift(where('pham_vi', '==', 'chung'));
  } else if (loc?.pham_vi === 'rieng' && loc?.nguoi_dung_id) {
    mangRangBuoc.unshift(where('nguoi_tao_id', '==', loc.nguoi_dung_id));
  }

  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(
    q,
    (snap) => {
      const mangRaw: TaiLieuLienKet[] = [];
      snap.forEach((d) => {
        mangRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
      });

      mangRaw.sort((a, b) => {
        if (a.ghim && !b.ghim) return -1;
        if (!a.ghim && b.ghim) return 1;
        return (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? '');
      });

      callback(sapXepVaLocThem(mangRaw, loc));
    },
    (err) => {
      console.warn('[dich_vu_kho_tai_lieu] onSnapshot error:', err);
      if (onError) onError(err);
    }
  );

  return unsub;
};

export const taoTaiLieuMoi = async (
  dto: TaoTaiLieuDTO,
  nguoiThucHien: NhanSu | NguoiDungDangNhap | null | undefined
): Promise<TaiLieuLienKet> => {
  const uid = nguoiThucHien?.id || firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('Vui lòng đăng nhập để thực hiện thao tác này.');
  }

  const now = new Date().toISOString();
  const chucVu =
    nguoiThucHien && 'chuc_vu' in nguoiThucHien
      ? (nguoiThucHien as NhanSu).chuc_vu
      : null;

  const duLieuRaw: RawBanGhiTL = {
    tieu_de: dto.tieu_de.trim(),
    url: dto.url.trim(),
    mo_ta: dto.mo_ta?.trim() || null,
    pham_vi: dto.pham_vi || 'chung',
    danh_muc: dto.danh_muc?.trim() || 'Khác',
    loai_lien_ket: dto.loai_lien_ket || 'trang_web',
    the_tags: Array.isArray(dto.the_tags) ? dto.the_tags : [],
    anh_thu_nho: dto.anh_thu_nho?.trim() || null,
    nguoi_tao_id: uid,
    ten_nguoi_tao: nguoiThucHien?.ho_va_ten || 'Thành viên',
    chuc_vu_nguoi_tao: chucVu || null,
    url_anh_nguoi_tao: nguoiThucHien?.url_anh_dai_dien || null,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai: 'hoat_dong',
    ghim: Boolean(dto.ghim),
    luot_mo: 0
  };

  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);

  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'kho_tai_lieu',
    'tao_moi',
    moi.id,
    `Thêm tài liệu liên kết "${moi.tieu_de}" (${moi.pham_vi === 'chung' ? 'Kho chung' : 'Kho riêng'})`
  );

  return moi;
};

export const capNhatTaiLieu = async (
  dto: CapNhatTaiLieuDTO,
  nguoiThucHien: NhanSu | NguoiDungDangNhap | null | undefined
): Promise<TaiLieuLienKet> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id));
  if (!snap.exists()) throw new Error(`Không tìm thấy tài liệu ID = ${dto.id}`);

  const hienTai = chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
  const now = new Date().toISOString();

  const patchRaw: Partial<RawBanGhiTL> = {
    ngay_cap_nhat: now
  };

  if (dto.tieu_de !== undefined) patchRaw.tieu_de = dto.tieu_de.trim();
  if (dto.url !== undefined) patchRaw.url = dto.url.trim();
  if (dto.mo_ta !== undefined) patchRaw.mo_ta = dto.mo_ta?.trim() || null;
  if (dto.pham_vi !== undefined) patchRaw.pham_vi = dto.pham_vi;
  if (dto.danh_muc !== undefined) patchRaw.danh_muc = dto.danh_muc?.trim() || null;
  if (dto.loai_lien_ket !== undefined) patchRaw.loai_lien_ket = dto.loai_lien_ket;
  if (dto.the_tags !== undefined) patchRaw.the_tags = dto.the_tags;
  if (dto.anh_thu_nho !== undefined) patchRaw.anh_thu_nho = dto.anh_thu_nho?.trim() || null;
  if (dto.ghim !== undefined) patchRaw.ghim = Boolean(dto.ghim);

  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as TaiLieuLienKet;

  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'kho_tai_lieu',
    'cap_nhat',
    moi.id,
    `Cập nhật tài liệu "${moi.tieu_de}"`
  );

  return moi;
};

export const xoaMemTaiLieu = async (
  id: string,
  nguoiThucHien: NhanSu | NguoiDungDangNhap | null | undefined
): Promise<void> => {
  const now = new Date().toISOString();
  await setDoc(
    thamChieuBanGhi(TEN_COLLECTION, id),
    { trang_thai: 'da_xoa', ngay_cap_nhat: now } as any,
    { merge: true }
  );

  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'kho_tai_lieu',
    'xoa_mem',
    id,
    'Chuyển tài liệu vào thùng rác'
  );
};

export const khoiPhucTaiLieu = async (
  id: string,
  nguoiThucHien: NhanSu | NguoiDungDangNhap | null | undefined
): Promise<void> => {
  const now = new Date().toISOString();
  await setDoc(
    thamChieuBanGhi(TEN_COLLECTION, id),
    { trang_thai: 'hoat_dong', ngay_cap_nhat: now } as any,
    { merge: true }
  );

  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'kho_tai_lieu',
    'khoi_phuc',
    id,
    'Khôi phục tài liệu từ thùng rác'
  );
};

export const tangLuotMoTaiLieu = async (id: string): Promise<void> => {
  try {
    const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
    if (snap.exists()) {
      const luotHienTai = Number(snap.data()?.luot_mo) || 0;
      await setDoc(
        thamChieuBanGhi(TEN_COLLECTION, id),
        { luot_mo: luotHienTai + 1 } as any,
        { merge: true }
      );
    }
  } catch {
    // Non-critical increment
  }
};
