/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SVGMapConfig } from './types';
import { VIETNAM_MAP_PRESET, EXHIBITION_MAP_PRESET } from './utils/samples';
import { SVGViewerPanel } from './components/SVGViewerPanel';
import { SVGMapperEditor } from './components/SVGMapperEditor';
import {
  Eye,
  Settings,
  Map,
  RotateCcw,
  Compass,
  Github,
  HelpCircle,
  FileJson,
  Layers,
  Sparkles
} from 'lucide-react';

interface AppProps {
  blockId?: string;
  mapId?: string;
  blockConfig?: SVGMapConfig;
  onBlockConfigChange?: (config: SVGMapConfig) => void;
  isGutenberg?: boolean;
  activeTab?: 'viewer' | 'builder';
  onActiveTabChange?: (tab: 'viewer' | 'builder') => void;
  zoomScale?: number;
  zoomPositionX?: number;
  zoomPositionY?: number;
  onZoomChange?: (zoomState: { scale: number; positionX: number; positionY: number }) => void;
}

export default function App({
  blockId = 'jankx/svg-data-map',
  mapId = 'default-map',
  blockConfig,
  onBlockConfigChange,
  isGutenberg = false,
  activeTab: externalActiveTab,
  onActiveTabChange: externalOnActiveTabChange,
  zoomScale = 1,
  zoomPositionX = 0,
  zoomPositionY = 0,
  onZoomChange
}: AppProps) {
  // Global active tab state ('viewer' mode or 'builder' mode)
  const [internalActiveTab, setInternalActiveTab] = useState<'viewer' | 'builder'>('viewer');

  // Use external activeTab if provided (from Gutenberg block), otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnActiveTabChange || setInternalActiveTab;

  useEffect(() => {
    if (externalActiveTab === undefined) {
      setInternalActiveTab('viewer');
    }
  }, []);

  // Current loaded map configurations
  const getInitialConfig = () => {
    if (blockConfig && Array.isArray(blockConfig.regions) && blockConfig.regions.length > 0) {
      return blockConfig;
    }
    const globalConfig = (window as any).jankxSvgMapData?.initialConfig;
    if (globalConfig && Array.isArray(globalConfig.regions) && globalConfig.regions.length > 0) {
      return globalConfig;
    }
    return VIETNAM_MAP_PRESET;
  };

  const [mapConfig, setMapConfig] = useState<SVGMapConfig>(getInitialConfig());

  // Current active selected region ID across components
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const handleSelectRegion = (id: string | null) => {
    setSelectedRegionId(id);

    // Emit global event for cross-block communication
    const event = new CustomEvent('jankx-svg-map-region-selected', {
      detail: { mapId, regionId: id, config: mapConfig }
    });
    window.dispatchEvent(event);
  };

  // Sync state from global events (for the Info block to react to Map block)
  useEffect(() => {
    const handleGlobalSelect = (e: any) => {
      if (e.detail.mapId === mapId) {
        // If it's a map update, we might also want to sync the config if not present
        if (blockId === 'jankx/svg-data-map-info' && e.detail.config) {
          setMapConfig(e.detail.config);
        }
        setSelectedRegionId(e.detail.regionId);
      }
    };

    // Handle builder mode state from map block
    const handleBuilderModeChange = (e: any) => {
      if (e.detail.mapId === mapId) {
        // Hide Info block when map is in builder mode
        if (blockId === 'jankx/svg-data-map-info') {
          const infoEditor = document.querySelector('.jankx-svg-data-map-info-editor') as HTMLElement;
          if (infoEditor) {
            if (e.detail.isBuilderMode) {
              infoEditor.style.display = 'none';
            } else {
              infoEditor.style.display = 'block';
            }
          }
        }

        // Hide all other blocks when in builder mode (only for map block)
        if (blockId === 'jankx/svg-data-map' && isGutenberg) {
          const editorBlocks = document.querySelectorAll('.block-editor-block-list__block');
          const currentBlockWrapper = document.querySelector('.jankx-svg-data-map-editor')?.closest('.block-editor-block-list__block') as HTMLElement;

          editorBlocks.forEach((block: any) => {
            if (currentBlockWrapper && !currentBlockWrapper.contains(block) && !block.contains(currentBlockWrapper)) {
              if (e.detail.isBuilderMode) {
                block.style.display = 'none';
              } else {
                block.style.display = '';
              }
            }
          });
        }
      }
    };

    window.addEventListener('jankx-svg-map-region-selected', handleGlobalSelect);
    window.addEventListener('jankx-svg-map-builder-mode', handleBuilderModeChange);
    return () => {
      window.removeEventListener('jankx-svg-map-region-selected', handleGlobalSelect);
      window.removeEventListener('jankx-svg-map-builder-mode', handleBuilderModeChange);
    };
  }, [mapId, blockId]);

  const handleConfigChange = (newConfig: SVGMapConfig) => {
    setMapConfig(newConfig);
    if (onBlockConfigChange) {
      onBlockConfigChange(newConfig);
    }
  };

  const handleLoadPreset = (presetName: 'vietnam' | 'exhibition') => {
    if (presetName === 'vietnam') {
      setMapConfig(VIETNAM_MAP_PRESET);
      setSelectedRegionId('vn-scc');
    } else {
      setMapConfig(EXHIBITION_MAP_PRESET);
      setSelectedRegionId('ex-stage');
    }
  };

  const handleResetCurrent = () => {
    if (mapConfig.title.includes('Việt Nam')) {
      handleLoadPreset('vietnam');
    } else {
      handleLoadPreset('exhibition');
    }
  };

  return (
    <div id="app-root-container" className={`${isGutenberg && activeTab === 'builder' ? 'fixed inset-0 z-[999999] bg-white' : 'min-h-screen bg-slate-50/50'} flex flex-col font-sans`}>

      {/* 1. Header Toolbar navigation element (only in Gutenberg/Builder mode) */}
      {isGutenberg && (
        <header className={`${activeTab === 'builder' ? 'px-4 py-3' : 'px-6 py-4'} bg-white/95 backdrop-blur-md border-b border-indigo-50/50 shadow-sm`}>
          <div className={`${activeTab === 'builder' ? '' : 'max-w-7xl mx-auto'} flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">SVG Data Map</h1>
                  <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5 animate-pulse flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium font-mono">Hệ thống Soạn thảo & Định vị Địa lý dựa trên Vector SVG</p>
              </div>
            </div>

            {/* Quick utility actions */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {activeTab === 'viewer' && blockId === 'jankx/svg-data-map' && (
                <button
                  onClick={() => setActiveTab('builder')}
                  className="p-2 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20"
                  title="Mở bộ công cụ thiết kế bản đồ"
                >
                  <Settings className="w-3.5 h-3.5" /> Chỉnh sửa bản đồ (Full)
                </button>
              )}
              {activeTab === 'builder' && (
                <button
                  onClick={() => setActiveTab('viewer')}
                  className="p-2 px-3 text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  title="Thoát chế độ toàn màn hình"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem kết quả
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-200 pl-3">
                <span>Màn hình:</span>
                <span className={`w-2.5 h-2.5 rounded-full inline-block ${activeTab === 'viewer' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className="font-bold text-slate-600 capitalize">{activeTab === 'viewer' ? 'Live' : 'Edit'}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 2. Main Content viewport wrapper */}
      <main className={`${isGutenberg && activeTab === 'builder' ? 'flex-1 overflow-auto p-4' : 'flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8'}`}>

        {/* Dynamic content rendering according to active tab and blockId */}
        {blockId === 'jankx/svg-data-map-info' ? (
          <div className="info-block-only">
            <SVGViewerPanel
              config={mapConfig}
              selectedRegionId={selectedRegionId}
              onSelectRegion={handleSelectRegion}
              onLoadPreset={handleLoadPreset}
              displayMode="info-only"
              mapId={mapId}
              zoomScale={zoomScale}
              zoomPositionX={zoomPositionX}
              zoomPositionY={zoomPositionY}
              onZoomChange={onZoomChange}
              isGutenberg={isGutenberg}
            />
          </div>
        ) : (
          activeTab === 'viewer' ? (
            <div className="space-y-4 animate-fade-in" id="tab-content-viewer">
              {/* Viewer Component */}
              <SVGViewerPanel
                config={mapConfig}
                selectedRegionId={selectedRegionId}
                onSelectRegion={handleSelectRegion}
                onLoadPreset={handleLoadPreset}
                displayMode="map-only"
                mapId={mapId}
                zoomScale={zoomScale}
                zoomPositionX={zoomPositionX}
                zoomPositionY={zoomPositionY}
                onZoomChange={onZoomChange}
                isGutenberg={isGutenberg}
              />
            </div>
          ) : (
            <div id="tab-content-builder" className="animate-fade-in space-y-4">

              {/* Informational banner about editing flow */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl text-amber-400 shrink-0 mt-0.5">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Bộ Công Cụ Thiết Thiết Kế Bản Đồ Động</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-1">
                      Bạn có thể kéo thả <b>File SVG bất kỳ</b> của mình vào khung bên phải &rarr; Hệ thống sẽ tự động quét và phân rã các thẻ vector có ID. Sau đó gộp vector, ghim cờ, soạn thảo danh sách thẻ dữ liệu giống như ảnh mẫu và xuất file JSON để lưu trữ!
                    </p>
                  </div>
                </div>
              </div>

              {/* Builder Component workspace */}
              <SVGMapperEditor
                config={mapConfig}
                onChangeConfig={handleConfigChange}
                selectedRegionId={selectedRegionId}
                onSelectRegion={handleSelectRegion}
              />
            </div>
          )
        )}
      </main>

      {/* 3. Global Footer bar */}
      {!isGutenberg && activeTab !== 'builder' && (
        <footer className="mt-12 bg-white border-t border-slate-150 py-6 px-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <span>SVG Data Map</span>
              <span>&copy; 2026. Thiết kế dạng Abstract hướng mở cho mọi loại dữ liệu bản đồ.</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trực tuyến
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
