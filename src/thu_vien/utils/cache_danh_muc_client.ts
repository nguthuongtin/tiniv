export type LoaiDanhMucCache = 'chi_nhanh' | 'phong_ban' | 'nhan_su' | 'san_pham_dich_vu';

export async function layDanhMucTuServerCache(loai: LoaiDanhMucCache): Promise<any[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(`/api/danh-muc-chung?loai=${encodeURIComponent(loai)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.ok && Array.isArray(data.items)) return data.items;
    return null;
  } catch {
    return null;
  }
}

export function xoaCacheServerDanhMuc(loai: LoaiDanhMucCache): void {
  if (typeof window === 'undefined') return;
  void fetch(`/api/danh-muc-chung?loai=${encodeURIComponent(loai)}`, { method: 'DELETE' }).catch(() => {});
}
