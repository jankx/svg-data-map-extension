import React, { useEffect, useState } from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { BlockControls, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup, PanelBody, Button, ToggleControl, SelectControl } from '@wordpress/components';
import { Eye, Settings, Sun } from 'lucide-react';
import App from '../shared/App';

const MapEdit = ({ attributes, setAttributes }: any) => {
    const config = attributes.config || {};
    const mapId = attributes.mapId || 'default-map';
    const selectionStyle = attributes.selectionStyle || 'fill';
    const selectionAnimation = attributes.selectionAnimation || false;
    const [activeTab, setActiveTab] = useState<'viewer' | 'builder'>('viewer');

    const handleConfigChange = (newConfig: any) => {
        setAttributes({ config: newConfig });
    };

    const handleZoomChange = (zoomState: { scale: number; positionX: number; positionY: number }) => {
        setAttributes({
            zoomScale: zoomState.scale,
            zoomPositionX: zoomState.positionX,
            zoomPositionY: zoomState.positionY
        });
    };

    const updateGlobalSettings = (key: string, value: any) => {
        handleConfigChange({
            ...config,
            settings: {
                ...(config.settings || {}),
                [key]: value
            }
        });
    };

    return (
        <div className="jankx-svg-data-map-editor">
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon={<Eye />}
                        label="Chế độ trình chiếu"
                        isPressed={activeTab === 'viewer'}
                        onClick={() => setActiveTab('viewer')}
                    />
                    <ToolbarButton
                        icon={<Settings />}
                        label="Chế độ chỉnh sửa"
                        isPressed={activeTab === 'builder'}
                        onClick={() => setActiveTab('builder')}
                    />
                </ToolbarGroup>
            </BlockControls>
            <InspectorControls>
                <PanelBody title="Chế độ hiển thị" initialOpen={true}>
                    <div className="jankx-svg-map-mode-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button
                            variant={activeTab === 'viewer' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('viewer')}
                            className="jankx-svg-map-mode-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px',
                                justifyContent: 'flex-start',
                                height: 'auto',
                                minHeight: '44px'
                            }}
                        >
                            <Eye style={{ width: '18px', height: '18px' }} />
                            <span>Chế độ trình chiếu</span>
                        </Button>
                        <Button
                            variant={activeTab === 'builder' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('builder')}
                            className="jankx-svg-map-mode-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px',
                                justifyContent: 'flex-start',
                                height: 'auto',
                                minHeight: '44px'
                            }}
                        >
                            <Settings style={{ width: '18px', height: '18px' }} />
                            <span>Chế độ chỉnh sửa</span>
                        </Button>
                    </div>
                </PanelBody>

                <PanelColorSettings
                    title="Cấu hình màu sắc và hiệu ứng"
                    initialOpen={true}
                    colorSettings={[
                        {
                            value: config.settings?.defaultFillColor || '#e2e8f0',
                            onChange: (color) => updateGlobalSettings('defaultFillColor', color),
                            label: 'Màu sắc nền mặc định',
                        },
                        {
                            value: config.settings?.hoverFillColor || '#cbd5e1',
                            onChange: (color) => updateGlobalSettings('hoverFillColor', color),
                            label: 'Màu sắc khi di chuột (Hover)',
                        },
                        {
                            value: config.settings?.selectedFillColor || '#6366f1',
                            onChange: (color) => updateGlobalSettings('selectedFillColor', color),
                            label: 'Màu sắc khi vùng được chọn',
                        },
                        {
                            value: config.settings?.markerColor || '#ef4444',
                            onChange: (color) => updateGlobalSettings('markerColor', color),
                            label: 'Màu sắc biểu tượng Marker',
                        }
                    ]}
                />

                <PanelBody title="Tiện ích và Nhãn" initialOpen={false}>
                    <ToggleControl
                        label="Hiển thị nhãn cho Marker"
                        checked={config.settings?.showMarkerLabels ?? true}
                        onChange={(val) => updateGlobalSettings('showMarkerLabels', val)}
                    />
                </PanelBody>

                <PanelBody title="Hiệu ứng khi chọn vùng" initialOpen={true}>
                    <SelectControl
                        label="Kiểu hiển thị vùng được chọn"
                        value={selectionStyle}
                        onChange={(val) => setAttributes({ selectionStyle: val })}
                        options={[
                            { label: '🎨 Tô màu (Fill) — Đổi màu vùng', value: 'fill' },
                            { label: '🔍 Phóng to Marker — Zoom pin', value: 'marker-zoom' },
                            { label: '🌟 Tô màu + Viền sáng', value: 'fill-glow' },
                            { label: '📍 Chỉ viền nổi bật', value: 'stroke-only' },
                        ]}
                        help={
                            selectionStyle === 'fill' ? 'Vùng được chọn sẽ đổi sang màu đã cấu hình.' :
                                selectionStyle === 'marker-zoom' ? 'Pin Marker trên vùng được chọn sẽ được phóng to.' :
                                    selectionStyle === 'fill-glow' ? 'Tô màu kết hợp viền phát sáng (glow).' :
                                        'Chỉ hiện viền đậm, không đổi màu nền vùng.'
                        }
                    />
                    <ToggleControl
                        label="Bật hiệu ứng animation khi chọn"
                        checked={selectionAnimation}
                        onChange={(val) => setAttributes({ selectionAnimation: val })}
                        help="Thêm animation nhấp nháy / pulse khi vùng được chọn."
                    />
                </PanelBody>
            </InspectorControls>
            <App
                blockId="jankx/svg-data-map"
                blockConfig={config}
                mapId={mapId}
                onBlockConfigChange={handleConfigChange}
                isGutenberg={true}
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
                zoomScale={attributes.zoomScale || 1}
                zoomPositionX={attributes.zoomPositionX || 0}
                zoomPositionY={attributes.zoomPositionY || 0}
                onZoomChange={handleZoomChange}
                selectionStyle={selectionStyle}
                selectionAnimation={selectionAnimation}
            />
        </div>
    );
};

const Save = () => {
    // Return null to ensure the block is 100% dynamic.
    // The PHP SSR handler (SvgDataMapBlock::render) will output the HTML.
    // This prevents massive multi-megabyte inline SVG strings from being saved
    // into the wp_posts database layout.
    return null;
};

if (typeof registerBlockType !== 'undefined') {
    registerBlockType('jankx/svg-data-map', {
        edit: MapEdit,
        save: Save,
    });
}
