'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrangBanLamViec() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/lich-cong-tac');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-8 text-center text-xs text-muted-foreground">
      Đang chuyển hướng sang Lịch làm việc...
    </div>
  );
}
