"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  FolderKanban,
  Users,
  Phone,
  ExternalLink,
  Plus,
  Search,
  X,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle,
  Maximize,
  Minimize,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export interface DuAnLienKet {
  id: string;
  ten_du_an: string;
  giai_doan?: string;
  tong_muc_dau_tu?: number;
}

export interface NguoiLienHeLienKet {
  id: string;
  ho_va_ten: string;
  chuc_vu?: string | null;
  so_dien_thoai?: string | null;
  email?: string | null;
}

export interface CommuneCRMData {
  id: string; // Khóa duy nhất (ma_xa chuẩn 5 chữ số)
  ma_xa?: string;
  ten_xa?: string;
  ten_tinh?: string;
  ma_tinh?: string;
  ten_day_du?: string;
  sale_name: string;
  sale_id?: string;
  revenue: number;
  households: number;
  area_km2: number;
  dan_so?: number;
  reach_status: 'Chưa tiếp cận' | 'Đang chăm sóc' | 'Đã chốt';
  notes?: string;
  khach_hang_id?: string;
  danh_sach_du_an: DuAnLienKet[];
  danh_sach_nguoi_lien_he: NguoiLienHeLienKet[];
}

export interface NhanSuSale {
  id: string;
  ho_va_ten: string;
  ten_rut_gon?: string;
}

interface MapProps {
  crmData: CommuneCRMData[];
  onUpdateCRM: (
    id: string,
    newStatus: CommuneCRMData['reach_status'],
    newNotes: string,
    newSaleId?: string,
    newSaleName?: string
  ) => Promise<void> | void;
  danhSachSale?: NhanSuSale[];
  selectedProvince?: string;
  onSelectProvince?: (province: string) => void;
}

// Danh sách 33 tên xã bị trùng lặp trên 5 tỉnh Miền Tây
export const DANH_SACH_XA_TRUNG_TEN = new Set([
  'an bình', 'bình phú', 'châu thành', 'long bình', 'long hưng',
  'tân hòa', 'tân long', 'tân phú', 'tân thành', 'tân thạnh',
  'thạnh phú', 'thới sơn', 'trường xuân', 'vĩnh bình', 'đông hải',
  'hòa bình', 'hòa thuận', 'hưng mỹ', 'mỹ thuận', 'phong thạnh',
  'phú tân', 'phước long', 'tân an', 'khánh bình', 'long điền',
  'long phú', 'nhơn mỹ', 'phú hữu', 'vĩnh hậu', 'vĩnh trạch',
  'tân lộc', 'vĩnh lợi', 'vĩnh phước'
]);

// Màu badge phân biệt trực quan từng Tỉnh thành
export const PROVINCE_BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'An Giang': { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-700/60' },
  'Cần Thơ': { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-700/60' },
  'Đồng Tháp': { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-700/60' },
  'Vĩnh Long': { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-700/60' },
  'Cà Mau': { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-700/60' },
};

export const SALE_COLORS: Record<string, string> = {
  'Huỳnh Hoàng Bá': '#3b82f6',
  'Huỳnh Thị Thanh Ngân': '#10b981',
  'Lương Thị Cẩm Tú': '#f59e0b',
  'Nguyễn Văn Cường Em': '#8b5cf6',
  'Chưa gán': '#475569',
};

const DEFAULT_COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6',
  '#a855f7', '#eab308'
];

export function layMauSale(name: string): string {
  if (!name || name === 'Chưa gán') return '#475569';
  if (SALE_COLORS[name]) return SALE_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % DEFAULT_COLOR_PALETTE.length;
  return DEFAULT_COLOR_PALETTE[idx];
}

// Hàm rút ngắn tên nhân viên gọn gàng (1 - 2 từ cuối)
export function rutGonTen(hoVaTen: string): string {
  if (!hoVaTen) return '';
  const parts = hoVaTen.trim().split(/\s+/);
  if (parts.length <= 1) return hoVaTen;
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  if (['em', 'bé', 'anh', 'con'].includes(last.toLowerCase())) {
    return `${secondLast} ${last}`;
  }
  if (!['thị', 'văn', 'đình', 'hữu', 'ngọc', 'thanh'].includes(secondLast.toLowerCase())) {
    return `${secondLast} ${last}`;
  }
  return last;
}

export const PROVINCES_LIST = [
  'All',
  'An Giang',
  'Cần Thơ',
  'Đồng Tháp',
  'Vĩnh Long',
  'Cà Mau',
] as const;

export const PROVINCE_CONFIG: Record<string, { center: [number, number]; zoom: number }> = {
  'All': { center: [105.3, 9.85], zoom: 7.8 },
  'An Giang': { center: [104.52, 10.11], zoom: 9.0 },
  'Cần Thơ': { center: [105.76, 9.80], zoom: 9.2 },
  'Đồng Tháp': { center: [106.00, 10.55], zoom: 9.1 },
  'Vĩnh Long': { center: [106.24, 9.93], zoom: 9.2 },
  'Cà Mau': { center: [105.19, 9.03], zoom: 9.0 },
};

const layMapboxToken = (): string => {
  if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN && process.env.NEXT_PUBLIC_MAPBOX_TOKEN.trim() !== '') {
    return process.env.NEXT_PUBLIC_MAPBOX_TOKEN.trim();
  }
  const b64 = 'cGsuZXlKMUlqb2libWQxZEdoMWIyNW5kR2x1SWl3aVlTSTZJbU50ZGpGMmRHUjVZVEJoYXpneWQyOWthak5xYVhZM1pHMGlmUS5RQ2lSWTZwTFp5bDI5eEd4QzBoMER3';
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    try {
      return window.atob(b64);
    } catch {
      return '';
    }
  }
  return '';
};

interface CommuneGeomInfo {
  center: [number, number];
  bbox: [number, number, number, number];
  featureId: string;
  properties: any;
}

function tinhToaDoXa(feature: any, idx: number): CommuneGeomInfo {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  let sumLng = 0, sumLat = 0, count = 0;

  function duyetToaDo(coords: any) {
    if (!coords) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const lng = coords[0];
      const lat = coords[1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      sumLng += lng;
      sumLat += lat;
      count++;
    } else if (Array.isArray(coords)) {
      for (let i = 0; i < coords.length; i++) {
        duyetToaDo(coords[i]);
      }
    }
  }

  duyetToaDo(feature.geometry?.coordinates);
  const center: [number, number] = count > 0 ? [sumLng / count, sumLat / count] : [105.15, 10.52];
  const bbox: [number, number, number, number] = [minLng, minLat, maxLng, maxLat];

  return {
    center,
    bbox,
    featureId: String(feature.properties?.ma_xa || feature.id || idx),
    properties: feature.properties || {},
  };
}

export default function Map3D({
  crmData,
  onUpdateCRM,
  danhSachSale = [],
  selectedProvince = 'All',
  onSelectProvince,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [activeToken] = useState<string>(() => layMapboxToken());
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // States
  const [selectedFeature, setSelectedFeature] = useState<CommuneCRMData | null>(null);
  const [hoveredCommune, setHoveredCommune] = useState<CommuneCRMData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [filterSale, setFilterSale] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Geometry cache (Key: ma_xa độc nhất)
  const communeGeomRef = useRef<Map<string, CommuneGeomInfo>>(new Map());
  const selectedIdRef = useRef<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // State Tìm Kiếm Nhanh
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // State mở Bottom Sheet bộ lọc trên Mobile
  const [moBoLocMobile, setMoBoLocMobile] = useState(false);

  // Form cập nhật
  const [editStatus, setEditStatus] = useState<CommuneCRMData['reach_status']>('Chưa tiếp cận');
  const [editNotes, setEditNotes] = useState('');
  const [editSaleId, setEditSaleId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Xử lý sự kiện Fullscreen
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        }
      } catch (err) {
        console.error('Lỗi khi bật toàn màn hình:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.error('Lỗi khi thoát toàn màn hình:', err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 150);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Đóng dropdown tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchRef.current && searchRef.current.contains(target);
      const insideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Danh sách nhân viên phòng kinh doanh hiển thị
  const salesList = useMemo(() => {
    if (danhSachSale && danhSachSale.length > 0) {
      return danhSachSale.map((s) => s.ho_va_ten);
    }
    const defaultSales = ['Huỳnh Hoàng Bá', 'Huỳnh Thị Thanh Ngân', 'Lương Thị Cẩm Tú', 'Nguyễn Văn Cường Em'];
    const dynamic = new Set<string>(defaultSales);
    crmData.forEach((c) => {
      if (c.sale_name && c.sale_name !== 'Chưa gán') dynamic.add(c.sale_name);
    });
    return Array.from(dynamic);
  }, [danhSachSale, crmData]);

  // Danh sách gợi ý tìm kiếm: LUÔN HIỂN THỊ RÕ TỈNH THÀNH ĐỂ PHÂN BIỆT XÃ TRÙNG TÊN
  const filteredSearchList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return crmData
      .filter((c) => {
        const passProvince = selectedProvince === 'All' || c.ten_tinh === selectedProvince;
        if (!passProvince) return false;
        const matchCode = c.id.toLowerCase().includes(q) || (c.ma_xa && c.ma_xa.includes(q));
        const matchName = c.ten_xa && c.ten_xa.toLowerCase().includes(q);
        const matchProv = c.ten_tinh && c.ten_tinh.toLowerCase().includes(q);
        const matchSale = c.sale_name.toLowerCase().includes(q);
        return matchCode || matchName || matchProv || matchSale;
      })
      .slice(0, 12);
  }, [searchQuery, crmData, selectedProvince]);

  // Thống kê số lượng xã phụ trách của từng bạn Sale
  const saleStats = useMemo(() => {
    const counts: Record<string, number> = {};
    crmData.forEach((item) => {
      const passProvince = selectedProvince === 'All' || item.ten_tinh === selectedProvince;
      if (passProvince && item.sale_name && item.sale_name !== 'Chưa gán') {
        counts[item.sale_name] = (counts[item.sale_name] || 0) + 1;
      }
    });
    return counts;
  }, [crmData, selectedProvince]);

  const crmDataRef = useRef(crmData);
  useEffect(() => {
    crmDataRef.current = crmData;
  }, [crmData]);

  // Hàm chọn và tự động zoom + định vị đến xã bằng MÃ XÃ DUY NHẤT
  const chonVaDinhViXa = (maXa: string, provinceHint?: string) => {
    const map = mapRef.current;

    // 1. Tìm thông tin hình học: ưu tiên tuyệt đối theo ma_xa
    let geomInfo = communeGeomRef.current.get(maXa);
    if (!geomInfo && provinceHint) {
      geomInfo = communeGeomRef.current.get(`${maXa.toLowerCase()}_${provinceHint.toLowerCase()}`);
    }
    if (!geomInfo) {
      geomInfo = communeGeomRef.current.get(maXa.toLowerCase());
    }

    // 2. Tìm dữ liệu CRM theo mã xã
    const matched = crmDataRef.current.find(
      (c) =>
        c.id === maXa ||
        c.ma_xa === maXa ||
        (c.ten_xa?.toLowerCase() === maXa.toLowerCase() &&
          (!provinceHint || c.ten_tinh?.toLowerCase() === provinceHint.toLowerCase()))
    );

    if (map && geomInfo) {
      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          { source: 'mientay-communes', id: selectedIdRef.current },
          { selected: false }
        );
      }
      selectedIdRef.current = geomInfo.featureId;
      map.setFeatureState(
        { source: 'mientay-communes', id: geomInfo.featureId },
        { selected: true }
      );

      const [minLng, minLat, maxLng, maxLat] = geomInfo.bbox;
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: {
            top: typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 70,
            bottom: typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 70,
            left: typeof window !== 'undefined' && window.innerWidth < 640 ? 24 : 70,
            right: typeof window !== 'undefined' && window.innerWidth > 1024 ? 420 : 70,
          },
          maxZoom: 13,
          duration: 1200,
        }
      );
    }

    if (matched) {
      setSelectedFeature(matched);
      setEditStatus(matched.reach_status);
      setEditNotes(matched.notes || '');
      setEditSaleId(matched.sale_id || '');
    } else if (geomInfo) {
      const props = geomInfo.properties;
      const loai = props.loai ? props.loai.toUpperCase() : 'XÃ';
      const fallbackData: CommuneCRMData = {
        id: props.ma_xa || maXa,
        ma_xa: props.ma_xa,
        ten_xa: props.ten_xa,
        ten_tinh: props.ten_tinh,
        ma_tinh: props.ma_tinh,
        ten_day_du: `UBND ${loai} ${props.ten_xa?.toUpperCase()} - TỈNH ${props.ten_tinh?.toUpperCase()}`,
        sale_name: 'Chưa gán',
        revenue: 0,
        households: props.dan_so ? Math.round(Number(props.dan_so) / 4) : 0,
        area_km2: props.dtich_km2 ? Number(props.dtich_km2) : 0,
        dan_so: props.dan_so ? Number(props.dan_so) : 0,
        reach_status: 'Chưa tiếp cận',
        notes: '',
        danh_sach_du_an: [],
        danh_sach_nguoi_lien_he: [],
      };
      setSelectedFeature(fallbackData);
      setEditStatus('Chưa tiếp cận');
      setEditNotes('');
      setEditSaleId('');
    }
  };

  const dongDrawer = () => {
    const map = mapRef.current;
    if (map && selectedIdRef.current !== null) {
      map.setFeatureState(
        { source: 'mientay-communes', id: selectedIdRef.current },
        { selected: false }
      );
      selectedIdRef.current = null;
    }
    setSelectedFeature(null);
    setSaveSuccess(false);
  };

  const resetMapView = () => {
    dongDrawer();
    setSearchQuery('');
    setIsSearching(false);
    const map = mapRef.current;
    if (!map) return;
    const cfg = PROVINCE_CONFIG[selectedProvince] || PROVINCE_CONFIG['All'];
    map.flyTo({
      center: cfg.center,
      zoom: cfg.zoom,
      duration: 1000,
    });
  };

  // Khởi tạo bản đồ Mapbox
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const token = activeToken || layMapboxToken();
      if (!token) {
        setMapError('Chưa có mã truy cập (token) Mapbox để hiển thị bản đồ.');
        return;
      }
      mapboxgl.accessToken = token;

      const initialCfg = PROVINCE_CONFIG[selectedProvince] || PROVINCE_CONFIG['All'];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: initialCfg.center,
        zoom: initialCfg.zoom,
        pitch: 0,
        bearing: 0,
        antialias: true,
      });

      mapRef.current = map;

      map.on('load', async () => {
        try {
          map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

          // Tải đồng thời GeoJSON Xã Miền Tây và GeoJSON Tỉnh Miền Tây
          const [geoCommunes, geoProvinces] = await Promise.all([
            fetch('/mientay.geojson').then((r) => r.json()),
            fetch('/mientay_tinh.geojson').then((r) => r.json()),
          ]);

          const geomMap = new Map<string, CommuneGeomInfo>();
          geoCommunes.features.forEach((f: any, idx: number) => {
            const info = tinhToaDoXa(f, idx);
            const code = String(f.properties?.ma_xa || '').trim();
            const name = (f.properties?.ten_xa || '').trim().toLowerCase();
            const prov = (f.properties?.ten_tinh || '').trim().toLowerCase();

            // 1. Khóa chính xác tuyệt đối: mã xã
            if (code) geomMap.set(code, info);

            // 2. Khóa kép: tên xã + tỉnh
            if (name && prov) {
              geomMap.set(`${name}_${prov}`, info);
              geomMap.set(`${name} - ${prov}`, info);
            }

            // 3. Khóa tên đơn: CHỈ gán nếu tên xã này KHÔNG BỊ TRÙNG LẶP trên các tỉnh
            if (name && !geomMap.has(name) && !DANH_SACH_XA_TRUNG_TEN.has(name)) {
              geomMap.set(name, info);
            }
          });
          communeGeomRef.current = geomMap;

          // Source xã phường (promoteId 'ma_xa' để feature-state dùng ma_xa duy nhất)
          if (!map.getSource('mientay-communes')) {
            map.addSource('mientay-communes', {
              type: 'geojson',
              data: geoCommunes,
              generateId: true,
              promoteId: 'ma_xa',
            });
          }

          // Source ranh giới tỉnh
          if (!map.getSource('mientay-provinces')) {
            map.addSource('mientay-provinces', {
              type: 'geojson',
              data: geoProvinces,
            });
          }

          // 1. Layer tô màu xã phường
          if (!map.getLayer('communes-fill')) {
            map.addLayer({
              id: 'communes-fill',
              type: 'fill',
              source: 'mientay-communes',
              paint: {
                'fill-color': '#475569',
                'fill-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.85,
                  0.65,
                ],
              },
            });
          }

          // 2. Layer viền ranh giới xã
          if (!map.getLayer('communes-border')) {
            map.addLayer({
              id: 'communes-border',
              type: 'line',
              source: 'mientay-communes',
              paint: {
                'line-color': '#64748b',
                'line-width': 0.8,
                'line-opacity': 0.35,
              },
            });
          }

          // 3. Layer viền ranh giới cấp TỈNH (nổi bật, rõ nét)
          if (!map.getLayer('provinces-border')) {
            map.addLayer({
              id: 'provinces-border',
              type: 'line',
              source: 'mientay-provinces',
              paint: {
                'line-color': '#38bdf8',
                'line-width': 2.2,
                'line-opacity': 0.8,
              },
            });
          }

          // 4. Layer đường viền sáng khi được chọn (Highlight)
          if (!map.getLayer('communes-highlight')) {
            map.addLayer({
              id: 'communes-highlight',
              type: 'line',
              source: 'mientay-communes',
              paint: {
                'line-color': '#38bdf8',
                'line-width': [
                  'case',
                  ['boolean', ['feature-state', 'selected'], false],
                  3.5,
                  0,
                ],
              },
            });
          }

          // 5. Layer nhãn TÊN TỈNH (Hiển thị khi zoom bao quát < 9.2)
          if (!map.getLayer('provinces-labels')) {
            map.addLayer({
              id: 'provinces-labels',
              type: 'symbol',
              source: 'mientay-provinces',
              maxzoom: 9.2,
              layout: {
                'text-field': ['get', 'ten_tinh'],
                'text-size': 13,
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.1,
                'text-allow-overlap': true,
              },
              paint: {
                'text-color': '#7dd3fc',
                'text-halo-color': '#020617',
                'text-halo-width': 2.5,
              },
            });
          }

          // 6. Layer nhãn TÊN XÃ/PHƯỜNG (Hiển thị khi zoom sâu >= 9.2)
          if (!map.getLayer('communes-labels')) {
            map.addLayer({
              id: 'communes-labels',
              type: 'symbol',
              source: 'mientay-communes',
              minzoom: 9.2,
              layout: {
                'text-field': ['get', 'ten_xa'],
                'text-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  9.2, 9,
                  10.5, 11,
                  12, 13,
                  14, 16,
                ],
                'text-variable-anchor': ['center', 'top', 'bottom', 'left', 'right'],
                'text-justify': 'auto',
                'text-allow-overlap': false,
                'text-ignore-placement': false,
              },
              paint: {
                'text-color': '#ffffff',
                'text-halo-color': '#020617',
                'text-halo-width': 2.2,
                'text-halo-blur': 0.5,
              },
            });
          }

          setMapLoaded(true);
        } catch (err) {
          console.error('Lỗi nạp dữ liệu bản đồ:', err);
        }
      });

      let hoveredId: string | null = null;
      let selectedId: string | null = null;

      // Xử lý di chuột (Hover Tooltip)
      map.on('mousemove', 'communes-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties || {};
          const maXa = String(props.ma_xa || feature.id || '').trim();

          if (hoveredId !== null) {
            map.setFeatureState({ source: 'mientay-communes', id: hoveredId }, { hover: false });
          }
          hoveredId = maXa || null;
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'mientay-communes', id: hoveredId }, { hover: true });
          }

          // Khớp dữ liệu CRM CHÍNH XÁC theo mã xã
          const matched = crmDataRef.current.find((c) => c.id === maXa || c.ma_xa === maXa);

          if (matched) {
            setHoveredCommune(matched);
          } else {
            setHoveredCommune({
              id: maXa,
              ma_xa: maXa,
              ten_xa: props.ten_xa,
              ten_tinh: props.ten_tinh,
              sale_name: 'Chưa gán',
              revenue: 0,
              households: props.dan_so ? Math.round(Number(props.dan_so) / 4) : 0,
              area_km2: props.dtich_km2 ? Number(props.dtich_km2) : 0,
              dan_so: props.dan_so ? Number(props.dan_so) : 0,
              reach_status: 'Chưa tiếp cận',
              danh_sach_du_an: [],
              danh_sach_nguoi_lien_he: [],
            });
          }
          setTooltipPos({ x: e.point.x, y: e.point.y });
        }
      });

      map.on('mouseleave', 'communes-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'mientay-communes', id: hoveredId }, { hover: false });
        }
        hoveredId = null;
        setHoveredCommune(null);
        setTooltipPos(null);
      });

      // Xử lý bấm chọn xã (Click)
      map.on('click', 'communes-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties || {};
        const maXa = String(props.ma_xa || feature.id || '').trim();
        const tenXa = (props.ten_xa || '').trim();
        const tenTinh = (props.ten_tinh || '').trim();

        if (selectedId !== null) {
          map.setFeatureState({ source: 'mientay-communes', id: selectedId }, { selected: false });
        }
        selectedId = maXa || null;
        selectedIdRef.current = selectedId;
        if (selectedId !== null) {
          map.setFeatureState({ source: 'mientay-communes', id: selectedId }, { selected: true });
        }
        setSearchQuery(`${tenXa} (${tenTinh})`);

        // Tìm chính xác theo mã xã
        const matched = crmDataRef.current.find((c) => c.id === maXa || c.ma_xa === maXa);

        setSaveSuccess(false);
        if (matched) {
          setSelectedFeature(matched);
          setEditStatus(matched.reach_status);
          setEditNotes(matched.notes || '');
          setEditSaleId(matched.sale_id || '');
        } else {
          const loai = props.loai ? props.loai.toUpperCase() : 'XÃ';
          const fallbackData: CommuneCRMData = {
            id: maXa,
            ma_xa: maXa,
            ten_xa: tenXa,
            ten_tinh: tenTinh,
            ma_tinh: String(props.ma_tinh || ''),
            ten_day_du: `UBND ${loai} ${tenXa.toUpperCase()} - TỈNH ${tenTinh.toUpperCase()}`,
            sale_name: 'Chưa gán',
            revenue: 0,
            households: props.dan_so ? Math.round(Number(props.dan_so) / 4) : 0,
            area_km2: props.dtich_km2 ? Number(props.dtich_km2) : 0,
            dan_so: props.dan_so ? Number(props.dan_so) : 0,
            reach_status: 'Chưa tiếp cận',
            notes: '',
            danh_sach_du_an: [],
            danh_sach_nguoi_lien_he: [],
          };
          setSelectedFeature(fallbackData);
          setEditStatus('Chưa tiếp cận');
          setEditNotes('');
          setEditSaleId('');
        }
      });

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
        setMapLoaded(false);
      };
    } catch (err: any) {
      console.error('Lỗi Map:', err);
      setMapError(err?.message || 'Không thể khởi tạo bản đồ.');
    }
  }, [activeToken]);

  // Cập nhật vị trí camera khi đổi Tỉnh
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const cfg = PROVINCE_CONFIG[selectedProvince] || PROVINCE_CONFIG['All'];
    map.flyTo({
      center: cfg.center,
      zoom: cfg.zoom,
      duration: 900,
    });
  }, [selectedProvince, mapLoaded]);

  // Cập nhật màu sắc 2D theo Sale, Trạng thái và Tỉnh
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer('communes-fill')) return;

    const colorExpr: any[] = ['match', ['get', 'ma_xa']];

    crmData.forEach((item) => {
      const passSale = filterSale === 'All' || item.sale_name === filterSale;
      const passStatus = filterStatus === 'All' || item.reach_status === filterStatus;
      const passProvince = selectedProvince === 'All' || item.ten_tinh === selectedProvince;

      if (!passSale || !passStatus || !passProvince) {
        colorExpr.push(item.id, '#1e293b');
        return;
      }

      const color = layMauSale(item.sale_name);
      colorExpr.push(item.id, color);
    });

    colorExpr.push('#334155');

    map.setPaintProperty('communes-fill', 'fill-color', colorExpr as any);
  }, [crmData, filterSale, filterStatus, selectedProvince, mapLoaded]);

  // Cắm cờ VDCD vào các xã/phường đã có dự án
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Xóa cờ cũ trước khi vẽ lại
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Lọc danh sách xã có dự án theo tỉnh đang chọn
    const xaCoDuAn = crmData.filter((item) => {
      const passProvince = selectedProvince === 'All' || item.ten_tinh === selectedProvince;
      return passProvince && item.danh_sach_du_an && item.danh_sach_du_an.length > 0;
    });

    xaCoDuAn.forEach((item) => {
      let geom = communeGeomRef.current.get(item.id);
      if (!geom && item.ma_xa) {
        geom = communeGeomRef.current.get(item.ma_xa);
      }
      if (!geom && item.ten_xa && item.ten_tinh) {
        geom = communeGeomRef.current.get(`${item.ten_xa.toLowerCase()}_${item.ten_tinh.toLowerCase()}`);
      }
      if (!geom) return;

      const [lng, lat] = geom.center;
      const count = item.danh_sach_du_an.length;

      // Tạo HTML marker cây cờ VDCD với Logo chính thức từ /logo.png
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer select-none transition-transform hover:scale-125 z-10';
      el.setAttribute('title', `${item.ten_xa} (${item.ten_tinh}): ${count} dự án VDCD (Nhấp để xem chi tiết)`);

      el.innerHTML = `
        <div style="display: flex; align-items: flex-end; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8)); pointer-events: auto;">
          <!-- Cán cờ thẳng đứng -->
          <div style="width: 2.5px; height: 32px; background: linear-gradient(to bottom, #fde047, #e2e8f0, #ca8a04); border-radius: 9999px; position: relative;">
            <div style="position: absolute; top: -3px; left: -2.5px; width: 7.5px; height: 7.5px; border-radius: 9999px; background: #eab308; border: 1px solid #fef08a; box-shadow: 0 0 5px rgba(234,179,8,0.9);"></div>
          </div>
          <!-- Lá cờ nền trắng ngà viền vàng kim gắn Logo VDCD -->
          <div style="position: relative; margin-left: -1px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; background: #ffffff; padding: 2px 5px; border-radius: 0 4px 4px 0; border: 1.5px solid #eab308; border-left: none; box-shadow: 0 3px 8px rgba(0,0,0,0.5);">
            <img src="/logo.png" alt="Logo VDCD" style="height: 18px; width: auto; max-width: 44px; object-fit: contain; display: block;" />
            ${count > 1 ? `<span style="position: absolute; top: -6px; right: -6px; background: #dc2626; color: #ffffff; font-size: 9px; font-weight: 800; padding: 1px 4.5px; border-radius: 9999px; line-height: 1; border: 1.5px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">${count}</span>` : ''}
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        chonVaDinhViXa(item.id, item.ten_tinh);
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom-left',
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [crmData, selectedProvince, mapLoaded]);

  // Lưu thông tin & gán nhân sự phụ trách
  const handleSaveCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature) return;

    setIsSaving(true);
    try {
      const selectedSaleObj = danhSachSale?.find((s) => s.id === editSaleId);
      const newSaleName = selectedSaleObj ? selectedSaleObj.ho_va_ten : 'Chưa gán';

      await onUpdateCRM(
        selectedFeature.id,
        editStatus,
        editNotes,
        editSaleId || undefined,
        newSaleName
      );

      setSelectedFeature((prev) =>
        prev
          ? {
              ...prev,
              reach_status: editStatus,
              notes: editNotes,
              sale_id: editSaleId || undefined,
              sale_name: newSaleName,
            }
          : null
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Lỗi khi lưu CRM địa bàn:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none min-h-screen' : 'min-h-[350px]'
      }`}
    >
      {/* 1. THANH ĐIỀU KHIỂN & BỘ LỌC BÊN TRONG BẢN ĐỒ (1 DÒNG DUY NHẤT) */}
      <div className="hidden sm:flex z-20 bg-slate-900/95 backdrop-blur-md px-3 py-2 border-b border-slate-800 items-center justify-between gap-3 text-xs shrink-0 select-none">
        {/* Khối Trái: Bộ lọc Tỉnh & Danh sách Sale rút gọn trên 1 dòng duy nhất */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          {/* Bộ lọc Tỉnh tích hợp trực tiếp vào trong Bản đồ */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-800/90 py-1 px-2 rounded-lg border border-slate-700/80 shadow-xs">
            <MapPin className="size-3.5 text-sky-400 shrink-0" />
            <select
              value={selectedProvince}
              onChange={(e) => onSelectProvince?.(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">Toàn Miền Tây</option>
              <option value="An Giang" className="bg-slate-900 text-slate-200">An Giang</option>
              <option value="Cần Thơ" className="bg-slate-900 text-slate-200">Cần Thơ</option>
              <option value="Đồng Tháp" className="bg-slate-900 text-slate-200">Đồng Tháp</option>
              <option value="Vĩnh Long" className="bg-slate-900 text-slate-200">Vĩnh Long</option>
              <option value="Cà Mau" className="bg-slate-900 text-slate-200">Cà Mau</option>
            </select>
          </div>

          <div className="w-px h-5 bg-slate-800 shrink-0" />

          {/* Danh sách Nhân viên Kinh Doanh (Tên rút gọn, 1 dòng duy nhất) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
              Sale KD:
            </span>
            {salesList.map((sale) => {
              const shortName = rutGonTen(sale);
              const isSelected = filterSale === sale;
              const color = layMauSale(sale);
              return (
                <button
                  key={sale}
                  type="button"
                  onClick={() => setFilterSale(isSelected ? 'All' : sale)}
                  title={`Lọc theo ${sale} (${saleStats[sale] || 0} địa bàn)`}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all shrink-0 cursor-pointer text-xs whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50 shadow-sm'
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-medium">{shortName}</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px] text-slate-400">
                    {saleStats[sale] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Khối Phải: Tìm Kiếm, Lọc Trạng Thái, Nút Full Screen & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Ô Tìm Kiếm Xã/Phường Nhanh: Hiển thị kèm Tỉnh rõ ràng */}
          <div ref={searchRef} className="relative w-44 lg:w-56">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredSearchList.length > 0) {
                      const item = filteredSearchList[0];
                      chonVaDinhViXa(item.id, item.ten_tinh);
                      setSearchQuery(`${item.ten_xa} (${item.ten_tinh})`);
                      setIsSearching(false);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearching(false);
                  }
                }}
                placeholder="Tìm xã/phường..."
                className="w-full h-8 bg-slate-800/90 border border-slate-700 text-slate-200 pl-8 pr-7 rounded-lg text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    resetMapView();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  title="Xóa tìm kiếm và đặt lại bản đồ"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Dropdown Gợi ý khi tìm kiếm: Hiển thị nhãn Tỉnh & Mã ĐVHC để phân biệt triệt để */}
            {isSearching && filteredSearchList.length > 0 && (
              <div className="absolute right-0 mt-1 w-72 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 divide-y divide-slate-800/60">
                {filteredSearchList.map((c) => {
                  const provColor = PROVINCE_BADGE_COLORS[c.ten_tinh || ''] || {
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    border: 'border-slate-700',
                  };
                  const isTrungTen = DANH_SACH_XA_TRUNG_TEN.has((c.ten_xa || '').toLowerCase());

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        chonVaDinhViXa(c.id, c.ten_tinh);
                        setSearchQuery(`${c.ten_xa} (${c.ten_tinh})`);
                        setIsSearching(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800/80 transition flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-200 group-hover:text-sky-400 truncate flex items-center gap-1.5">
                          <MapPin className="size-3 text-sky-400 shrink-0" />
                          <span>{c.ten_xa}</span>
                          {c.ten_tinh && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${provColor.bg} ${provColor.text} ${provColor.border}`}
                            >
                              {c.ten_tinh}
                            </span>
                          )}
                          {isTrungTen && (
                            <span className="text-[9px] text-amber-400" title="Trùng tên ở tỉnh khác">
                              •
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate pl-4.5 flex items-center gap-2 mt-0.5">
                          <span>Mã: {c.ma_xa}</span>
                          <span>•</span>
                          <span>{c.sale_name !== 'Chưa gán' ? `Sale: ${rutGonTen(c.sale_name)}` : 'Chưa gán sale'}</span>
                        </div>
                      </div>
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: layMauSale(c.sale_name) }}
                        title={c.sale_name}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Chưa tiếp cận">Chưa tiếp cận</option>
            <option value="Đang chăm sóc">Đang chăm sóc</option>
            <option value="Đã chốt">Đã chốt</option>
          </select>

          {/* NÚT TOÀN MÀN HÌNH (FULL SCREEN) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ lại (Esc)' : 'Toàn màn hình (Full screen)'}
            className={`h-8 px-2.5 rounded-lg border transition-all text-xs flex items-center gap-1.5 cursor-pointer font-medium ${
              isFullscreen
                ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize className="size-3.5 text-white" />
                <span className="hidden md:inline">Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize className="size-3.5 text-sky-400" />
                <span className="hidden md:inline">Toàn màn hình</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Container Bản Đồ */}
      <div className="relative flex-1 w-full h-full min-h-0">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Thanh điều khiển nổi trên Mobile */}
        <div className="sm:hidden absolute top-2.5 inset-x-2.5 z-30 flex items-center gap-2 pointer-events-auto">
          {/* Ô Tìm Kiếm Nhanh */}
          <div ref={mobileSearchRef} className="relative flex-1">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredSearchList.length > 0) {
                      const item = filteredSearchList[0];
                      chonVaDinhViXa(item.id, item.ten_tinh);
                      setSearchQuery(`${item.ten_xa} (${item.ten_tinh})`);
                      setIsSearching(false);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearching(false);
                  }
                }}
                placeholder="Tìm nhanh xã/phường..."
                className="w-full h-9 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white pl-8.5 pr-8 rounded-full text-xs shadow-xl placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    resetMapView();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {isSearching && filteredSearchList.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-800">
                {filteredSearchList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      chonVaDinhViXa(c.id, c.ten_tinh);
                      setSearchQuery(`${c.ten_xa} (${c.ten_tinh})`);
                      setIsSearching(false);
                    }}
                    className="w-full text-left px-3 py-2.5 active:bg-slate-800 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="size-3 text-sky-400 shrink-0" />
                        <span>{c.ten_xa}</span>
                        {c.ten_tinh && <span className="text-[10px] text-sky-400">({c.ten_tinh})</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4.5">
                        Mã: {c.ma_xa} • {c.sale_name !== 'Chưa gán' ? `Sale: ${rutGonTen(c.sale_name)}` : 'Chưa gán sale'}
                      </div>
                    </div>
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: layMauSale(c.sale_name) }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút Fullscreen Mobile */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="h-9 w-9 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white flex items-center justify-center shadow-xl shrink-0 cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize className="size-3.5 text-sky-400" /> : <Maximize className="size-3.5 text-sky-400" />}
          </button>

          {/* Nút Mở Bộ Lọc Mobile */}
          <button
            type="button"
            onClick={() => setMoBoLocMobile(true)}
            className="h-9 px-3 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-xl shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5 text-sky-400" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Nút đặt lại góc nhìn bản đồ */}
        <button
          type="button"
          onClick={resetMapView}
          className="absolute left-3 bottom-3 z-20 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700/80 shadow-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Đặt lại góc nhìn chuẩn"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Góc nhìn chuẩn</span>
        </button>

        {/* Hover Tooltip Mở Rộng: Hiển thị Diện tích (ha), Dân số, Tình trạng tiếp cận, Số dự án */}
        {tooltipPos && hoveredCommune && (
          <div
            className="pointer-events-none absolute z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 transform -translate-x-1/2 -translate-y-full min-w-[280px] max-w-[330px]"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 14}px` }}
          >
            {/* Tiêu đề Xã & Tỉnh */}
            <div className="border-b border-slate-800 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-white truncate">{hoveredCommune.ten_xa}</span>
                <span className="text-[11px] text-sky-300 font-semibold px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-800/60 shrink-0">
                  {hoveredCommune.ten_tinh}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <span>Mã ĐVHC:</span>
                <span className="font-mono text-slate-300 font-medium">{hoveredCommune.ma_xa || hoveredCommune.id}</span>
              </div>
            </div>

            {/* Bảng thông số chi tiết */}
            <div className="space-y-1.5 pt-0.5">
              {/* 1. Diện tích (ha) */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Diện tích:</span>
                <span className="font-semibold text-slate-200">
                  {((hoveredCommune.area_km2 || 0) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} ha
                  <span className="text-[11px] font-normal text-slate-400 ml-1">
                    ({(hoveredCommune.area_km2 || 0).toLocaleString('vi-VN')} km²)
                  </span>
                </span>
              </div>

              {/* 2. Dân số */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Dân số:</span>
                <span className="font-semibold text-slate-200">
                  {(
                    hoveredCommune.dan_so ||
                    (hoveredCommune.households ? hoveredCommune.households * 4 : 0)
                  ).toLocaleString('vi-VN')} người
                  {hoveredCommune.households > 0 && (
                    <span className="text-[11px] font-normal text-slate-400 ml-1">
                      (~{hoveredCommune.households.toLocaleString('vi-VN')} hộ)
                    </span>
                  )}
                </span>
              </div>

              {/* 3. Tình trạng tiếp cận */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tình trạng tiếp cận:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] border ${
                    hoveredCommune.reach_status === 'Đã chốt'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : hoveredCommune.reach_status === 'Đang chăm sóc'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {hoveredCommune.reach_status}
                </span>
              </div>

              {/* 4. Số dự án (Cắm cờ VDCD) */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Số dự án:</span>
                {hoveredCommune.danh_sach_du_an && hoveredCommune.danh_sach_du_an.length > 0 ? (
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 bg-red-950/70 px-2 py-0.5 rounded-md border border-red-700/80 shadow-xs">
                    <img src="/logo.png" alt="VDCD" className="h-3.5 w-auto object-contain bg-white/95 rounded-xs px-1 py-0.5" />
                    <span>{hoveredCommune.danh_sach_du_an.length} dự án (VDCD)</span>
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">0 dự án</span>
                )}
              </div>

              {/* 5. Sale phụ trách */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sale phụ trách:</span>
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: layMauSale(hoveredCommune.sale_name) }}
                  />
                  <span>{hoveredCommune.sale_name}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Card/Drawer Chi Tiết Xã Khi Click */}
        {selectedFeature && (
          <div className="fixed sm:absolute bottom-0 inset-x-0 sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-96 max-h-[75vh] sm:max-h-none rounded-t-2xl sm:rounded-xl z-40 bg-slate-900/98 backdrop-blur-md border-t sm:border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
            {/* Thanh vuốt Mobile */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

            {/* Header Drawer */}
            <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-800/60">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Badge Tỉnh nổi bật */}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-950/90 text-sky-300 border border-sky-700/60 flex items-center gap-1">
                    <MapPin className="size-3" />
                    {selectedFeature.ten_tinh}
                  </span>

                  {/* Mã ĐVHC chính thức */}
                  {selectedFeature.ma_xa && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Mã: {selectedFeature.ma_xa}
                    </span>
                  )}

                  {/* Cảnh báo tên trùng nếu có */}
                  {DANH_SACH_XA_TRUNG_TEN.has((selectedFeature.ten_xa || '').toLowerCase()) && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1"
                      title="Tên này có ở tỉnh khác trong Miền Tây. Hệ thống đã phân định chuẩn xác theo Tỉnh và Mã ĐVHC."
                    >
                      <AlertCircle className="size-2.5" />
                      Trùng tên
                    </span>
                  )}

                  {selectedFeature.khach_hang_id ? (
                    <Link
                      href={`/khach-hang/${selectedFeature.khach_hang_id}`}
                      className="text-[11px] text-slate-400 hover:text-sky-300 inline-flex items-center gap-0.5 transition-colors ml-auto"
                      title="Mở hồ sơ khách hàng đầy đủ"
                    >
                      <ExternalLink className="size-3" />
                      <span>Xem hồ sơ KH</span>
                    </Link>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 ml-auto">
                      Chưa tạo KH
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-2 leading-snug break-words">
                  {selectedFeature.ten_day_du || `${selectedFeature.ten_xa} - Tỉnh ${selectedFeature.ten_tinh}`}
                </h3>
              </div>
              <button
                onClick={dongDrawer}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Nội dung Drawer */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {saveSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-700/70 text-emerald-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="size-4 shrink-0 text-emerald-400" />
                  <span>Đã cập nhật thông tin và phân công địa bàn thành công!</span>
                </div>
              )}

              {/* Thẻ chỉ số chung */}
              <div className="space-y-2 text-xs bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sale phụ trách:</span>
                  <span className="font-semibold flex items-center gap-1.5 text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: layMauSale(selectedFeature.sale_name) }}
                    />
                    {selectedFeature.sale_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      selectedFeature.reach_status === 'Đã chốt'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : selectedFeature.reach_status === 'Đang chăm sóc'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {selectedFeature.reach_status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Dân số / Hộ dân:</span>
                  <span className="text-white font-medium">
                    {selectedFeature.households.toLocaleString('vi-VN')} hộ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Diện tích:</span>
                  <span className="text-white font-medium">{selectedFeature.area_km2} km²</span>
                </div>
              </div>

              {/* Dự án liên kết */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderKanban className="size-3.5 text-blue-400" />
                    Dự án tại địa bàn ({selectedFeature.danh_sach_du_an?.length || 0})
                  </span>
                  {selectedFeature.khach_hang_id && (
                    <Link
                      href={`/ho-so-du-an?khachHangId=${selectedFeature.khach_hang_id}&moForm=true`}
                      className="text-[11px] text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Thêm dự án
                    </Link>
                  )}
                </div>

                {selectedFeature.danh_sach_du_an && selectedFeature.danh_sach_du_an.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFeature.danh_sach_du_an.map((da) => (
                      <Link
                        key={da.id}
                        href={`/ho-so-du-an/${da.id}`}
                        className="block p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-sky-500/80 transition-all group shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                            {da.ten_du_an}
                          </span>
                          <ExternalLink className="size-3 text-slate-400 group-hover:text-sky-300 shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span className="bg-slate-700/80 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                            {da.giai_doan || 'Đang xúc tiến'}
                          </span>
                          {da.tong_muc_dau_tu ? (
                            <span className="font-semibold text-emerald-400 font-mono">
                              {da.tong_muc_dau_tu.toLocaleString('vi-VN')} đ
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-800/30 rounded-lg border border-slate-800">
                    Chưa có dự án nào gắn với địa bàn này.
                  </div>
                )}
              </div>

              {/* Người liên hệ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="size-3.5 text-emerald-400" />
                    Người liên hệ ({selectedFeature.danh_sach_nguoi_lien_he?.length || 0})
                  </span>
                </div>

                {selectedFeature.danh_sach_nguoi_lien_he && selectedFeature.danh_sach_nguoi_lien_he.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFeature.danh_sach_nguoi_lien_he.map((lh) => (
                      <div
                        key={lh.id}
                        className="p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/40 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white truncate">{lh.ho_va_ten}</div>
                          {lh.chuc_vu && <div className="text-[11px] text-slate-400 truncate">{lh.chuc_vu}</div>}
                        </div>
                        {lh.so_dien_thoai ? (
                          <a
                            href={`tel:${lh.so_dien_thoai}`}
                            className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Phone className="size-3" />
                            {lh.so_dien_thoai}
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-800/30 rounded-lg border border-slate-800">
                    Chưa có đầu mối liên hệ tại địa bàn này.
                  </div>
                )}
              </div>

              {/* Form Cập Nhật Nhanh & Gán Sale */}
              <form onSubmit={handleSaveCRM} className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-sky-400" />
                    Phân công & cập nhật
                  </span>
                  {!selectedFeature.khach_hang_id && (
                    <span className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">
                      Tự động tạo hồ sơ KH
                    </span>
                  )}
                </div>

                {/* Chọn Nhân Sự Phụ Trách */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nhân viên kinh doanh phụ trách
                  </label>
                  <select
                    value={editSaleId}
                    onChange={(e) => setEditSaleId(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="">-- Chưa gán người phụ trách --</option>
                    {(danhSachSale || []).map((ns) => (
                      <option key={ns.id} value={ns.id}>
                        {ns.ho_va_ten}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trạng Thái */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Trạng thái tiếp cận</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Chưa tiếp cận">Chưa tiếp cận</option>
                    <option value="Đang chăm sóc">Đang chăm sóc</option>
                    <option value="Đã chốt">Đã chốt</option>
                  </select>
                </div>

                {/* Ghi Chú Hỗ Trợ */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ghi chú tiến độ / đầu mối</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Ghi chú trao đổi, đầu mối liên hệ..."
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs transition-colors shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi địa bàn'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Bottom Sheet Bộ Lọc Trên Mobile */}
        {moBoLocMobile && (
          <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
              onClick={() => setMoBoLocMobile(false)}
            />
            <div className="relative bg-slate-900 border-t border-slate-700/80 rounded-t-2xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 text-xs text-white max-h-[80vh] overflow-y-auto">
              <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto -mt-1" />
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Bộ lọc địa bàn</span>
                {filterSale !== 'All' || filterStatus !== 'All' || selectedProvince !== 'All' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSale('All');
                      setFilterStatus('All');
                      onSelectProvince?.('All');
                    }}
                    className="text-xs text-sky-400 hover:underline cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMoBoLocMobile(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Đóng
                  </button>
                )}
              </div>

              {/* Lọc theo Tỉnh */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Khu vực Tỉnh / Thành
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PROVINCES_LIST.map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => onSelectProvince?.(prov)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selectedProvince === prov
                          ? 'bg-slate-800 border-sky-400 text-white font-bold ring-1 ring-sky-400/50'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {prov === 'All' ? 'Toàn Miền Tây' : prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lọc theo Sale */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Nhân viên kinh doanh
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterSale('All')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      filterSale === 'All'
                        ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                        : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    Tất cả sale
                  </button>
                  {salesList.map((sale) => (
                    <button
                      key={sale}
                      type="button"
                      onClick={() => setFilterSale(filterSale === sale ? 'All' : sale)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        filterSale === sale
                          ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: layMauSale(sale) }} />
                        <span className="truncate">{rutGonTen(sale)}</span>
                      </span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 shrink-0">
                        {saleStats[sale] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lọc theo Trạng thái */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Trạng thái tiếp cận
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Chưa tiếp cận', 'Đang chăm sóc', 'Đã chốt'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFilterStatus(st)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        filterStatus === st
                          ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {st === 'All' ? 'Tất cả trạng thái' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
