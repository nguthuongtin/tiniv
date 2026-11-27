'use client';

import type {
  BaoCaoTuanVDCD,
  CauHinhMucTieuBaoCaoTuan,
  TrangThaiBaoCaoTuanVDCD
} from '../../thu_vien/types/bao_cao_tuan_vdcd';

export async function layDanhSachBaoCaoTuanVDCD(tuan: string): Promise<BaoCaoTuanVDCD[]> {
  const res = await fetch(`/api/bao-cao-tuan-vdcd?tuan=${encodeURIComponent(tuan)}`, {
    cache: 'no-store'
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
    throw new Error(data?.error || 'Không thể tải danh sách báo cáo tuần từ Firestore.');
  }
  return (data.items as BaoCaoTuanVDCD[]).filter(
    (item) => item?.id && !item.id.startsWith('kpi_')
  );
}

export async function layMotBaoCaoTuanVDCD(
  tuan: string,
  nhanVienId: string
): Promise<BaoCaoTuanVDCD | null> {
  const id = `vdcd_${tuan}_${nhanVienId}`;
  const res = await fetch(`/api/bao-cao-tuan-vdcd?id=${encodeURIComponent(id)}`, {
    cache: 'no-store'
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Không thể tải báo cáo tuần từ Firestore.');
  }
  return (data.item as BaoCaoTuanVDCD) || null;
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
    throw new Error(data?.error || 'Không thể lưu báo cáo lên Firestore. Vui lòng thử lại.');
  }

  return (data.item as BaoCaoTuanVDCD) || payload;
}

export async function duyetBaoCaoTuanVDCD(params: {
  baoCao: BaoCaoTuanVDCD;
  phanDuyet?: 'bao_cao' | 'ke_hoach';
  trangThai: TrangThaiBaoCaoTuanVDCD;
  nguoiDuyetId: string;
  tenNguoiDuyet: string;
  ghiChuQuanLy?: string | null;
}): Promise<BaoCaoTuanVDCD> {
  const now = new Date().toISOString();
  const phan = params.phanDuyet || 'bao_cao';

  if (phan === 'ke_hoach') {
    const capNhatCap1 =
      params.trangThai === 'cho_giam_doc_duyet'
        ? {
            nguoi_duyet_ke_hoach_cap_1_id: params.nguoiDuyetId,
            ten_nguoi_duyet_ke_hoach_cap_1: params.tenNguoiDuyet,
            ngay_duyet_ke_hoach_cap_1: now
          }
        : {};

    return luuBaoCaoTuanVDCD({
      ...params.baoCao,
      ...capNhatCap1,
      trang_thai_ke_hoach: params.trangThai,
      nguoi_duyet_ke_hoach_id: params.nguoiDuyetId,
      ten_nguoi_duyet_ke_hoach: params.tenNguoiDuyet,
      ngay_duyet_ke_hoach: now,
      ghi_chu_ke_hoach: params.ghiChuQuanLy ?? params.baoCao.ghi_chu_ke_hoach ?? null,
      yeu_cau_mo_khoa_ke_hoach:
        params.trangThai === 'can_dieu_chinh' ? null : params.baoCao.yeu_cau_mo_khoa_ke_hoach ?? null
    });
  }

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
  const res = await fetch(`/api/bao-cao-tuan-vdcd?id=${encodeURIComponent(id)}`, {
    cache: 'no-store'
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) return null;
  return (data.item as CauHinhMucTieuBaoCaoTuan) || null;
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
    throw new Error(data?.error || 'Không thể lưu cấu hình KPI lên Firestore.');
  }

  return payload;
}
