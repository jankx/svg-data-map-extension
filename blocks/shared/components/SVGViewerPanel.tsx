/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SVGMapConfig, RegionConfig, DataItem } from '../types';
import { SVGMapContainer } from './SVGMapContainer';
import {
  Compass,
  MapPin,
  ChevronRight,
  BookOpen,
  Share2,
  FileJson,
  Info
} from 'lucide-react';

interface SVGViewerPanelProps {
  config: SVGMapConfig;
  selectedRegionId: string | null;
  onSelectRegion: (id: string | null) => void;
  onLoadPreset: (presetName: 'vietnam' | 'exhibition') => void;
  displayMode?: 'full' | 'map-only' | 'info-only';
  mapId?: string;
}

export function SVGViewerPanel({
  config,
  selectedRegionId,
  onSelectRegion,
  onLoadPreset,
  displayMode = 'full',
  mapId = 'default-map',
}: SVGViewerPanelProps) {

  // Find currently active region details
  const activeRegion = config.regions.find(r => r.id === selectedRegionId) || null;

  const handleCardClick = (item: DataItem) => {
    if (item.linkUrl) {
      // Let's open smoothly or trigger alert. According to guidelines, Try to avoid window.alert/window.open inside restricted iframe,
      // but if we show clean redirect options, let's render a elegant mini modal or simple status indicator or use a target="_blank" anchor tag on the link label!
      // Rendering target="_blank" on a real <a> href tag is best because it's standard HTML, very safe, and fulfills the "no simulated infrastructure" rule perfectly!
    }
  };

  return (
    <div id="viewer-root-panel" className={`grid grid-cols-1 ${displayMode === 'full' ? 'lg:grid-cols-12' : ''} gap-6 items-stretch`}>
      {/* 1. Left Map side */}
      {(displayMode === 'full' || displayMode === 'map-only') && (
        <div className={`${displayMode === 'full' ? 'lg:col-span-7 xl:col-span-8' : 'w-full'} flex flex-col gap-4`}>

          {/* Info header of map */}
          <div className="bg-white border border-indigo-50/70 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 rounded bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-wider font-mono">Bản đồ hiện tại</span>
                <h1 className="text-xl font-bold text-slate-800">{config.title || 'Bản đồ chưa đặt tên'}</h1>
              </div>
              <p className="text-slate-500 text-xs mt-1">{config.description || 'Chưa cung cấp mô tả trực quan cho bản đồ này.'}</p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <span className="text-xs text-slate-400 mr-1.5">Bản mẫu:</span>
              <button
                id="preset-vietnam-btn"
                onClick={() => onLoadPreset('vietnam')}
                className={`p-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition ${config.title.includes('Việt Nam')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                Việt Nam
              </button>
              <button
                id="preset-exhibition-btn"
                onClick={() => onLoadPreset('exhibition')}
                className={`p-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition ${config.title.includes('Triển Lãm')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                Hội Chợ Triển Lãm
              </button>
            </div>
          </div>

          {/* The map visual canvas container */}
          <div className="relative h-[620px] shadow-sm">
            <SVGMapContainer
              config={config}
              selectedRegionId={selectedRegionId}
              onSelectRegion={onSelectRegion}
            />
          </div>

          {/* Micro status legend */}
          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-600">Chú thích bản đồ:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-600 inline-block border border-white shadow-sm"></span>
                Địa danh được chọn
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-200 inline-block border border-white shadow-sm"></span>
                Di chuột qua
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-500 border border-white flex items-center justify-center text-white text-[8px] font-bold">●</span>
                Điểm mốc / Markers (Địa điểm chi tiết)
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              Tổng số địa danh đã gán data: <span className="font-bold text-slate-600">{config.regions.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Right Content Block layout */}
      {(displayMode === 'full' || displayMode === 'info-only') && (
        <div
          id={`viewer-sidebar-${mapId}`}
          className={`${displayMode === 'full' ? 'lg:col-span-5 xl:col-span-4' : 'w-full'} rounded-2xl p-6 flex flex-col justify-between shadow-md border overflow-hidden min-h-[550px] transition-all`}
          style={{
            backgroundColor: '#d2ebfa',
            borderColor: '#bce1f7'
          }}
        >
          {activeRegion ? (
            <div className="flex flex-col h-full justify-between">
              {/* Top Heading: Region Name */}
              <div>
                <h2 className="text-3xl font-sans font-bold text-slate-800 tracking-tight mb-1 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-indigo-800 shrink-0" />
                  {activeRegion.name}
                </h2>
                {activeRegion.description && (
                  <p className="text-slate-600/90 text-xs leading-relaxed mb-5">
                    {activeRegion.description}
                  </p>
                )}
              </div>

              {/* List of custom visual blocks / Articles */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2 custom-scrollbar">
                {activeRegion.items && activeRegion.items.length > 0 ? (
                  activeRegion.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow transition"
                    >
                      <h3 className="font-bold text-slate-900 text-base mb-1.5 tracking-tight">
                        {item.title}
                      </h3>

                      <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {item.description}
                      </p>

                      <a
                        href={item.linkUrl || '#'}
                        target={item.linkUrl ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 font-sans font-bold text-xs text-amber-800 hover:text-amber-900 transition-colors"
                        onClick={() => handleCardClick(item)}
                      >
                        <span>{item.linkLabel || 'Xem chi tiết'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl text-center border border-dashed border-sky-300">
                    <BookOpen className="w-8 h-8 text-sky-500/80 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-sky-900">Không có dữ liệu</p>
                    <p className="text-xs text-sky-700/80 mt-1">Vùng này chưa được gán thẻ tài liệu hay bài viết nào.</p>
                  </div>
                )}
              </div>

              {/* Bottom Footer block inside sidebar */}
              <div className="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                <span>Được thiết lập bằng JSON Mapping</span>
                <span className="bg-sky-200/60 px-2 py-0.5 rounded">Bản đồ động</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[450px]">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <Compass className="w-16 h-16 text-indigo-800 relative animate-spin-slow" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 leading-snug">
                Bắt đầu Hành Trình Khám Phá
              </h3>

              <p className="text-slate-600 text-xs mt-2 max-w-xs leading-relaxed">
                Vui lòng hover và nhấp chuột chọn bất đẳng thức địa danh hoặc các biểu tượng điểm mốc trên bản đồ để hiển thị thông tin dữ liệu chi tiết.
              </p>

              <div className="mt-8 bg-white/50 border border-sky-200/40 p-3 rounded-lg max-w-xs text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block mb-0.5">💡 Gợi ý nhanh</span> Use standard presets above the map or jump into the **Builder Tab** to customize this with your own SVGs!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
