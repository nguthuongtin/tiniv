'use client';

import {
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
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
import type { NguoiDungDangNhap, NhanSu } from '../../thu_vien/types/nhan_su';
import { themTaiLieuDuAn } from '../tai_lieu_du_an/dich_vu_tai_lieu_du_an';
import { taoTaiLieuMoi } from '../kho_tai_lieu/dich_vu_kho_tai_lieu';

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
  nguoi_nhan_id?: string | null;
  ten_nguoi_nhan?: string | null;
  chuc_vu_nguoi_nhan?: string | null;
}

export interface CapNhatThongTinYeuCauDTO {
  id: string;
  noi_dung_yeu_cau?: string;
  link_drive_dau_vao?: string | null;
  link_drive_ket_qua?: string | null;
  han_hoan_thanh?: string | null;
  trang_thai?: TrangThaiYeuCauPhoiHop;
  ghi_chu?: string | null;
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
  nguoiNhanMoiId?: string | null;
  tenNguoiNhanMoi?: string | null;
  chucVuNguoiNhanMoi?: string | null;
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
 * Trích xuất danh sách liên kết (URL) hợp lệ từ chuỗi văn bản
 */
export function trichXuatDanhSachLinks(text: string | null | undefined): string[] {
  if (!text) return [];
  const lines = text.split(/[\r\n,;\s]+/).map((s) => s.trim()).filter(Boolean);
  const links: string[] = [];
  for (const l of lines) {
    if (l.startsWith('http://') || l.startsWith('https://')) {
      links.push(l);
    } else if (
      l.includes('drive.google.com') ||
      l.includes('docs.google.com') ||
      l.includes('dropbox.com') ||
      l.includes('onedrive')
    ) {
      links.push(`https://${l}`);
    }
  }
  if (links.length === 0 && text.trim()) {
    const raw = text.trim();
    links.push(raw.startsWith('http') ? raw : `https://${raw}`);
  }
  return Array.from(new Set(links));
}

/**
 * Tự động ghi nhận dòng tiến độ dự án khi yêu cầu phối hợp chuyển bước
 * 1. Khi KHTH hoàn thành nộp kết quả
 * 2. Khi Trưởng phòng / Lãnh đạo phê duyệt kết quả
 */
async function ghiNhanTienDoKhiChuyenBuoc(
  hienTai: YeuCauPhoiHop,
  trangThaiMoi: TrangThaiYeuCauPhoiHop,
  linkKetQua: string | null,
  ghiChu: string | null,
  userId: string,
  userName: string,
  nowISO: string
) {
  if (!hienTai.du_an_id) return;

  try {
    if (
      trangThaiMoi === 'cho_tpkh_duyet_ket_qua' ||
      trangThaiMoi === 'cho_tpkd_duyet_ket_qua'
    ) {
      const tenKHTH =
        Array.isArray(hienTai.danh_sach_ten_nhan_su_thuc_hien) &&
        hienTai.danh_sach_ten_nhan_su_thuc_hien.length > 0
          ? hienTai.danh_sach_ten_nhan_su_thuc_hien.join(', ')
          : userName;

      await addDoc(thamChieuCollection('tien_do_du_an'), {
        du_an_id: hienTai.du_an_id,
        tinh_hinh_hien_tai: `[KHTH nộp kết quả] ${hienTai.noi_dung_yeu_cau}`,
        la_noi_bo: true,
        loai_tien_do: 'noi_bo',
        hanh_dong_tiep_theo: 'Kiểm tra & phê duyệt kết quả phối hợp',
        deadline_hanh_dong: hienTai.han_hoan_thanh || null,
        link_tai_lieu: linkKetQua,
        ten_tai_lieu: linkKetQua ? 'File kết quả Google Drive (KHTH)' : null,
        ket_qua_thuc_hien: ghiChu || `Đã bàn giao file kết quả (${tenKHTH})`,
        trang_thai_hanh_dong: 'dang_thuc_hien',
        nguoi_tao_id: userId,
        nguoi_hoan_thanh_id: userId,
        ngay_tao: nowISO,
        ngay_cap_nhat: nowISO,
        ngay_hoan_thanh: nowISO,
        trang_thai_du_lieu: 'hoat_dong'
      });
    } else if (
      trangThaiMoi === 'cho_sale_nghiem_thu' ||
      trangThaiMoi === 'da_phe_duyet' ||
      trangThaiMoi === 'da_hoan_thanh'
    ) {
      await addDoc(thamChieuCollection('tien_do_du_an'), {
        du_an_id: hienTai.du_an_id,
        tinh_hinh_hien_tai: `[Đã duyệt kết quả phối hợp] ${hienTai.noi_dung_yeu_cau}`,
        la_noi_bo: true,
        loai_tien_do: 'noi_bo',
        hanh_dong_tiep_theo: 'Kinh doanh tiếp nhận kết quả và triển khai tiếp với khách hàng',
        deadline_hanh_dong: hienTai.han_hoan_thanh || null,
        link_tai_lieu: linkKetQua,
        ten_tai_lieu: linkKetQua ? 'File kết quả KHTH đã phê duyệt' : null,
        ket_qua_thuc_hien: ghiChu || 'Nghiệm thu đạt yêu cầu, sẵn sàng sử dụng',
        trang_thai_hanh_dong: 'da_hoan_thanh',
        nguoi_tao_id: userId,
        nguoi_hoan_thanh_id: userId,
        ngay_tao: nowISO,
        ngay_cap_nhat: nowISO,
        ngay_hoan_thanh: nowISO,
        trang_thai_du_lieu: 'hoat_dong'
      });
    }
  } catch (err) {
    console.warn('[ghiNhanTienDoKhiChuyenBuoc] Lỗi ghi tiến độ dự án:', err);
  }
}

/**
 * Tự động lưu tất cả link file kết quả sau khi được phê duyệt vào:
 * 1. Mục tài liệu của chính dự án đó (tai_lieu_du_an)
 * 2. Kho tài liệu chung toàn hệ thống (kho_tai_lieu)
 */
async function luuTaiLieuKetQuaKhiPheDuyet(
  hienTai: YeuCauPhoiHop,
  linkKetQua: string | null,
  nguoiThucHien?: any
) {
  if (!hienTai.du_an_id || !linkKetQua) return;

  const dsLinks = trichXuatDanhSachLinks(linkKetQua);
  if (dsLinks.length === 0) return;

  const userId = nguoiThucHien?.id || 'he_thong';
  const tenNhanSuKHTH =
    Array.isArray(hienTai.danh_sach_ten_nhan_su_thuc_hien) &&
    hienTai.danh_sach_ten_nhan_su_thuc_hien.length > 0
      ? hienTai.danh_sach_ten_nhan_su_thuc_hien.join(', ')
      : 'KHTH';

  for (const url of dsLinks) {
    // 1. Lưu vào mục tài liệu của chính dự án (tai_lieu_du_an)
    try {
      const snapTL = await getDocs(
        query(
          thamChieuCollection('tai_lieu_du_an'),
          where('du_an_id', '==', hienTai.du_an_id)
        )
      );
      const daTonTaiTL = snapTL.docs.some((d) => (d.data() as any)?.url_file === url);
      if (!daTonTaiTL) {
        await themTaiLieuDuAn(
          {
            du_an_id: hienTai.du_an_id,
            ten_file: `Kết quả KHTH: ${hienTai.noi_dung_yeu_cau.slice(0, 80)}`,
            url_file: url,
            loai_file: 'link_google_drive',
            ghi_chu: `Tự động lưu từ kết quả yêu cầu phối hợp đã phê duyệt (KHTH: ${tenNhanSuKHTH})`,
            nguoi_tai_len_id: userId
          },
          nguoiThucHien ? { id: userId } : null
        );
      }
    } catch (eTL) {
      console.warn('[luuTaiLieuKetQuaKhiPheDuyet] Lỗi lưu vào tai_lieu_du_an:', eTL);
    }

    // 2. Lưu vào kho tài liệu toàn hệ thống (kho_tai_lieu)
    try {
      const snapKTL = await getDocs(
        query(
          thamChieuCollection('kho_tai_lieu'),
          where('url', '==', url)
        )
      );
      const daTonTaiKTL = snapKTL.docs.some((d) => (d.data() as any)?.trang_thai !== 'da_xoa');
      if (!daTonTaiKTL) {
        await taoTaiLieuMoi(
          {
            tieu_de: `[${hienTai.ten_du_an}] Kết quả KHTH: ${hienTai.noi_dung_yeu_cau.slice(0, 60)}`,
            url,
            mo_ta: `Tài liệu kết quả phối hợp phòng ban cho dự án "${hienTai.ten_du_an}". KHTH thực hiện: ${tenNhanSuKHTH}.`,
            pham_vi: 'chung',
            danh_muc: 'Hồ sơ dự án',
            loai_lien_ket: 'google_drive',
            the_tags: ['Dự án', hienTai.ten_du_an, 'KHTH', 'Kết quả phối hợp']
          },
          nguoiThucHien as any
        );
      }
    } catch (eKTL) {
      console.warn('[luuTaiLieuKetQuaKhiPheDuyet] Lỗi lưu vào kho_tai_lieu:', eKTL);
    }
  }
}

/**
 * Hợp nhất dữ liệu giữa Remote (Firestore) và Local Cache
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

        const local = docCacheLocal();
        const hopNhat = hopNhatDanhSach(tuRemote, local);
        ghiCacheLocal(hopNhat);
        callback(hopNhat);

        // Tự động đẩy bất kỳ item nào có ở local nhưng chưa có trên Firestore
        const remoteIdSet = new Set(tuRemote.map((r) => r.id));
        local.forEach((item) => {
          if (item && item.id && !remoteIdSet.has(item.id) && item.trang_thai_du_lieu !== 'da_xoa') {
            setDoc(thamChieuBanGhi(TEN_COLLECTION, item.id), item, { merge: true }).catch(() => {});
          }
        });
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

    // Tự động đẩy bất kỳ item nào có ở local nhưng chưa có trên Firestore
    const remoteIdSet = new Set(tuRemote.map((r) => r.id));
    local.forEach((item) => {
      if (item && item.id && !remoteIdSet.has(item.id) && item.trang_thai_du_lieu !== 'da_xoa') {
        setDoc(thamChieuBanGhi(TEN_COLLECTION, item.id), item, { merge: true }).catch(() => {});
      }
    });
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
    nguoi_nhan_id: dto.nguoi_nhan_id || null,
    ten_nguoi_nhan: dto.ten_nguoi_nhan || null,
    chuc_vu_nguoi_nhan: dto.chuc_vu_nguoi_nhan || null,
    danh_sach_nhan_su_thuc_hien_ids: dto.nguoi_nhan_id ? [dto.nguoi_nhan_id] : [],
    danh_sach_ten_nhan_su_thuc_hien: dto.ten_nguoi_nhan ? [dto.ten_nguoi_nhan] : [],
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
      la_noi_bo: true,
      loai_tien_do: 'noi_bo',
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
  if (trangThaiMoi === 'cho_tpkd_duyet') {
    if (ghiChu?.includes('TPKH')) tenHanhDong = 'TPKH trả lại yêu cầu làm rõ';
    else if (ghiChu?.includes('Sale')) tenHanhDong = 'Sale yêu cầu hiệu chỉnh lại';
    else tenHanhDong = ghiChu ? 'Yêu cầu làm lại / Chuyển TPKD' : 'Khởi tạo chuyển TPKD';
  } else if (trangThaiMoi === 'cho_tpkh_tiep_nhan') {
    tenHanhDong = ghiChu?.includes('TPKD yêu cầu')
      ? 'TPKD yêu cầu TPKH rà soát sửa lại'
      : 'TPKD phê duyệt & Chuyển KHTH';
  } else if (trangThaiMoi === 'cho_cv_khth_thuc_hien' || trangThaiMoi === 'cho_khth_thuc_hien') {
    tenHanhDong = ghiChu?.includes('sửa')
      ? 'TPKH yêu cầu CV sửa lại'
      : 'TPKH phân công CV KHTH';
  } else if (trangThaiMoi === 'cho_tpkh_duyet_ket_qua') {
    tenHanhDong = 'CV KHTH nộp kết quả';
  } else if (trangThaiMoi === 'cho_tpkd_duyet_ket_qua' || trangThaiMoi === 'cho_lanh_dao_duyet') {
    tenHanhDong = hienTai.trang_thai === 'cho_tpkh_tiep_nhan'
      ? 'TPKH tự thực hiện & nộp kết quả'
      : 'TPKH phê duyệt kết quả & Chuyển TPKD';
  } else if (trangThaiMoi === 'cho_sale_nghiem_thu' || trangThaiMoi === 'da_phe_duyet') {
    tenHanhDong = 'TPKD phê duyệt kết quả & Bàn giao Sale';
  } else if (trangThaiMoi === 'da_hoan_thanh') {
    tenHanhDong = 'Sale nghiệm thu & Hoàn tất yêu cầu';
  } else if (trangThaiMoi === 'yeu_cau_chinh_sua') {
    tenHanhDong = 'Yêu cầu chỉnh sửa';
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
    capNhat.nguoi_nhan_id = danhSachNhanSuThucHien[0].id;
    capNhat.ten_nguoi_nhan = danhSachNhanSuThucHien[0].ho_va_ten;
    (capNhat as any).nguoi_thuc_hien_id = danhSachNhanSuThucHien[0].id;
    (capNhat as any).ten_nguoi_thuc_hien = danhSachNhanSuThucHien[0].ho_va_ten;
    (capNhat as any).nhan_su_thuc_hien_id = danhSachNhanSuThucHien[0].id;
  } else if (params.nguoiNhanMoiId) {
    capNhat.nguoi_nhan_id = params.nguoiNhanMoiId;
    capNhat.ten_nguoi_nhan = params.tenNguoiNhanMoi || null;
    capNhat.chuc_vu_nguoi_nhan = params.chucVuNguoiNhanMoi || null;
    capNhat.danh_sach_nhan_su_thuc_hien_ids = [params.nguoiNhanMoiId];
    capNhat.danh_sach_ten_nhan_su_thuc_hien = params.tenNguoiNhanMoi ? [params.tenNguoiNhanMoi] : [];
    (capNhat as any).nguoi_thuc_hien_id = params.nguoiNhanMoiId;
    (capNhat as any).ten_nguoi_thuc_hien = params.tenNguoiNhanMoi || null;
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

  // 3. TỰ ĐỘNG THỰC HIỆN TIẾN ĐỘ DỰ ÁN & KHO TÀI LIỆU
  const linkKetQuaThucTe = linkDriveKetQua?.trim() || hienTai.link_drive_ket_qua || null;

  // Việc 1: Ghi nhận cập nhật tiến độ dự án khi nộp kết quả hoặc khi kết quả được phê duyệt
  if (
    trangThaiMoi === 'cho_tpkh_duyet_ket_qua' ||
    trangThaiMoi === 'cho_tpkd_duyet_ket_qua' ||
    trangThaiMoi === 'cho_sale_nghiem_thu' ||
    trangThaiMoi === 'da_phe_duyet' ||
    trangThaiMoi === 'da_hoan_thanh'
  ) {
    void ghiNhanTienDoKhiChuyenBuoc(
      hienTai,
      trangThaiMoi,
      linkKetQuaThucTe,
      ghiChu || null,
      userId,
      userName,
      nowISO
    );
  }

  // Việc 2: Khi kết quả sau khi được phê duyệt -> tự động lưu tất cả link file vào kho tài liệu và chính mục tài liệu của dự án
  if (
    trangThaiMoi === 'cho_sale_nghiem_thu' ||
    trangThaiMoi === 'da_phe_duyet' ||
    trangThaiMoi === 'da_hoan_thanh'
  ) {
    void luuTaiLieuKetQuaKhiPheDuyet(
      hienTai,
      linkKetQuaThucTe,
      nguoiThucHien
    );
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
  if (dto.trang_thai !== undefined) patch.trang_thai = dto.trang_thai;
  if (dto.ghi_chu !== undefined) patch.ghi_chu_phan_hoi = dto.ghi_chu || null;

  const userId = dto.nguoiThucHien?.id || 'thanh_vien';
  const userName = dto.nguoiThucHien?.ho_va_ten || 'Người dùng';
  const hanhDong =
    dto.trang_thai === 'cho_tpkd_duyet'
      ? 'Sale hiệu chỉnh & gửi lại TPKD'
      : 'Cập nhật thông tin yêu cầu';

  const nhatKySua: NhatKyXuLyYeuCau = {
    id: `log_${Date.now()}`,
    thoi_gian: nowISO,
    nguoi_thuc_hien_id: userId,
    ten_nguoi_thuc_hien: userName,
    chuc_vu: (dto.nguoiThucHien as any)?.chuc_vu || null,
    vai_tro: dto.nguoiThucHien?.vai_tro || null,
    hanh_dong: hanhDong,
    ghi_chu: dto.ghi_chu || dto.noi_dung_yeu_cau || null,
    link_drive: dto.link_drive_dau_vao || null
  };

  const lichSuCu = Array.isArray(hienTai.lich_su_xu_ly) ? hienTai.lich_su_xu_ly : [];
  patch.lich_su_xu_ly = [...lichSuCu, nhatKySua];

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
