'use client';

import {
  addDoc,
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
import type { BaoCaoCongViec, ChiTietBaoCaoCongViec } from '../../thu_vien/types/bao_cao_cong_viec';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'bao_cao_cong_viec' as const;
const GIOI_HAN_MAC_DINH = 100;

export interface DieuKienLocBaoCaoCongViec {
  tuKhoa?: string | null;
  nhan_vien_id?: string | null;
  du_an_id?: string | null;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  ngay_bao_cao_tu_ngay?: string | null;
  ngay_bao_cao_den_ngay?: string | null;
  ngay_tao_tu_ngay?: string | null;
  ngay_tao_den_ngay?: string | null;
}

export interface TaoMoiBaoCaoCongViecDTO {
  ngay_bao_cao: string;
  nhan_vien_id?: string | null;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  danh_sach_chi_tiet: ChiTietBaoCaoCongViec[];
  kho_khan?: string | null;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface CapNhatBaoCaoCongViecDTO {
  ngay_bao_cao?: string;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  danh_sach_chi_tiet?: ChiTietBaoCaoCongViec[];
  kho_khan?: string | null;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

type RawBanGhiBCCV = Omit<BaoCaoCongViec, 'id'>;

const hopNhatVaChuanHoaChiTiet = (
  danh_sach_chi_tiet: ChiTietBaoCaoCongViec[] | null | undefined,
  du_an_id_legacy: string | null | undefined,
  noi_dung_thuc_hien_legacy: string | null | undefined
): ChiTietBaoCaoCongViec[] => {
  if (danh_sach_chi_tiet && Array.isArray(danh_sach_chi_tiet) && danh_sach_chi_tiet.length > 0) {
    return danh_sach_chi_tiet.filter((ct) => ct && typeof ct.noi_dung === 'string' && ct.noi_dung.trim().length > 0);
  }
  if (noi_dung_thuc_hien_legacy && String(noi_dung_thuc_hien_legacy).trim().length > 0) {
    return [
      {
        du_an_id: (du_an_id_legacy as any) ?? null,
        noi_dung: String(noi_dung_thuc_hien_legacy)
      }
    ];
  }
  return [];
};

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiBCCV | undefined | null
): BaoCaoCongViec => {
  const r = (raw ?? {}) as Partial<RawBanGhiBCCV>;
  const today = new Date().toISOString();
  const homNay = today.split('T')[0];

  const danhSachChiTietHopNhat = hopNhatVaChuanHoaChiTiet(
    r.danh_sach_chi_tiet,
    r.du_an_id,
    r.noi_dung_thuc_hien
  );

  return {
    id,
    ngay_bao_cao: (r.ngay_bao_cao as string) ?? homNay,
    nhan_vien_id: (r.nhan_vien_id as string) ?? '',
    chi_nhanh_id: (r.chi_nhanh_id as string | null) ?? null,
    phong_ban_id: (r.phong_ban_id as string | null) ?? null,

    danh_sach_chi_tiet: danhSachChiTietHopNhat,

    du_an_id: (r.du_an_id as string | null) ?? null,
    cong_viec_id: (r.cong_viec_id as string | null) ?? null,
    noi_dung_thuc_hien: (r.noi_dung_thuc_hien as string | null) ?? null,
    ke_hoach_ngay_mai: (r.ke_hoach_ngay_mai as string | null) ?? null,

    kho_khan: (r.kho_khan as string | null) ?? null,
    nguoi_tao_id: (r.nguoi_tao_id as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai_du_lieu: (r.trang_thai_du_lieu as BaoCaoCongViec['trang_thai_du_lieu']) ?? 'hoat_dong'
  };
};

const kiemTraBaoCaoCoChuaDuAnId = (bccv: BaoCaoCongViec, duAnId: string): boolean => {
  if (bccv.du_an_id === duAnId) return true;
  if (bccv.danh_sach_chi_tiet && Array.isArray(bccv.danh_sach_chi_tiet)) {
    return bccv.danh_sach_chi_tiet.some((ct) => ct.du_an_id === duAnId);
  }
  return false;
};

const timKiemTrongNoiDungBaoCao = (bccv: BaoCaoCongViec, tuKhoaLower: string): boolean => {
  if ((bccv.noi_dung_thuc_hien ?? '').toLowerCase().includes(tuKhoaLower)) return true;
  if ((bccv.kho_khan ?? '').toLowerCase().includes(tuKhoaLower)) return true;
  if (bccv.danh_sach_chi_tiet && Array.isArray(bccv.danh_sach_chi_tiet)) {
    for (const ct of bccv.danh_sach_chi_tiet) {
      if ((ct.noi_dung ?? '').toLowerCase().includes(tuKhoaLower)) return true;
    }
  }
  return false;
};

const sapXepVaLocThem = (mang: BaoCaoCongViec[], loc?: DieuKienLocBaoCaoCongViec): BaoCaoCongViec[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((bccv) => {
    if (tuKhoaLower) {
      const khop = timKiemTrongNoiDungBaoCao(bccv, tuKhoaLower);
      if (!khop) return false;
    }
    if (loc?.du_an_id && !kiemTraBaoCaoCoChuaDuAnId(bccv, loc.du_an_id)) {
      return false;
    }
    if (loc?.chi_nhanh_id && bccv.chi_nhanh_id !== loc.chi_nhanh_id) return false;
    if (loc?.phong_ban_id && bccv.phong_ban_id !== loc.phong_ban_id) return false;
    if (loc?.ngay_bao_cao_tu_ngay && bccv.ngay_bao_cao < loc.ngay_bao_cao_tu_ngay) return false;
    if (loc?.ngay_bao_cao_den_ngay && bccv.ngay_bao_cao > loc.ngay_bao_cao_den_ngay) return false;
    if (loc?.ngay_tao_tu_ngay && bccv.ngay_tao < loc.ngay_tao_tu_ngay) return false;
    if (loc?.ngay_tao_den_ngay && bccv.ngay_tao > loc.ngay_tao_den_ngay + 'T23:59:59.999Z') return false;
    return true;
  });
};

const chuanHoaChiTietTruocKhiLuu = (
  ds: ChiTietBaoCaoCongViec[] | undefined | null
): ChiTietBaoCaoCongViec[] => {
  if (!ds || !Array.isArray(ds)) return [];
  return ds
    .map((ct) => ({
      du_an_id: ct?.du_an_id ?? null,
      noi_dung: String(ct?.noi_dung ?? '').trim()
    }))
    .filter((ct) => ct.noi_dung.length > 0);
};

const layDuAnIdDauTien = (ds: ChiTietBaoCaoCongViec[] | null | undefined): string | null => {
  if (!ds || !Array.isArray(ds) || ds.length === 0) return null;
  const dauTienCoDuAn = ds.find((ct) => ct.du_an_id);
  return dauTienCoDuAn?.du_an_id ?? null;
};

const layNoiDungDauTien = (ds: ChiTietBaoCaoCongViec[] | null | undefined): string | null => {
  if (!ds || !Array.isArray(ds) || ds.length === 0) return null;
  return ds[0]?.noi_dung ?? null;
};

export const danhSachBaoCaoCongViec = async (
  loc?: DieuKienLocBaoCaoCongViec
): Promise<{ mang: BaoCaoCongViec[]; tong_so?: number }> => {
  try {
    const mangRangBuoc: QueryConstraint[] = [
      limit(GIOI_HAN_MAC_DINH)
    ];
    if (loc?.nhan_vien_id) {
      mangRangBuoc.unshift(where('nhan_vien_id', '==', loc.nhan_vien_id));
    }
    if (loc?.chi_nhanh_id) {
      mangRangBuoc.unshift(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
    }
    if (loc?.phong_ban_id) {
      mangRangBuoc.unshift(where('phong_ban_id', '==', loc.phong_ban_id));
    }
    const ttDuLieu = loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
      ? loc.trang_thai_du_lieu
      : 'hoat_dong';
    mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));

    const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc));
    const mangDaLoc = sapXepVaLocThem(
      snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data())),
      loc
    );
    mangDaLoc.sort((a, b) => {
      const cmpNgayBaoCao = (b.ngay_bao_cao ?? '').localeCompare(a.ngay_bao_cao ?? '');
      if (cmpNgayBaoCao !== 0) return cmpNgayBaoCao;
      return (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? '');
    });
    return { mang: mangDaLoc, tong_so: mangDaLoc.length };
  } catch (err) {
    console.warn('[dich_vu_bao_cao_cong_viec] danhSachBaoCaoCongViec catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietBaoCaoCongViec = async (id: string): Promise<BaoCaoCongViec | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export const kiemTraTrungLapBaoCao = async (
  ngayBaoCao: string,
  nhanVienId: string,
  loaiTruId?: string
): Promise<boolean> => {
  const snap = await getDocs(query(
    thamChieuCollection(TEN_COLLECTION),
    where('ngay_bao_cao', '==', ngayBaoCao),
    where('nhan_vien_id', '==', nhanVienId),
    where('trang_thai_du_lieu', '==', 'hoat_dong'),
    limit(10)
  ));
  for (const d of snap.docs) {
    if (loaiTruId && d.id === loaiTruId) continue;
    return true;
  }
  return false;
};

export const taoBaoCaoCongViecMoi = async (
  dto: TaoMoiBaoCaoCongViecDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<BaoCaoCongViec> => {
  const dsChuanHoa = chuanHoaChiTietTruocKhiLuu(dto.danh_sach_chi_tiet);
  if (dsChuanHoa.length === 0) {
    throw new Error('Vui lòng nhập ít nhất một dòng công việc.');
  }
  if (!dto.ngay_bao_cao) {
    throw new Error('Ngày báo cáo không được để trống.');
  }
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const idNhanVien = dto.nhan_vien_id ?? idNguoiThucHien;
  if (!idNhanVien) {
    throw new Error('Chưa xác định nhân viên báo cáo.');
  }
  const biTrungLap = await kiemTraTrungLapBaoCao(dto.ngay_bao_cao, idNhanVien);
  if (biTrungLap) {
    throw new Error('Bạn đã có báo cáo công việc cho ngày này rồi. Hãy chỉnh sửa báo cáo cũ.');
  }
  const now = new Date().toISOString();

  const duLieuRaw: RawBanGhiBCCV = {
    ngay_bao_cao: dto.ngay_bao_cao,
    nhan_vien_id: idNhanVien,
    chi_nhanh_id: dto.chi_nhanh_id ?? null,
    phong_ban_id: dto.phong_ban_id ?? null,

    danh_sach_chi_tiet: dsChuanHoa,

    du_an_id: layDuAnIdDauTien(dsChuanHoa),
    cong_viec_id: null,
    noi_dung_thuc_hien: layNoiDungDauTien(dsChuanHoa),
    ke_hoach_ngay_mai: null,

    kho_khan: dto.kho_khan?.trim() || null,
    nguoi_tao_id: idNguoiThucHien,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? 'hoat_dong'
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  await ghiNhatKyHoatDong(
    idNguoiThucHien,
    'bao_cao_cong_viec',
    'tao_moi',
    moi.id,
    `Tạo báo cáo công việc ngày ${moi.ngay_bao_cao} (${dsChuanHoa.length} dòng)`
  );
  return moi;
};

export const capNhatBaoCaoCongViec = async (
  id: string,
  dto: CapNhatBaoCaoCongViecDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<BaoCaoCongViec> => {
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const hienTai = await layChiTietBaoCaoCongViec(id);
  if (!hienTai) {
    throw new Error('Không tìm thấy báo cáo công việc để cập nhật.');
  }

  if (dto.danh_sach_chi_tiet !== undefined) {
    const dsChuanHoa = chuanHoaChiTietTruocKhiLuu(dto.danh_sach_chi_tiet);
    if (dsChuanHoa.length === 0) {
      throw new Error('Vui lòng nhập ít nhất một dòng công việc.');
    }
  }

  const ngayBCMoi = dto.ngay_bao_cao ?? hienTai.ngay_bao_cao;
  if (ngayBCMoi !== hienTai.ngay_bao_cao) {
    const biTrungLap = await kiemTraTrungLapBaoCao(ngayBCMoi, hienTai.nhan_vien_id, id);
    if (biTrungLap) {
      throw new Error('Đã tồn tại báo cáo công việc cho ngày và nhân viên này.');
    }
  }
  const now = new Date().toISOString();

  const dsMoiChuanHoa = dto.danh_sach_chi_tiet !== undefined
    ? chuanHoaChiTietTruocKhiLuu(dto.danh_sach_chi_tiet)
    : (hienTai.danh_sach_chi_tiet ?? []);

  const duLieuMoi: RawBanGhiBCCV = {
    ...hienTai,
    ngay_bao_cao: ngayBCMoi,
    chi_nhanh_id: dto.chi_nhanh_id !== undefined ? dto.chi_nhanh_id : hienTai.chi_nhanh_id,
    phong_ban_id: dto.phong_ban_id !== undefined ? dto.phong_ban_id : hienTai.phong_ban_id,

    danh_sach_chi_tiet: dsMoiChuanHoa,
    du_an_id: dto.danh_sach_chi_tiet !== undefined ? layDuAnIdDauTien(dsMoiChuanHoa) : hienTai.du_an_id,
    noi_dung_thuc_hien: dto.danh_sach_chi_tiet !== undefined ? layNoiDungDauTien(dsMoiChuanHoa) : hienTai.noi_dung_thuc_hien,
    cong_viec_id: null,
    ke_hoach_ngay_mai: null,

    kho_khan: dto.kho_khan !== undefined
      ? (dto.kho_khan?.trim() || null)
      : hienTai.kho_khan,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? hienTai.trang_thai_du_lieu
  };
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, id), duLieuMoi as any, { merge: true });
  await ghiNhatKyHoatDong(
    idNguoiThucHien,
    'bao_cao_cong_viec',
    'cap_nhat',
    id,
    `Cập nhật báo cáo công việc ngày ${duLieuMoi.ngay_bao_cao} (${dsMoiChuanHoa.length} dòng)`
  );
  return chuyenDoiDocThanhDoiTuong(id, duLieuMoi);
};

export const xoaMemBaoCaoCongViec = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<void> => {
  await capNhatBaoCaoCongViec(
    id,
    { trang_thai_du_lieu: 'da_xoa' },
    nguoiThucHien
  );
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'bao_cao_cong_viec',
    'xoa_mem',
    id,
    'Xóa mềm báo cáo công việc'
  );
};

export const langNgheThayDoiDanhSachBaoCaoCongViec = (
  callback: (mang: BaoCaoCongViec[]) => void,
  loc?: DieuKienLocBaoCaoCongViec
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.nhan_vien_id) {
    mangRangBuoc.unshift(where('nhan_vien_id', '==', loc.nhan_vien_id));
  }
  if (loc?.chi_nhanh_id) {
    mangRangBuoc.unshift(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
  }
  if (loc?.phong_ban_id) {
    mangRangBuoc.unshift(where('phong_ban_id', '==', loc.phong_ban_id));
  }
  const ttDuLieu = loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
    ? loc.trang_thai_du_lieu
    : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));
  const unsub = onSnapshot(
    query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc),
    (snap) => {
      const mang = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
      mang.sort((a, b) => {
        const c1 = b.ngay_bao_cao.localeCompare(a.ngay_bao_cao);
        if (c1 !== 0) return c1;
        return b.ngay_cap_nhat.localeCompare(a.ngay_cap_nhat);
      });
      callback(sapXepVaLocThem(mang, loc));
    }
  );
  return unsub;
};
