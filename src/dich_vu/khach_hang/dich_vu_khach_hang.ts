'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  type QueryConstraint,
  type DocumentData,
  onSnapshot
} from 'firebase/firestore';
import type { KhachHang, LoaiKhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'khach_hang' as const;
const GIOI_HAN_MAC_DINH = 50;

export interface DieuKienLocKhachHang {
  tuKhoa?: string | null;
  loai_khach_hang?: LoaiKhachHang | 'tat_ca' | null;
  chi_nhanh_id?: string | null;
  nguoi_phu_trach_id?: string | null;
  trang_thai?: 'tat_ca' | 'hoat_dong' | 'tam_dung' | 'da_xoa' | null;
  ngay_tao_tu_ngay?: string | null;
  ngay_tao_den_ngay?: string | null;
}

type RawBanGhiKH = Omit<KhachHang, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiKH | undefined | null
): KhachHang => {
  const r = (raw ?? {}) as Partial<RawBanGhiKH>;
  const today = new Date().toISOString();
  return {
    id,
    ten_khach_hang: (r.ten_khach_hang as string) ?? '(Chua dat ten)',
    loai_khach_hang: (r.loai_khach_hang as LoaiKhachHang) ?? 'khac',
    ma_so_thue: (r.ma_so_thue as string | null) ?? null,
    so_dien_thoai: (r.so_dien_thoai as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    dia_chi: (r.dia_chi as string | null) ?? null,
    website: (r.website as string | null) ?? null,
    tinh_thanh: (r.tinh_thanh as string | null) ?? null,
    xa_phuong: (r.xa_phuong as string | null) ?? null,
    chi_nhanh_id: (r.chi_nhanh_id as string | null) ?? null,
    nguoi_phu_trach_id: (r.nguoi_phu_trach_id as string | null) ?? null,
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    nguoi_tao_id: (r.nguoi_tao_id as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai: (r.trang_thai as KhachHang['trang_thai']) ?? 'hoat_dong'
  };
};

export const danhSachKhachHang = async (
  loc?: DieuKienLocKhachHang
): Promise<{ mang: KhachHang[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [
    limit(GIOI_HAN_MAC_DINH)
  ];
  if (loc?.loai_khach_hang && loc.loai_khach_hang !== 'tat_ca') {
    mangRangBuoc.unshift(where('loai_khach_hang', '==', loc.loai_khach_hang));
  }
  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai', '==', loc.trang_thai));
  }
  if (loc?.nguoi_phu_trach_id) {
    mangRangBuoc.unshift(where('nguoi_phu_trach_id', '==', loc.nguoi_phu_trach_id));
  }
  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
    const snapshot = await getDocs(q);
    const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
    const results: KhachHang[] = [];
    for (const d of snapshot.docs) {
      const kh = chuyenDoiDocThanhDoiTuong(d.id, d.data());
      if (tuKhoaLower) {
        const khop =
          kh.ten_khach_hang.toLowerCase().includes(tuKhoaLower) ||
          (kh.ma_so_thue ?? '').toLowerCase().includes(tuKhoaLower) ||
          (kh.so_dien_thoai ?? '').includes(tuKhoaLower) ||
          (kh.email ?? '').toLowerCase().includes(tuKhoaLower) ||
          (kh.dia_chi ?? '').toLowerCase().includes(tuKhoaLower);
        if (!khop) continue;
      }
      if (loc?.chi_nhanh_id && loc.chi_nhanh_id !== 'tat_ca' && kh.chi_nhanh_id !== loc.chi_nhanh_id) continue;
      if (loc?.ngay_tao_tu_ngay && kh.ngay_tao < loc.ngay_tao_tu_ngay) continue;
      if (loc?.ngay_tao_den_ngay && kh.ngay_tao > loc.ngay_tao_den_ngay + 'T23:59:59.999Z') continue;
      results.push(kh);
    }
    results.sort((a, b) => (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? ''));
    return { mang: results, tong_so: snapshot.size };
  } catch (err) {
    console.warn('[dich_vu_khach_hang] danhSachKhachHang catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietKhachHang = async (id: string): Promise<KhachHang | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export const kiemTraTrungKhachHang = async (thamSo: {
  ma_so_thue?: string | null;
  so_dien_thoai?: string | null;
  id_bo_qua?: string | null;
}): Promise<{ trung_mst?: KhachHang; trung_sdt?: KhachHang } | null> => {
  const mstClean = thamSo.ma_so_thue?.trim();
  const sdtClean = thamSo.so_dien_thoai?.trim();
  if (!mstClean && !sdtClean) return null;

  let trungMst: KhachHang | undefined;
  let trungSdt: KhachHang | undefined;

  if (mstClean) {
    const qMst = query(
      thamChieuCollection(TEN_COLLECTION),
      where('ma_so_thue', '==', mstClean),
      limit(5)
    );
    const snapMst = await getDocs(qMst);
    for (const d of snapMst.docs) {
      if (d.id === thamSo.id_bo_qua) continue;
      const kh = chuyenDoiDocThanhDoiTuong(d.id, d.data());
      if (kh.trang_thai !== 'da_xoa') {
        trungMst = kh;
        break;
      }
    }
  }

  if (sdtClean) {
    const qSdt = query(
      thamChieuCollection(TEN_COLLECTION),
      where('so_dien_thoai', '==', sdtClean),
      limit(5)
    );
    const snapSdt = await getDocs(qSdt);
    for (const d of snapSdt.docs) {
      if (d.id === thamSo.id_bo_qua) continue;
      const kh = chuyenDoiDocThanhDoiTuong(d.id, d.data());
      if (kh.trang_thai !== 'da_xoa') {
        trungSdt = kh;
        break;
      }
    }
  }

  if (trungMst || trungSdt) {
    return { trung_mst: trungMst, trung_sdt: trungSdt };
  }
  return null;
};

export interface TaoMoiKhachHangDTO {
  ten_khach_hang: string;
  loai_khach_hang: LoaiKhachHang | string;
  ma_so_thue?: string | null;
  so_dien_thoai?: string | null;
  email?: string | null;
  dia_chi?: string | null;
  website?: string | null;
  tinh_thanh?: string | null;
  xa_phuong?: string | null;
  chi_nhanh_id?: string | null;
  nguoi_phu_trach_id?: string | null;
  ghi_chu?: string | null;
  trang_thai?: 'hoat_dong' | 'tam_dung' | 'da_xoa';
}

export const taoKhachHangMoi = async (
  dto: TaoMoiKhachHangDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<KhachHang> => {
  if (!dto.ten_khach_hang || !dto.ten_khach_hang.trim()) {
    throw new Error('Tên khách hàng không được để trống.');
  }

  const trung = await kiemTraTrungKhachHang({
    ma_so_thue: dto.ma_so_thue,
    so_dien_thoai: dto.so_dien_thoai
  });
  if (trung?.trung_mst) {
    throw new Error(
      `Mã số thuế "${dto.ma_so_thue}" đã được đăng ký bởi khách hàng "${trung.trung_mst.ten_khach_hang}". Vui lòng kiểm tra lại để tránh chào trùng!`
    );
  }
  if (trung?.trung_sdt) {
    throw new Error(
      `Số điện thoại "${dto.so_dien_thoai}" đã được đăng ký bởi khách hàng "${trung.trung_sdt.ten_khach_hang}". Vui lòng kiểm tra lại để tránh chào trùng!`
    );
  }

  const now = new Date().toISOString();
  const duLieuRaw: RawBanGhiKH = {
    ten_khach_hang: dto.ten_khach_hang.trim(),
    loai_khach_hang: dto.loai_khach_hang ?? 'khac',
    ma_so_thue: dto.ma_so_thue?.trim() || null,
    so_dien_thoai: dto.so_dien_thoai?.trim() || null,
    email: dto.email?.trim() || null,
    dia_chi: dto.dia_chi?.trim() || null,
    website: dto.website?.trim() || null,
    tinh_thanh: dto.tinh_thanh?.trim() || null,
    xa_phuong: dto.xa_phuong?.trim() || null,
    chi_nhanh_id: dto.chi_nhanh_id ?? (nguoiThucHien as any)?.chi_nhanh_id ?? null,
    nguoi_phu_trach_id:
      dto.nguoi_phu_trach_id ?? (nguoiThucHien?.id ? nguoiThucHien.id : null),
    ghi_chu: dto.ghi_chu?.trim() || null,
    nguoi_tao_id: nguoiThucHien?.id ?? null,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai: dto.trang_thai ?? 'hoat_dong'
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'khach_hang',
    'tao_moi',
    moi.id,
    `Tạo khách hàng "${moi.ten_khach_hang}"`
  );
  return moi;
};

export interface CapNhatKhachHangDTO extends Partial<TaoMoiKhachHangDTO> {
  id: string;
}

export const capNhatKhachHang = async (
  dto: CapNhatKhachHangDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<KhachHang> => {
  const hienTai = await layChiTietKhachHang(dto.id);
  if (!hienTai) throw new Error(`Không tồn tại khách hàng id = ${dto.id}`);

  if (dto.ma_so_thue !== undefined || dto.so_dien_thoai !== undefined) {
    const trung = await kiemTraTrungKhachHang({
      ma_so_thue: dto.ma_so_thue !== undefined ? dto.ma_so_thue : hienTai.ma_so_thue,
      so_dien_thoai: dto.so_dien_thoai !== undefined ? dto.so_dien_thoai : hienTai.so_dien_thoai,
      id_bo_qua: dto.id
    });
    if (trung?.trung_mst && trung.trung_mst.id !== dto.id) {
      throw new Error(
        `Mã số thuế "${dto.ma_so_thue}" đã được đăng ký bởi khách hàng "${trung.trung_mst.ten_khach_hang}". Vui lòng kiểm tra lại!`
      );
    }
    if (trung?.trung_sdt && trung.trung_sdt.id !== dto.id) {
      throw new Error(
        `Số điện thoại "${dto.so_dien_thoai}" đã được đăng ký bởi khách hàng "${trung.trung_sdt.ten_khach_hang}". Vui lòng kiểm tra lại!`
      );
    }
  }

  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhiKH> = {};
  (Object.keys(dto) as (keyof CapNhatKhachHangDTO)[]).forEach((k) => {
    if (k === 'id') return;
    if (!Object.prototype.hasOwnProperty.call(dto, k)) return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    (patchRaw as unknown as Record<string, unknown>)[k] =
      typeof giaTriRaw === 'string' && k !== 'trang_thai' && k !== 'loai_khach_hang'
        ? giaTriRaw.trim() || null
        : giaTriRaw;
  });
  patchRaw.ngay_cap_nhat = now;
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as KhachHang;
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'khach_hang',
    'cap_nhat',
    moi.id,
    `Cập nhật khách hàng "${moi.ten_khach_hang}"`
  );
  return moi;
};

export const doiTrangThaiKhachHang = async (
  id: string,
  trang_thai_moi: KhachHang['trang_thai'],
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<KhachHang> => {
  return capNhatKhachHang({ id, trang_thai: trang_thai_moi }, nguoiThucHien);
};

export const xoaMemKhachHang = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<KhachHang> => {
  // Lỗ hổng 4: Kiểm tra xem khách hàng có dự án nào đang hoạt động không
  const qDuAn = query(
    thamChieuCollection('ho_so_du_an'),
    where('khach_hang_id', '==', id),
    where('trang_thai', '==', 'hoat_dong'),
    limit(10)
  );
  const snapDuAn = await getDocs(qDuAn);
  if (!snapDuAn.empty) {
    throw new Error(
      `Không thể xóa khách hàng này vì đang có ${snapDuAn.size} hồ sơ dự án đang hoạt động. Vui lòng chuyển hoặc hoàn thành/hủy các dự án trước!`
    );
  }
  return doiTrangThaiKhachHang(id, 'da_xoa', nguoiThucHien);
};

export const langNgheThayDoiDanhSachKhachHang = (
  callback: (mang: KhachHang[]) => void,
  loc?: DieuKienLocKhachHang
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [
    orderBy('ngay_cap_nhat', 'desc'),
    limit(GIOI_HAN_MAC_DINH)
  ];
  if (loc?.loai_khach_hang && loc.loai_khach_hang !== 'tat_ca') {
    mangRangBuoc.unshift(where('loai_khach_hang', '==', loc.loai_khach_hang));
  }
  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai', '==', loc.trang_thai));
  }
  if (loc?.nguoi_phu_trach_id) {
    mangRangBuoc.unshift(where('nguoi_phu_trach_id', '==', loc.nguoi_phu_trach_id));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    const mang: KhachHang[] = [];
    const tuKhoa = loc?.tuKhoa?.trim().toLowerCase() ?? '';
    snap.forEach((d) => {
      const kh = chuyenDoiDocThanhDoiTuong(d.id, d.data());
      if (tuKhoa) {
        const khop =
          kh.ten_khach_hang.toLowerCase().includes(tuKhoa) ||
          (kh.ma_so_thue ?? '').toLowerCase().includes(tuKhoa) ||
          (kh.so_dien_thoai ?? '').includes(tuKhoa) ||
          (kh.email ?? '').toLowerCase().includes(tuKhoa);
        if (!khop) return;
      }
      if (loc?.chi_nhanh_id && loc.chi_nhanh_id !== 'tat_ca' && kh.chi_nhanh_id !== loc.chi_nhanh_id) return;
      if (loc?.ngay_tao_tu_ngay && kh.ngay_tao < loc.ngay_tao_tu_ngay) return;
      if (loc?.ngay_tao_den_ngay && kh.ngay_tao > loc.ngay_tao_den_ngay + 'T23:59:59.999Z') return;
      mang.push(kh);
    });
    callback(mang);
  });
  return unsub;
};
