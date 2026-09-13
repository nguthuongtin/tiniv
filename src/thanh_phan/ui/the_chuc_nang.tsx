'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

export interface TheChucNangProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface TheChucNangHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface TheChucNangTieuDeProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface TheChucNangPhuDeProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface TheChucNangNoiDungProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface TheChucNangCuoiProps extends React.HTMLAttributes<HTMLDivElement> {}

export const The_Chuc_Nang = React.forwardRef<HTMLDivElement, TheChucNangProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-card)] border border-border bg-background shadow-[var(--shadow-card)]',
        className
      )}
      {...props}
    />
  )
);
The_Chuc_Nang.displayName = 'The_Chuc_Nang';

export const The_Chuc_Nang_Header = React.forwardRef<HTMLDivElement, TheChucNangHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
The_Chuc_Nang_Header.displayName = 'The_Chuc_Nang_Header';

export const The_Chuc_Nang_Tieu_De = React.forwardRef<HTMLHeadingElement, TheChucNangTieuDeProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight text-foreground', className)}
      {...props}
    />
  )
);
The_Chuc_Nang_Tieu_De.displayName = 'The_Chuc_Nang_Tieu_De';

export const The_Chuc_Nang_Phu_De = React.forwardRef<HTMLParagraphElement, TheChucNangPhuDeProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
The_Chuc_Nang_Phu_De.displayName = 'The_Chuc_Nang_Phu_De';

export const The_Chuc_Nang_Noi_Dung = React.forwardRef<HTMLDivElement, TheChucNangNoiDungProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
The_Chuc_Nang_Noi_Dung.displayName = 'The_Chuc_Nang_Noi_Dung';

export const The_Chuc_Nang_Cuoi = React.forwardRef<HTMLDivElement, TheChucNangCuoiProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
The_Chuc_Nang_Cuoi.displayName = 'The_Chuc_Nang_Cuoi';

export default The_Chuc_Nang;
export type { TheChucNangProps as The_Chuc_NangProps, TheChucNangHeaderProps as The_Chuc_Nang_HeaderProps };
