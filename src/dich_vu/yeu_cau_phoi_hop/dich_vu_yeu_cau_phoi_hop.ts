'use client';

import {
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  onSnapshot
} from 'firebase/firestore';
import {
  thamChieuCollection,
  thamChieuBanGhi
} from '../../thu_vien/firebase/client_firebase';
import type {
  YeuCauPhoiHop,
  TrangThaiYeuCauPhoiHop,
  NhatKyXuLyYeuCau
} from '../../thu_vien/types/yeu_cau_phoi_hop';

export type { YeuCauPhoiHop };

const TEN_COLLECTION = 'yeu_cau_phoi_hop' as const;
const CACHE_KEYS = [
  'ebms_yeu_cau_phoi_hop_cache_v4',
  'ebms_yeu_cau_phoi_hop_cache_v3',
  'ebms_yeu_cau_phoi_hop_cache_v2',
  'ebms_yeu_cau_phoi_hop_cache'
];

export interface DieuKienLocYeuCauPhoiHop {
  du_an_id?: string | null;
  trang_thai?: TrangThaiYeuCauPhoiHop | 'tat_ca' | null;
  nguoi_tao_id?: string | null;
  tuKhoa?: string | null;
}

export interface TaoMoiYeuCauPhoiHopDTO {
  du_an_id: string;
  ten_du_an: string;
  khach_hang_id?: string | null;
  ten_khach_hang?: string | null;
  noi_dung_yeu_cau: string;
  link_drive_dau_vao?: string | null;
  han_hoan_thanh?: string | null;
}

export interface CapNhatThongTinYeuCauDTO {
  id: string;
  noi_dung_yeu_cau?: string;
  link_drive_dau_vao?: string | null;
  link_drive_ket_qua?: string | null;
  han_hoan_thanh?: string | null;
  nguoiThucHien?: { id: string; ho_va_ten?: string | null; [key: string]: any } | null;
}

export interface ChuyenBuocDTO {
  yeuCauId: string;
  trangThaiMoi: TrangThaiYeuCauPhoiHop;
  ghiChu?: string | null;
  linkDriveKetQua?: string | null;
  danhSachNhanSuThucHien?: { id: string; ho_va_ten: string }[] | null;
  hanHoanThanhMoi?: string | null;
  nguoiThucHien?: { id: string; ho_va_ten?: string | null; [key: string]: any } | null;
}

// ==== Helpers Cache Local & Event ====
const docCacheLocal = (): YeuCauPhoiHop[] => {
  if (typeof window === 'undefined') return [];
  try {
    for (const key of CACHE_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            return list;
          }
        } catch {}
      }
    }
    return [];
  } catch {
    return [];
  }
};

const ghiCacheLocal = (data: YeuCauPhoiHop[]) => {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(data);
    CACHE_KEYS.forEach((k) => localStorage.setItem(k, serialized));
  } catch {}
};

const phatSuKienCapNhat = (yc?: YeuCauPhoiHop) => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ebms_cap_nhat_yeu_cau_phoi_hop', { detail: yc }));
    } catch {}
  }
};

/**
 * Hợp nhất dữ liệu giữa Remote (Firestore) và Local Cache
 * Không làm mất dữ liệu offline hoặc dữ liệu cũ trong cache
 */
const hopNhatDanhSach = (remote: YeuCauPhoiHop[], local: YeuCauPhoiHop[]): YeuCauPhoiHop[] => {
  const map = new Map<string, YeuCauPhoiHop>();
  local.forEach((x) => {
    if (x && x.id) map.set(x.id, x);
  });
  remote.forEach((x) => {
    if (x && x.id) map.set(x.id, x);
  });
  const merged = Array.from(map.values()).filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
  return merged.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime());
};

/**
 * Lắng nghe thay đổi dữ liệu thời gian thực từ Firestore Client
 */
export const langNgheYeuCauPhoiHop = (
  callback: (ds: YeuCauPhoiHop[]) => void
): (() => void) => {
  // 1. Gửi cache ngay lập tức để render tức thì (0ms)
  const cached = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
  if (cached.length > 0) {
    callback(cached.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime()));
  }

  // 2. Lắng nghe real-time qua onSnapshot trực tiếp từ Firestore Client
  let unsubscribeFirestore = () => {};
  try {
    const colRef = thamChieuCollection(TEN_COLLECTION);
    unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        const tuRemote: YeuCauPhoiHop[] = [];
        snapshot.forEach((d) => {
          const docData = d.data() as any;
          if (docData && docData.trang_thai_du_lieu !== 'da_xoa') {
            tuRemote.push({ id: d.id, ...docData });
          }
        });

        // Hợp nhất remote và local cache
        const local = docCacheLocal();
        const hopNhat = hopNhatDanhSach(tuRemote, local);
        ghiCacheLocal(hopNhat);
        callback(hopNhat);

        // Tự động đẩy dữ liệu local chưa có trên Firestore lên Firestore
        if (tuRemote.length === 0 && local.length > 0) {
          local.forEach((item) => {
            if (item && item.id && item.trang_thai_du_lieu !== 'da_xoa') {
              setDoc(thamChieuBanGhi(TEN_COLLECTION, item.id), item, { merge: true }).catch(() => {});
            }
          });
        }
      },
      (error) => {
        console.warn('[langNgheYeuCauPhoiHop] Lỗi onSnapshot Firestore, sử dụng cache cục bộ:', error);
        const fallback = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
        callback(fallback.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime()));
      }
    );
  } catch (err) {
    console.warn('[langNgheYeuCauPhoiHop] Không thể tạo onSnapshot:', err);
    const fallback = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
    callback(fallback.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime()));
  }

  // 3. Lắng nghe event cục bộ cùng tab
  const handleCustomEvent = (ev: Event) => {
    const custom = ev as CustomEvent<YeuCauPhoiHop | undefined>;
    const updated = custom.detail;
    const current = docCacheLocal();
    let next: YeuCauPhoiHop[];
    if (updated && updated.id) {
      next = current.some((x) => x.id === updated.id)
        ? current.map((x) => (x.id === updated.id ? updated : x))
        : [updated, ...current];
    } else {
      next = current;
    }
    const valid = next.filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
    ghiCacheLocal(valid);
    callback(valid.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime()));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('ebms_cap_nhat_yeu_cau_phoi_hop', handleCustomEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('ebms_cap_nhat_yeu_cau_phoi_hop', handleCustomEvent);
    }
  };
};

/**
 * Lấy danh sách yêu cầu phối hợp từ Firestore kết hợp Cache
 */
export const danhSachYeuCauPhoiHop = async (
  dieuKien: DieuKienLocYeuCauPhoiHop = {}
): Promise<YeuCauPhoiHop[]> => {
  const local = docCacheLocal();
  let danhSach: YeuCauPhoiHop[] = [...local];

  try {
    const colRef = thamChieuCollection(TEN_COLLECTION);
    const snap = await getDocs(colRef);
    const tuRemote: YeuCauPhoiHop[] = [];
    snap.forEach((d) => {
      const docData = d.data() as any;
      if (docData && docData.trang_thai_du_lieu !== 'da_xoa') {
        tuRemote.push({ id: d.id, ...docData });
      }
    });

    danhSach = hopNhatDanhSach(tuRemote, local);
    ghiCacheLocal(danhSach);

    // Đồng bộ ngược nếu Firestore chưa có dữ liệu
    if (tuRemote.length === 0 && local.length > 0) {
      local.forEach((item) => {
        if (item && item.id && item.trang_thai_du_lieu !== 'da_xoa') {
          setDoc(thamChieuBanGhi(TEN_COLLECTION, item.id), item, { merge: true }).catch(() => {});
        }
      });
    }
  } catch (err) {
    console.warn('[danhSachYeuCauPhoiHop] Lỗi đọc Firestore, dùng cache:', err);
    danhSach = local.filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
  }

  if (dieuKien.du_an_id) {
    danhSach = danhSach.filter((x) => x.du_an_id === dieuKien.du_an_id);
  }
  if (dieuKien.nguoi_tao_id) {
    danhSach = danhSach.filter((x) => x.nguoi_tao_id === dieuKien.nguoi_tao_id);
  }
  if (dieuKien.trang_thai && dieuKien.trang_thai !== 'tat_ca') {
    danhSach = danhSach.filter((x) => x.trang_thai === dieuKien.trang_thai);
  }
  if (dieuKien.tuKhoa?.trim()) {
    const kw = dieuKien.tuKhoa.trim().toLowerCase();
    danhSach = danhSach.filter(
      (x) =>
        x.noi_dung_yeu_cau?.toLowerCase().includes(kw) ||
        x.ten_du_an?.toLowerCase().includes(kw) ||
        x.ten_khach_hang?.toLowerCase().includes(kw) ||
        x.ten_nguoi_tao?.toLowerCase().includes(kw)
    );
  }

  return danhSach;
};

/**
 * Tạo mới yêu cầu phối hợp và lưu trực tiếp lên Firestore
 */
export const taoYeuCauPhoiHopMoi = async (
  dto: TaoMoiYeuCauPhoiHopDTO,
  nguoiThucHien?: { id: string; ho_va_ten?: string | null; [key: string]: any } | null
): Promise<YeuCauPhoiHop> => {
  const nowISO = new Date().toISOString();
  const idMoi = `yc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const userId = nguoiThucHien?.id || 'thanh_vien';
  const userName = nguoiThucHien?.ho_va_ten || 'Thành viên';

  const nhatKyKhoiTao: NhatKyXuLyYeuCau = {
    id: `log_${Date.now()}`,
    thoi_gian: nowISO,
    nguoi_thuc_hien_id: userId,
    ten_nguoi_thuc_hien: userName,
    chuc_vu: (nguoiThucHien as any)?.chuc_vu || null,
    vai_tro: nguoiThucHien?.vai_tro || null,
    hanh_dong: 'Tạo yêu cầu phối hợp',
    ghi_chu: dto.noi_dung_yeu_cau,
    link_drive: dto.link_drive_dau_vao || null
  };

  const yeuCauMoi: YeuCauPhoiHop = {
    id: idMoi,
    du_an_id: dto.du_an_id,
    ten_du_an: dto.ten_du_an,
    khach_hang_id: dto.khach_hang_id || null,
    ten_khach_hang: dto.ten_khach_hang || null,
    noi_dung_yeu_cau: dto.noi_dung_yeu_cau.trim(),
    link_drive_dau_vao: dto.link_drive_dau_vao?.trim() || null,
    link_drive_ket_qua: null,
    han_hoan_thanh: dto.han_hoan_thanh || null,
    ghi_chu_phan_hoi: null,
    trang_thai: 'cho_tpkd_duyet',
    nguoi_tao_id: userId,
    ten_nguoi_tao: userName,
    phong_ban_id: nguoiThucHien?.phong_ban_id || null,
    chi_nhanh_id: nguoiThucHien?.chi_nhanh_id || null,
    lich_su_xu_ly: [nhatKyKhoiTao],
    ngay_tao: nowISO,
    ngay_cap_nhat: nowISO,
    trang_thai_du_lieu: 'hoat_dong'
  };

  // 1. Cập nhật cache tức thì và phát event
  const cacheHienTai = docCacheLocal();
  ghiCacheLocal([yeuCauMoi, ...cacheHienTai.filter((x) => x.id !== idMoi)]);
  phatSuKienCapNhat(yeuCauMoi);

  // 2. Ghi trực tiếp lên Firestore qua Client SDK
  try {
    await setDoc(thamChieuBanGhi(TEN_COLLECTION, idMoi), yeuCauMoi);
  } catch (err) {
    console.warn('[taoYeuCauPhoiHopMoi] Cảnh báo ghi Firestore:', err);
  }

  // 3. Tự động thêm dòng tiến độ vào hồ sơ dự án
  try {
    const cauHanhDong = `Gửi yêu cầu phối hợp: ${dto.noi_dung_yeu_cau.trim()}`;
    await addDoc(thamChieuCollection('tien_do_du_an'), {
      du_an_id: dto.du_an_id,
      tinh_hinh_hien_tai: cauHanhDong,
      hanh_dong_tiep_theo: 'Bộ phận chuyên môn tiếp nhận và xử lý kết quả',
      deadline_hanh_dong: dto.han_hoan_thanh || null,
      link_tai_lieu: dto.link_drive_dau_vao || null,
      ten_tai_lieu: dto.link_drive_dau_vao ? 'Tài liệu đầu vào (Google Drive)' : null,
      ket_qua_thuc_hien: null,
      trang_thai_hanh_dong: 'dang_thuc_hien',
      nguoi_tao_id: userId,
      nguoi_hoan_thanh_id: null,
      ngay_tao: nowISO,
      ngay_cap_nhat: nowISO,
      ngay_hoan_thanh: null,
      trang_thai_du_lieu: 'hoat_dong'
    });
  } catch (eTD) {
    console.warn('[taoYeuCauPhoiHopMoi] Lỗi ghi tiến độ dự án:', eTD);
  }

  return yeuCauMoi;
};

/**
 * Chuyển bước yêu cầu phối hợp (Phê duyệt, Phân công, Nộp kết quả, Sửa, Hoàn tất)
 */
export const chuyenBuocYeuCauPhoiHop = async (
  params: ChuyenBuocDTO
): Promise<YeuCauPhoiHop | null> => {
  const {
    yeuCauId,
    trangThaiMoi,
    ghiChu,
    linkDriveKetQua,
    danhSachNhanSuThucHien,
    hanHoanThanhMoi,
    nguoiThucHien
  } = params;

  const nowISO = new Date().toISOString();
  const userId = nguoiThucHien?.id || 'he_thong';
  const userName = nguoiThucHien?.ho_va_ten || 'Người dùng';

  // Lấy dữ liệu hiện tại từ cache hoặc Firestore
  let hienTai = docCacheLocal().find((x) => x.id === yeuCauId);
  if (!hienTai) {
    try {
      const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, yeuCauId));
      if (snap.exists()) {
        hienTai = { id: snap.id, ...(snap.data() as any) } as YeuCauPhoiHop;
      }
    } catch {}
  }
  if (!hienTai) return null;

  let tenHanhDong = 'Chuyển bước';
  if (trangThaiMoi === 'cho_khth_thuc_hien') {
    tenHanhDong = 'Tiếp nhận & Phân công KHTH';
  } else if (trangThaiMoi === 'cho_tpkd_duyet_ket_qua') {
    tenHanhDong = 'Nộp kết quả xử lý';
  } else if (trangThaiMoi === 'da_phe_duyet') {
    tenHanhDong = 'Phê duyệt kết quả';
  } else if (trangThaiMoi === 'yeu_cau_chinh_sua') {
    tenHanhDong = 'Yêu cầu chỉnh sửa';
  } else if (trangThaiMoi === 'da_hoan_thanh') {
    tenHanhDong = 'Hoàn tất yêu cầu';
  }

  const nhatKyMoi: NhatKyXuLyYeuCau = {
    id: `log_${Date.now()}`,
    thoi_gian: nowISO,
    nguoi_thuc_hien_id: userId,
    ten_nguoi_thuc_hien: userName,
    chuc_vu: (nguoiThucHien as any)?.chuc_vu || null,
    vai_tro: nguoiThucHien?.vai_tro || null,
    hanh_dong: tenHanhDong,
    ghi_chu: ghiChu || null,
    link_drive: linkDriveKetQua || null
  };

  const capNhat: Partial<YeuCauPhoiHop> = {
    trang_thai: trangThaiMoi,
    ngay_cap_nhat: nowISO
  };

  if (linkDriveKetQua) capNhat.link_drive_ket_qua = linkDriveKetQua.trim();
  if (hanHoanThanhMoi) capNhat.han_hoan_thanh = hanHoanThanhMoi;
  if (ghiChu) capNhat.ghi_chu_phan_hoi = ghiChu.trim();

  if (Array.isArray(danhSachNhanSuThucHien) && danhSachNhanSuThucHien.length > 0) {
    capNhat.danh_sach_nhan_su_thuc_hien_ids = danhSachNhanSuThucHien.map((x) => x.id);
    capNhat.danh_sach_ten_nhan_su_thuc_hien = danhSachNhanSuThucHien.map((x) => x.ho_va_ten);
  }

  const lichSuCu = Array.isArray(hienTai.lich_su_xu_ly) ? hienTai.lich_su_xu_ly : [];
  const yeuCauCapNhat: YeuCauPhoiHop = {
    ...hienTai,
    ...capNhat,
    lich_su_xu_ly: [...lichSuCu, nhatKyMoi]
  };

  // 1. Cập nhật local cache & phát event tức thì (giao diện phản hồi 0ms)
  const localList = docCacheLocal();
  ghiCacheLocal(localList.map((x) => (x.id === yeuCauId ? yeuCauCapNhat : x)));
  phatSuKienCapNhat(yeuCauCapNhat);

  // 2. Ghi trực tiếp Firestore
  try {
    await setDoc(thamChieuBanGhi(TEN_COLLECTION, yeuCauId), yeuCauCapNhat, { merge: true });
  } catch (err) {
    console.warn('[chuyenBuocYeuCauPhoiHop] Cảnh báo lưu Firestore:', err);
  }

  return yeuCauCapNhat;
};

/**
 * Cập nhật thông tin yêu cầu (nội dung, link, hạn hoàn thành)
 */
export const capNhatThongTinYeuCau = async (
  dto: CapNhatThongTinYeuCauDTO
): Promise<YeuCauPhoiHop | null> => {
  let hienTai = docCacheLocal().find((x) => x.id === dto.id);
  if (!hienTai) {
    try {
      const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id));
      if (snap.exists()) {
        hienTai = { id: snap.id, ...(snap.data() as any) } as YeuCauPhoiHop;
      }
    } catch {}
  }
  if (!hienTai) return null;

  const nowISO = new Date().toISOString();
  const patch: Partial<YeuCauPhoiHop> = {
    ngay_cap_nhat: nowISO
  };

  if (dto.noi_dung_yeu_cau !== undefined) patch.noi_dung_yeu_cau = dto.noi_dung_yeu_cau.trim();
  if (dto.link_drive_dau_vao !== undefined) patch.link_drive_dau_vao = dto.link_drive_dau_vao?.trim() || null;
  if (dto.link_drive_ket_qua !== undefined) patch.link_drive_ket_qua = dto.link_drive_ket_qua?.trim() || null;
  if (dto.han_hoan_thanh !== undefined) patch.han_hoan_thanh = dto.han_hoan_thanh || null;

  const yeuCauCapNhat: YeuCauPhoiHop = {
    ...hienTai,
    ...patch
  };

  // 1. Cập nhật cache tức thì & phát event
  const localList = docCacheLocal();
  ghiCacheLocal(localList.map((x) => (x.id === dto.id ? yeuCauCapNhat : x)));
  phatSuKienCapNhat(yeuCauCapNhat);

  // 2. Ghi trực tiếp Firestore
  try {
    await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patch, { merge: true });
  } catch (err) {
    console.warn('[capNhatThongTinYeuCau] Cảnh báo lưu Firestore:', err);
  }

  return yeuCauCapNhat;
};

/**
 * Xóa yêu cầu phối hợp (xóa mềm đổi trang_thai_du_lieu sang 'da_xoa')
 */
export const xoaYeuCauPhoiHop = async (
  yeuCauId: string,
  nguoiThucHien?: { id: string; ho_va_ten?: string | null; [key: string]: any } | null
): Promise<boolean> => {
  // 1. Xóa khỏi local cache & phát event ngay
  const localList = docCacheLocal();
  ghiCacheLocal(localList.filter((x) => x.id !== yeuCauId));
  phatSuKienCapNhat();

  // 2. Ghi cập nhật Firestore
  try {
    const nowISO = new Date().toISOString();
    await setDoc(
      thamChieuBanGhi(TEN_COLLECTION, yeuCauId),
      {
        trang_thai_du_lieu: 'da_xoa',
        ngay_cap_nhat: nowISO
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[xoaYeuCauPhoiHop] Lỗi xóa Firestore:', err);
  }

  return true;
};
