'use client';

import type {
  BaoCaoTuanVDCD,
  CauHinhMucTieuBaoCaoTuan,
  TrangThaiBaoCaoTuanVDCD
} from '../../thu_vien/types/bao_cao_tuan_vdcd';

const STORAGE_BAO_CAO_KEY = 'ebms_bao_cao_tuan_vdcd_v1';
const STORAGE_KPI_KEY = 'ebms_kpi_bao_cao_tuan_vdcd_v1';

const docLocalBaoCao = (): Record<string, BaoCaoTuanVDCD> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_BAO_CAO_KEY);
    return raw ? (JSON.parse(raw) as Record<string, BaoCaoTuanVDCD>) : {};
  } catch {
    return {};
  }
};

const ghiLocalBaoCao = (item: BaoCaoTuanVDCD) => {
  if (typeof window === 'undefined') return;
  try {
    const all = docLocalBaoCao();
    all[item.id] = item;
    localStorage.setItem(STORAGE_BAO_CAO_KEY, JSON.stringify(all));
  } catch {}
};

const docLocalKPI = (): Record<string, CauHinhMucTieuBaoCaoTuan> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KPI_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CauHinhMucTieuBaoCaoTuan>) : {};
  } catch {
    return {};
  }
};

const ghiLocalKPI = (item: CauHinhMucTieuBaoCaoTuan) => {
  if (typeof window === 'undefined') return;
  try {
    const all = docLocalKPI();
    all[item.id] = item;
    localStorage.setItem(STORAGE_KPI_KEY, JSON.stringify(all));
  } catch {}
};

export async function layDanhSachBaoCaoTuanVDCD(tuan: string): Promise<BaoCaoTuanVDCD[]> {
  try {
    const res = await fetch(`/api/bao-cao-tuan-vdcd?tuan=${encodeURIComponent(tuan)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && Array.isArray(data.items)) {
        const items = (data.items as BaoCaoTuanVDCD[]).filter(
          (item) => item?.id && !item.id.startsWith('kpi_')
        );
        items.forEach((item) => ghiLocalBaoCao(item));
        return items;
      }
    }
  } catch (err) {
    console.warn('[layDanhSachBaoCaoTuanVDCD] Fallback localStorage:', err);
  }

  const localMap = docLocalBaoCao();
  return Object.values(localMap).filter(
    (item) => item && item.tuan === tuan && !item.id.startsWith('kpi_')
  );
}

export async function layMotBaoCaoTuanVDCD(
  tuan: string,
  nhanVienId: string
): Promise<BaoCaoTuanVDCD | null> {
  const id = `vdcd_${tuan}_${nhanVienId}`;

  try {
    const res = await fetch(`/api/bao-cao-tuan-vdcd?id=${encodeURIComponent(id)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok) {
        if (data.item) {
          const remote = data.item as BaoCaoTuanVDCD;
          ghiLocalBaoCao(remote);
          return remote;
        }
        return null;
      }
    }
  } catch (err) {
    console.warn('[layMotBaoCaoTuanVDCD] Fallback localStorage:', err);
  }

  return docLocalBaoCao()[id] || null;
}

export async function luuBaoCaoTuanVDCD(baoCao: BaoCaoTuanVDCD): Promise<BaoCaoTuanVDCD> {
  const payload: BaoCaoTuanVDCD = {
    ...baoCao,
    ngay_cap_nhat: new Date().toISOString()
  };

  const res = await fetch('/api/bao-cao-tuan-vdcd', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Không thể lưu báo cáo lên máy chủ. Vui lòng thử lại.');
  }

  const saved = (data.item as BaoCaoTuanVDCD) || payload;
  ghiLocalBaoCao(saved);
  return saved;
}

export async function duyetBaoCaoTuanVDCD(params: {
  baoCao: BaoCaoTuanVDCD;
  trangThai: TrangThaiBaoCaoTuanVDCD;
  nguoiDuyetId: string;
  tenNguoiDuyet: string;
  ghiChuQuanLy?: string | null;
}): Promise<BaoCaoTuanVDCD> {
  const now = new Date().toISOString();
  const capNhatCap1 =
    params.trangThai === 'cho_giam_doc_duyet'
      ? {
          nguoi_duyet_cap_1_id: params.nguoiDuyetId,
          ten_nguoi_duyet_cap_1: params.tenNguoiDuyet,
          ngay_duyet_cap_1: now
        }
      : {};

  return luuBaoCaoTuanVDCD({
    ...params.baoCao,
    ...capNhatCap1,
    trang_thai: params.trangThai,
    nguoi_duyet_id: params.nguoiDuyetId,
    ten_nguoi_duyet: params.tenNguoiDuyet,
    ngay_duyet: now,
    ghi_chu_quan_ly: params.ghiChuQuanLy ?? params.baoCao.ghi_chu_quan_ly ?? null,
    yeu_cau_mo_khoa: params.trangThai === 'can_dieu_chinh' ? null : params.baoCao.yeu_cau_mo_khoa ?? null
  });
}

export async function layCauHinhKPIBaoCaoTuan(
  phamViId: string
): Promise<CauHinhMucTieuBaoCaoTuan | null> {
  const id = `kpi_${phamViId}`;
  const localItem = docLocalKPI()[id] || null;

  try {
    const res = await fetch(`/api/bao-cao-tuan-vdcd?id=${encodeURIComponent(id)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && data.item) {
        const remote = data.item as CauHinhMucTieuBaoCaoTuan;
        ghiLocalKPI(remote);
        return remote;
      }
    }
  } catch {}

  return localItem;
}

export async function luuCauHinhKPIBaoCaoTuan(
  kpi: Omit<CauHinhMucTieuBaoCaoTuan, 'id' | 'ngay_cap_nhat'>
): Promise<CauHinhMucTieuBaoCaoTuan> {
  const payload: CauHinhMucTieuBaoCaoTuan = {
    ...kpi,
    id: `kpi_${kpi.pham_vi_id}`,
    ngay_cap_nhat: new Date().toISOString()
  };

  const res = await fetch('/api/bao-cao-tuan-vdcd', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Không thể lưu cấu hình KPI lên máy chủ.');
  }

  ghiLocalKPI(payload);
  return payload;
}
