import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...gia_tri: ClassValue[]) => twMerge(clsx(gia_tri));

export default cn;
