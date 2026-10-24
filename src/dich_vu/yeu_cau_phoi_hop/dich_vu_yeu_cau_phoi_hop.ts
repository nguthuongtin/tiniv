'use client';

import type {
  YeuCauPhoiHop,
  TrangThaiYeuCauPhoiHop,
  NhatKyXuLyYeuCau
} from '../../thu_vien/types/yeu_cau_phoi_hop';
export type { YeuCauPhoiHop };

const LOCAL_STORAGE_KEY = 'ebms_yeu_cau_phoi_hop_cache_v3';

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

const docCacheLocal = (): YeuCauPhoiHop[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const ghiCacheLocal = (data: YeuCauPhoiHop[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const phatSuKienCapNhat = (yc?: YeuCauPhoiHop) => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ebms_cap_nhat_yeu_cau_phoi_hop', { detail: yc }));
    } catch {}
  }
};

export const danhSachYeuCauPhoiHop = async (
  dieuKien: DieuKienLocYeuCauPhoiHop = {}
): Promise<YeuCauPhoiHop[]> => {
  let danhSach: YeuCauPhoiHop[] = [];

  try {
    const params = new URLSearchParams();
    if (dieuKien.du_an_id) params.set('du_an_id', dieuKien.du_an_id);
    if (dieuKien.nguoi_tao_id) params.set('nguoi_tao_id', dieuKien.nguoi_tao_id);

    const res = await fetch(`/api/yeu-cau-phoi-hop?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.thanh_cong && Array.isArray(data.mang)) {
        const tuServer = data.mang as YeuCauPhoiHop[];
        const local = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
        const mapDoc = new Map<string, YeuCauPhoiHop>();
        local.forEach((x) => mapDoc.set(x.id, x));
        tuServer.forEach((x) => mapDoc.set(x.id, x));

        danhSach = Array.from(mapDoc.values());
        ghiCacheLocal(danhSach);
      } else {
        danhSach = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
      }
    } else {
      danhSach = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
    }
  } catch {
    danhSach = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
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
        x.noi_dung_yeu_cau.toLowerCase().includes(kw) ||
        x.ten_du_an.toLowerCase().includes(kw) ||
        (x.ten_khach_hang && x.ten_khach_hang.toLowerCase().includes(kw)) ||
        x.ten_nguoi_tao.toLowerCase().includes(kw)
    );
  }

  return danhSach.sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime());
};

export const langNgheYeuCauPhoiHop = (
  callback: (ds: YeuCauPhoiHop[]) => void
): (() => void) => {
  const docVaGui = () => {
    const ds = docCacheLocal().filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
    callback(ds.sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime()));
  };

  const taiServerVaCapNhat = async () => {
    try {
      const res = await fetch('/api/yeu-cau-phoi-hop');
      if (res.ok) {
        const data = await res.json();
        if (data?.thanh_cong && Array.isArray(data.mang)) {
          const tuServer = data.mang as YeuCauPhoiHop[];
          // Lấy server làm chuẩn tuyệt đối: mọi yêu cầu bị xóa trên server sẽ lập tức biến mất trên mọi máy
          ghiCacheLocal(tuServer);
          callback(tuServer.sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime()));
          return;
        }
      }
    } catch {}
    docVaGui();
  };

  // Đọc ngay từ cache
  docVaGui();
  // Tải lần đầu từ server
  void taiServerVaCapNhat();

  // Lắng nghe sự kiện cục bộ
  const handleCustomEvent = () => {
    docVaGui();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('ebms_cap_nhat_yeu_cau_phoi_hop', handleCustomEvent);
  }

  // Đồng bộ máy chủ định kỳ 3 giây để cập nhật tức thời khi người khác xóa hoặc sửa
  const intervalId = setInterval(() => {
    void taiServerVaCapNhat();
  }, 3000);

  return () => {
    clearInterval(intervalId);
    if (typeof window !== 'undefined') {
      window.removeEventListener('ebms_cap_nhat_yeu_cau_phoi_hop', handleCustomEvent);
    }
  };
};

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

  // 1. Lưu ngay vào local cache & phát sự kiện tức thời
  const cacheHienTai = docCacheLocal();
  ghiCacheLocal([yeuCauMoi, ...cacheHienTai.filter((x) => x.id !== idMoi)]);
  phatSuKienCapNhat(yeuCauMoi);

  // 2. Gửi qua API Server bằng Firebase Admin (không bao giờ bị lỗi permission)
  try {
    const res = await fetch('/api/yeu-cau-phoi-hop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yeuCauMoi)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.du_lieu) {
        return data.du_lieu;
      }
    }
  } catch (err) {
    console.warn('[taoYeuCauPhoiHopMoi] Lỗi gửi API, đã lưu cache local:', err);
  }

  return yeuCauMoi;
};

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

  const ds = await danhSachYeuCauPhoiHop();
  const hienTai = ds.find((x) => x.id === yeuCauId);
  if (!hienTai) return null;

  let tenHanhDong = 'Chuyển bước';
  if (trangThaiMoi === 'cho_khth_thuc_hien') {
    tenHanhDong = 'Tiếp nhận & Phân công';
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

  const yeuCauCapNhat: YeuCauPhoiHop = {
    ...hienTai,
    ...capNhat,
    lich_su_xu_ly: [...hienTai.lich_su_xu_ly, nhatKyMoi]
  };

  // Cập nhật local cache & phát sự kiện tức thì
  const localList = docCacheLocal();
  ghiCacheLocal(localList.map((x) => (x.id === yeuCauId ? yeuCauCapNhat : x)));
  phatSuKienCapNhat(yeuCauCapNhat);

  // Gửi qua API Server
  try {
    await fetch('/api/yeu-cau-phoi-hop', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: yeuCauId,
        ...capNhat,
        nhat_ky_moi: nhatKyMoi
      })
    });
  } catch (err) {
    console.warn('[chuyenBuocYeuCauPhoiHop] Lỗi gửi API, đã lưu cache local:', err);
  }

  return yeuCauCapNhat;
};

export const capNhatThongTinYeuCau = async (
  dto: CapNhatThongTinYeuCauDTO
): Promise<YeuCauPhoiHop | null> => {
  const ds = await danhSachYeuCauPhoiHop();
  const hienTai = ds.find((x) => x.id === dto.id);
  if (!hienTai) return null;

  const nowISO = new Date().toISOString();
  const yeuCauCapNhat: YeuCauPhoiHop = {
    ...hienTai,
    noi_dung_yeu_cau: dto.noi_dung_yeu_cau ?? hienTai.noi_dung_yeu_cau,
    link_drive_dau_vao: dto.link_drive_dau_vao !== undefined ? dto.link_drive_dau_vao : hienTai.link_drive_dau_vao,
    link_drive_ket_qua: dto.link_drive_ket_qua !== undefined ? dto.link_drive_ket_qua : hienTai.link_drive_ket_qua,
    han_hoan_thanh: dto.han_hoan_thanh !== undefined ? dto.han_hoan_thanh : hienTai.han_hoan_thanh,
    ngay_cap_nhat: nowISO
  };

  const localList = docCacheLocal();
  ghiCacheLocal(localList.map((x) => (x.id === dto.id ? yeuCauCapNhat : x)));
  phatSuKienCapNhat(yeuCauCapNhat);

  try {
    await fetch('/api/yeu-cau-phoi-hop', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: dto.id,
        noi_dung_yeu_cau: dto.noi_dung_yeu_cau,
        link_drive_dau_vao: dto.link_drive_dau_vao,
        link_drive_ket_qua: dto.link_drive_ket_qua,
        han_hoan_thanh: dto.han_hoan_thanh
      })
    });
  } catch {}

  return yeuCauCapNhat;
};

export const xoaYeuCauPhoiHop = async (
  yeuCauId: string,
  nguoiThucHien?: { id: string; ho_va_ten?: string | null; [key: string]: any } | null
): Promise<boolean> => {
  const localList = docCacheLocal();
  ghiCacheLocal(localList.filter((x) => x.id !== yeuCauId));
  phatSuKienCapNhat();

  try {
    const params = new URLSearchParams({ id: yeuCauId });
    if (nguoiThucHien?.id) {
      params.append('nguoi_xoa_id', nguoiThucHien.id);
    }
    const res = await fetch(`/api/yeu-cau-phoi-hop?${params.toString()}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData?.thong_diep) {
        throw new Error(errData.thong_diep);
      }
    }
  } catch (err: any) {
    console.warn('[xoaYeuCauPhoiHop] Lỗi xóa yêu cầu:', err);
    throw err;
  }

  return true;
};
