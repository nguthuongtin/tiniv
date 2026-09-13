import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox, Search, AlertTriangle } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

type KieuTrong = 'mac_dinh' | 'tim_kiem' | 'loi';

const MAP_ICON: Record<KieuTrong, { Icon: LucideIcon; nhan: string; nhan_phu: string }> = {
  mac_dinh: { Icon: Inbox, nhan: 'Chưa có dữ liệu', nhan_phu: 'Thêm mục đầu tiên để bắt đầu' },
  tim_kiem: { Icon: Search, nhan: 'Không tìm thấy kết quả', nhan_phu: 'Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc' },
  loi: { Icon: AlertTriangle, nhan: 'Có lỗi xảy ra', nhan_phu: 'Thử tải lại hoặc liên hệ quản trị viên' }
};

export interface RongProps {
  kieu?: KieuTrong;
  nhan_tuy_chinh?: string;
  nhan_phu_tuy_chinh?: string;
  icon_tuy_chinh?: LucideIcon;
  hanh_dong?: React.ReactNode;
  className?: string;
}

export const Rong: React.FC<RongProps> = ({
  kieu = 'mac_dinh',
  nhan_tuy_chinh,
  nhan_phu_tuy_chinh,
  icon_tuy_chinh: IconTuyChinh,
  hanh_dong,
  className
}) => {
  const { Icon, nhan, nhan_phu } = MAP_ICON[kieu];
  const I = IconTuyChinh ?? Icon;
  return (
    <div
      className={cn(
        'flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-border bg-background p-8 text-center shadow-[var(--shadow-card)]',
        className
      )}
    >
      <div className="size-14 rounded-[var(--radius-card)] bg-muted text-muted-foreground flex items-center justify-center">
        <I className="size-7" />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">{nhan_tuy_chinh ?? nhan}</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {nhan_phu_tuy_chinh ?? nhan_phu}
        </p>
      </div>
      {hanh_dong ? <div className="mt-2">{hanh_dong}</div> : null}
    </div>
  );
};

export default Rong;
