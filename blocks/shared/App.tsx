/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SVGMapConfig } from './types';
import { SVGViewerPanel } from './components/SVGViewerPanel';
import { SVGMapperEditor } from './components/SVGMapperEditor';
import {
  Eye,
  Settings,
  Map,
  HelpCircle,
  Sparkles,
  FileCode,
  Upload,
  Download
} from 'lucide-react';

const EMPTY_CONFIG: SVGMapConfig = {
  title: 'Bản đồ mới',
  description: '',
  regions: [],
  settings: {
    defaultFillColor: '#e2edf5',
    hoverFillColor: '#93c5fd',
    selectedFillColor: '#3b82f6',
    markerColor: '#f97316',
    backgroundColor: '#ffffff',
    showMarkerLabels: true,
  }
};

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
  selectionStyle?: string;
  selectionAnimation?: boolean;
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
  onZoomChange,
  selectionStyle = 'fill',
  selectionAnimation = false,
}: AppProps) {
  // Global active tab state ('viewer' mode or 'builder' mode)
  const [internalActiveTab, setInternalActiveTab] = useState<'viewer' | 'builder'>('viewer');

  // Settings panel state
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showJsonOverlay, setShowJsonOverlay] = useState(false);
  const [jsonPasteValue, setJsonPasteValue] = useState('');

  // SVG file upload handler
  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setMapConfig({
          ...mapConfig,
          title: `Bản đồ: ${file.name.replace('.svg', '')}`,
          svgContent: text,
          regions: [],
        });
      }
    };
    reader.readAsText(file);
  };

  // JSON export handler
  const handleExportJson = () => {
    const exportConfig = {
      ...mapConfig,
      svgContent: mapConfig.svgContent || ''
    };
    const dataStr = JSON.stringify(exportConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'svg-map-config.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Use external activeTab if provided (from Gutenberg block), otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnActiveTabChange || setInternalActiveTab;

  useEffect(() => {
    if (externalActiveTab === undefined) {
      setInternalActiveTab('viewer');
    }
  }, []);

  // Current loaded map configurations
  const getInitialConfig = (): SVGMapConfig => {
    // Priority 1: saved block attributes
    if (blockConfig && (Array.isArray(blockConfig.regions) || blockConfig.svgFileUrl)) {
      return blockConfig;
    }
    // Priority 2: PHP-rendered global config (frontend)
    const globalConfig = (window as any).jankxSvgMapData?.initialConfig;
    if (globalConfig && (Array.isArray(globalConfig.regions) || globalConfig.svgFileUrl)) {
      return globalConfig;
    }
    // Priority 3: empty blank canvas — never auto-load a sample
    return EMPTY_CONFIG;
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

        // You can keep info editor hiding for better perf, but map block doesn't need to hide siblings anymore
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
      }
    };

    window.addEventListener('jankx-svg-map-region-selected', handleGlobalSelect);
    window.addEventListener('jankx-svg-map-builder-mode', handleBuilderModeChange);
    return () => {
      window.removeEventListener('jankx-svg-map-region-selected', handleGlobalSelect);
      window.removeEventListener('jankx-svg-map-builder-mode', handleBuilderModeChange);
    };
  }, [mapId, blockId]);

  // Track the SVG content that has already been uploaded to the server,
  // so we don't re-upload on every minor config change (region name, color, marker, etc.)
  const uploadedSvgContentRef = useRef<string | null>(null);
  const uploadedSvgFileUrlRef = useRef<string | null>(blockConfig?.svgFileUrl || null);

  useEffect(() => {
    // If the config has a file URL but the content is empty, fetch the SVG text
    if (mapConfig.svgFileUrl && (!mapConfig.svgContent || mapConfig.svgContent.trim() === '')) {
      fetch(mapConfig.svgFileUrl + '?t=' + Date.now())
        .then(res => res.text())
        .then(text => {
          if (text.includes('<svg')) {
            setMapConfig(prev => ({ ...prev, svgContent: text }));
            // Mark this as already-uploaded: the file already exists on the server,
            // so future config changes won't re-upload the same SVG content.
            uploadedSvgContentRef.current = text;
            uploadedSvgFileUrlRef.current = mapConfig.svgFileUrl || null;
          }
        })
        .catch(err => console.error('Failed to load SVG from URL', err));
    }
  }, [mapConfig.svgFileUrl]);

  const handleConfigChange = async (newConfig: SVGMapConfig) => {
    // Immediately update local React state so UI stays responsive
    setMapConfig(newConfig);

    if (onBlockConfigChange) {
      const hasSvgContent = newConfig.svgContent && newConfig.svgContent.length > 100;

      if (hasSvgContent) {
        // Check if this SVG content was already uploaded (i.e. it hasn't changed)
        const alreadyUploaded =
          uploadedSvgContentRef.current === newConfig.svgContent &&
          uploadedSvgFileUrlRef.current;

        if (alreadyUploaded) {
          // SVG hasn't changed — just strip svgContent and reuse existing file URL
          const configToSave = {
            ...newConfig,
            svgFileUrl: uploadedSvgFileUrlRef.current as string,
            svgFilePath: newConfig.svgFilePath
          };
          delete configToSave.svgContent;
          onBlockConfigChange(configToSave);
          return;
        }

        // SVG content is new — upload it to server
        try {
          const formData = new FormData();
          formData.append('action', 'svg_data_map_save_file');
          formData.append('svgContent', newConfig.svgContent!);

          const ajaxUrl = (window as any).ajaxurl || '/wp-admin/admin-ajax.php';
          const res = await fetch(ajaxUrl, {
            method: 'POST',
            body: formData
          });
          const result = await res.json();
          if (result.success) {
            // Remember this content is now safely stored server-side
            uploadedSvgContentRef.current = newConfig.svgContent!;
            uploadedSvgFileUrlRef.current = result.data.url;

            // Strip the giant SVG string before passing to Gutenberg
            const configToSave = {
              ...newConfig,
              svgFileUrl: result.data.url,
              svgFilePath: result.data.path
            };
            delete configToSave.svgContent;
            onBlockConfigChange(configToSave);
            return;
          }
        } catch (e) {
          console.error('[SVG Data Map] Failed to offload SVG content to server', e);
        }
      }

      // No SVG content or upload failed — pass config as-is (without svgContent if URL exists)
      if (newConfig.svgFileUrl && newConfig.svgContent) {
        const configToSave = { ...newConfig };
        delete configToSave.svgContent;
        onBlockConfigChange(configToSave);
        return;
      }

      onBlockConfigChange(newConfig);
    }
  };

  const handleLoadPreset = (_presetName: string) => {
    // Samples removed — preset loading is no longer supported
  };

  const appContent = (
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
                <>
                  <button
                    onClick={() => setActiveTab('viewer')}
                    className="p-2 px-3 text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    title="Thoát chế độ toàn màn hình"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem kết quả
                  </button>

                  {/* Settings toggle for export/import */}
                  <button
                    onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                    className={`p-2 px-3 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${showSettingsPanel ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
                    title="Cài đặt bản đồ"
                  >
                    <Settings className="w-3.5 h-3.5" /> Cài đặt
                  </button>
                </>
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

      {/* Settings Panel (Export/Import SVG) */}
      {isGutenberg && activeTab === 'builder' && showSettingsPanel && (
        <div className="bg-white border-b border-indigo-50/50 px-4 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FileCode className="w-4 h-4 text-indigo-600" />
              Export/Import Bản Đồ SVG
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept=".svg"
                onChange={handleSvgFileUpload}
                className="hidden"
                id="svg-upload-input"
              />
              <label
                htmlFor="svg-upload-input"
                className="p-2 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Import SVG
              </label>
              <button
                onClick={handleExportJson}
                className="p-2 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button
                onClick={() => setShowJsonOverlay(true)}
                className="p-2 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" /> Import JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content viewport wrapper */}
      <main className={`${isGutenberg && activeTab === 'builder' ? 'flex-1 overflow-hidden p-0' : 'flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8'}`}>

        {/* Dynamic content rendering according to active tab and blockId */}
        {blockId === 'jankx/svg-data-map-info' ? (
          <div className="info-block-only">
            <SVGViewerPanel
              config={mapConfig}
              selectedRegionId={selectedRegionId}
              onSelectRegion={handleSelectRegion}
              displayMode="info-only"
              mapId={mapId}
              zoomScale={zoomScale}
              zoomPositionX={zoomPositionX}
              zoomPositionY={zoomPositionY}
              onZoomChange={onZoomChange}
              isGutenberg={isGutenberg}
              selectionStyle={selectionStyle}
              selectionAnimation={selectionAnimation}
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
                displayMode="map-only"
                mapId={mapId}
                zoomScale={zoomScale}
                zoomPositionX={zoomPositionX}
                zoomPositionY={zoomPositionY}
                onZoomChange={onZoomChange}
                isGutenberg={isGutenberg}
                selectionStyle={selectionStyle}
                selectionAnimation={selectionAnimation}
              />
            </div>
          ) : (
            <div id="tab-content-builder" className="animate-fade-in h-full">
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

  // When in Gutenberg builder mode, use createPortal to inject directly into document.body
  // This makes it truly fullscreen, bypassing all block-editor boundaries / z-index contexts
  if (isGutenberg && activeTab === 'builder' && typeof document !== 'undefined') {
    return createPortal(appContent, document.body);
  }

  return appContent;
}
