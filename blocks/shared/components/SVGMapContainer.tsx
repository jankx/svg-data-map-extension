/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  SVGMapConfig,
  RegionConfig,
  MarkerIconType
} from '../types';
import {
  Bus,
  Bed,
  Utensils,
  Camera,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
  Maximize2
} from 'lucide-react';

interface SVGMapContainerProps {
  config: SVGMapConfig;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
  // Builder specific props
  isBuilderMode?: boolean;
  onSelectPathId?: (pathId: string) => void;
  onPlaceMarkerCoords?: (coords: { x: number; y: number }) => void;
  selectedPathIdsForGrouping?: string[];
  isPlacingMarker?: boolean;
  // Zoom state props for Gutenberg persistence
  zoomScale?: number;
  zoomPositionX?: number;
  zoomPositionY?: number;
  onZoomChange?: (zoomState: { scale: number; positionX: number; positionY: number }) => void;
  isGutenberg?: boolean;
}

export function SVGMapContainer({
  config,
  selectedRegionId,
  onSelectRegion,
  isBuilderMode = false,
  onSelectPathId,
  onPlaceMarkerCoords,
  selectedPathIdsForGrouping = [],
  isPlacingMarker = false,
  zoomScale = 1,
  zoomPositionX = 0,
  zoomPositionY = 0,
  onZoomChange,
  isGutenberg = false,
}: SVGMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredPathId, setHoveredPathId] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<RegionConfig | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Pan and Zoom States
  const [scale, setScale] = useState(zoomScale);
  const [position, setPosition] = useState({ x: zoomPositionX, y: zoomPositionY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync zoom state with props when in Gutenberg mode
  useEffect(() => {
    if (isGutenberg) {
      setScale(zoomScale);
      setPosition({ x: zoomPositionX, y: zoomPositionY });
    }
  }, [zoomScale, zoomPositionX, zoomPositionY, isGutenberg]);

  // Save zoom state to block attributes when in Gutenberg mode
  const handleZoomStateChange = (newScale: number, newPosition: { x: number; y: number }) => {
    setScale(newScale);
    setPosition(newPosition);
    if (isGutenberg && onZoomChange) {
      onZoomChange({ scale: newScale, positionX: newPosition.x, positionY: newPosition.y });
    }
  };

  // Reset pan and zoom when svg change (only in non-Gutenberg mode or when not persisted)
  useEffect(() => {
    if (!isGutenberg) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [config.svgContent, isGutenberg]);

  // Find region by path ID
  const findRegionByPathId = (pathId: string): RegionConfig | null => {
    if (!pathId) return null;
    return config.regions.find(r => r.pathIds.includes(pathId)) || null;
  };

  // Find path details to show tooltip on hover
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    const pathId = target.getAttribute('id');
    if (pathId) {
      setHoveredPathId(pathId);
      const region = findRegionByPathId(pathId);
      setHoveredRegion(region);

      // Calculate tooltip position relative to container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: e.clientX - rect.left + 15,
          y: e.clientY - rect.top + 15,
        });
      }
    } else {
      setHoveredPathId(null);
      setHoveredRegion(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && (hoveredPathId || hoveredRegion)) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPathId(null);
    setHoveredRegion(null);
  };

  // Click handler using event delegation
  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If placing marker in builder mode, capture click coordinates first!
    if (isBuilderMode && isPlacingMarker && onPlaceMarkerCoords && svgWrapperRef.current) {
      const rect = svgWrapperRef.current.getBoundingClientRect();
      // Calculate % relative coordinates inside the SVG
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onPlaceMarkerCoords({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
      return;
    }

    const target = e.target as SVGElement;
    const pathId = target.getAttribute('id');

    if (!pathId) {
      // Clicked on background, deselect unless we dragging or in special mode
      if (!isDragging) {
        onSelectRegion(null);
      }
      return;
    }

    if (isBuilderMode && onSelectPathId) {
      onSelectPathId(pathId);
    }

    const matchedRegion = findRegionByPathId(pathId);
    if (matchedRegion) {
      onSelectRegion(matchedRegion.id === selectedRegionId ? null : matchedRegion.id);
    } else if (!isBuilderMode) {
      onSelectRegion(null);
    }
  };

  // Drag listeners for Map Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only permit dragging if we are NOT in marker placement mode, or if clicking middle mouse / space
    if (isPlacingMarker) return;

    // Check if target is a button or input to not disrupt UI
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.no-drag')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleDragMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    handleZoomStateChange(scale, newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    let newScale = scale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
    newScale = Math.max(0.5, Math.min(5, newScale));
    handleZoomStateChange(newScale, position);
  };

  const handleZoomIn = () => handleZoomStateChange(Math.min(5, scale + 0.25), position);
  const handleZoomOut = () => handleZoomStateChange(Math.max(0.5, scale - 0.25), position);
  const handleResetView = () => {
    handleZoomStateChange(1, { x: 0, y: 0 });
  };

  const getMarkerIcon = (type: MarkerIconType) => {
    switch (type) {
      case 'transport':
        return <Bus className="w-5 h-5 text-white" id="icon-bus" />;
      case 'hotel':
        return <Bed className="w-5 h-5 text-white" id="icon-bed" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-white" id="icon-food" />;
      case 'scenic':
        return <Camera className="w-5 h-5 text-white" id="icon-camera" />;
      case 'pin':
      default:
        return <MapPin className="w-5 h-5 text-white" id="icon-pin" />;
    }
  };

  // Build reactive CSS styles to override SVG element fills according to configuration parameters
  const generateStyleSheets = (): string => {
    const defaultColor = config.settings?.defaultFillColor || '#e2edf5';
    const hoverColor = config.settings?.hoverFillColor || '#93c5fd';
    const selectedColor = config.settings?.selectedFillColor || '#3b82f6';

    let css = `
      #vietnam-regions path, #vietnam-regions circle, #exhibition-zones rect, #exhibition-zones path {
        transition: fill 0.2s ease, opacity 0.2s ease, stroke-width 0.2s ease;
      }
    `;

    // 1. Group custom styling for regions
    config.regions.forEach(region => {
      const isSelected = selectedRegionId === region.id;
      const baseColor = region.fillColor || defaultColor;
      const regionHoverColor = region.hoverFillColor || hoverColor;

      region.pathIds.forEach(pathId => {
        if (isSelected) {
          css += `
            #${pathId} {
              fill: ${selectedColor} !important;
              stroke: #ffffff !important;
              stroke-width: 3px !important;
              opacity: 1 !important;
            }
          `;
        } else {
          css += `
            #${pathId} {
              fill: ${baseColor} !important;
              opacity: 0.85;
            }
            #${pathId}:hover {
              fill: ${regionHoverColor} !important;
              opacity: 1 !important;
            }
          `;
        }
      });
    });

    // 2. Select visual items highlight in Builder Mode (under grouping workflow)
    if (isBuilderMode && selectedPathIdsForGrouping.length > 0) {
      selectedPathIdsForGrouping.forEach(id => {
        css += `
          #${id} {
            fill: #9553e6 !important;
            stroke: #ffffff !important;
            stroke-width: 2.5px !important;
            opacity: 1 !important;
          }
        `;
      });
    }

    // 3. Hover global logic (fallback for non-mapped paths)
    css += `
      path:hover, circle:hover, rect:hover {
        fill: ${hoverColor} !important;
        opacity: 1 !important;
        cursor: pointer;
      }
    `;
    // 4. Marker Animations
    if (config.settings.showMarkerAnimation) {
      css += `
        @keyframes jankx-mark-pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        .jankx-marker-pulse::before {
          content: "";
          position: absolute;
          top: 18px;
          left: 50%;
          width: 36px;
          height: 36px;
          background-color: ${config.settings.markerColor || '#3b82f6'};
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          animation: jankx-mark-pulse 2s infinite;
          opacity: 0;
        }
      `;
    }

    return css;
  };

  return (
    <div
      id="map-container-root"
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden bg-slate-50 border border-slate-200/80 rounded-2xl shadow-inner min-h-[500px]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleDragMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : isPlacingMarker ? 'crosshair' : 'grab' }}
    >
      {/* 1. Style Injector block */}
      <style dangerouslySetInnerHTML={{ __html: generateStyleSheets() }} />

      {/* 2. Interactive SVG Canvas Frame with zoom and pan transform applied */}
      <div
        id="svg-viewport"
        ref={svgWrapperRef}
        className="w-full h-full flex items-center justify-center origin-center transition-transform duration-75"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
        onClick={handleSvgClick}
        onMouseOver={handleMouseOver}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full h-full max-w-full max-h-full flex items-center justify-center p-4 pointer-events-auto"
          dangerouslySetInnerHTML={{ __html: config.svgContent }}
        />

        {/* 3. Interactive Floating Coordinate Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {config.regions.map(region => {
            if (!region.marker) return null;
            const isSelected = selectedRegionId === region.id;
            const markerColor = config.settings?.markerColor || '#f97316';

            return (
              <button
                key={region.marker.id}
                id={`marker-btn-${region.marker.id}`}
                className={`absolute pointer-events-auto transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/marker no-drag ${config.settings.showMarkerAnimation ? 'jankx-marker-pulse' : ''}`}
                style={{
                  left: `${region.marker.x}%`,
                  top: `${region.marker.y}%`,
                  zIndex: isSelected ? 40 : 20
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRegion(region.id === selectedRegionId ? null : region.id);
                }}
              >
                {/* Ping wave animation for active/selected marker */}
                {isSelected && (
                  <span
                    className="absolute inline-flex h-10 w-10 rounded-full opacity-60 animate-ping"
                    style={{ backgroundColor: markerColor }}
                  />
                )}

                {/* Standard badge */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all border-2 border-white cursor-pointer ${isSelected ? 'scale-115 shadow-lg shadow-orange-500/20' : 'group-hover/marker:scale-110 shadow-sm'
                    }`}
                  style={{ backgroundColor: isSelected ? '#1e3a8a' : markerColor }}
                >
                  {getMarkerIcon(region.marker.iconType)}
                </div>

                {/* Micro Label */}
                {region.marker.label && (
                  <div className={`mt-1 font-sans text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transition-all border ${isSelected
                    ? 'bg-blue-900 text-white border-blue-800 scale-105'
                    : 'bg-white text-slate-800 border-slate-100 opacity-90 group-hover/marker:opacity-100 group-hover/marker:scale-105'
                    }`}>
                    {region.marker.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Controls overlays in corner */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg border border-slate-100 shadow-md no-drag">
        <button
          id="btn-zoom-in"
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-reset"
          onClick={handleResetView}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition border-t border-slate-100"
          title="Đặt lại góc nhìn"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Helper legend overlay in corner (only in Gutenberg/Builder mode) */}
      {isGutenberg && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-2 rounded-lg border border-slate-100 shadow-md no-drag max-w-xs text-[11px] text-slate-500 flex flex-col gap-1.5">
          <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Hướng dẫn thao tác
          </span>
          <div className="flex flex-col gap-0.5 leading-relaxed">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 rounded bg-blue-300"></span> Cuộn chuột: Phóng to / Thu nhỏ
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 rounded bg-blue-300"></span> Kéo chuột: Di chuyển bản đồ
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 rounded bg-blue-300"></span> Click địa danh: Xem chi tiết
            </div>
          </div>
        </div>
      )}

      {/* 5. Rich Hover Tooltip info card (only in Gutenberg/Builder mode) */}
      {isGutenberg && (hoveredPathId || hoveredRegion) && (
        <div
          id="svg-map-tooltip"
          className="absolute z-50 pointer-events-none p-3 bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl border border-slate-800 max-w-xs transition-opacity duration-150 text-xs"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="font-bold text-sm text-blue-300 flex items-center gap-1.5 justify-between">
            <span>{hoveredRegion ? hoveredRegion.name : `Vector: #${hoveredPathId}`}</span>
            {hoveredRegion && (
              <span className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">Đã định danh</span>
            )}
          </div>

          {hoveredRegion?.description ? (
            <p className="mt-1 text-slate-300 text-[11px] line-clamp-3 leading-relaxed">{hoveredRegion.description}</p>
          ) : (
            <p className="mt-1 text-slate-400 text-[11px] italic">
              {isBuilderMode ? 'Click để chọn gom nhóm hoặc định danh cho vector này.' : 'Vùng chưa gán dữ liệu chi tiết.'}
            </p>
          )}

          {hoveredRegion?.items && hoveredRegion.items.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>📚 Chứa {hoveredRegion.items.length} bài viết dữ liệu</span>
              <span className="text-blue-400 font-semibold">Xem chi tiết &rarr;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
