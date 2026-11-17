'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrangKeHoachNVKD() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/lich-cong-tac');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-8 text-center text-xs text-slate-400">
      Đang chuyển hướng sang Lịch làm việc...
    </div>
  );
}
