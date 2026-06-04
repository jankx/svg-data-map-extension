import React, { useEffect, useState } from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup, PanelBody, Button, SelectControl } from '@wordpress/components';
import { Eye, Settings, RotateCcw } from 'lucide-react';
import App from '../shared/App';
import { VIETNAM_MAP_PRESET, EXHIBITION_MAP_PRESET } from '../shared/utils/samples';

const MapEdit = ({ attributes, setAttributes }: any) => {
    const config = attributes.config || {};
    const mapId = attributes.mapId || 'default-map';
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

    // Emit event when builder mode changes to hide/show other blocks
    useEffect(() => {
        const event = new CustomEvent('jankx-svg-map-builder-mode', {
            detail: { mapId, isBuilderMode: activeTab === 'builder', blockId: 'jankx/svg-data-map' }
        });
        window.dispatchEvent(event);
    }, [activeTab, mapId]);

    useEffect(() => {
        const hasSvgContent = config && config.svgContent && config.svgContent.trim().length > 0;
        if (!hasSvgContent) {
            setAttributes({ config: VIETNAM_MAP_PRESET });
        }
    }, []);

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
                <PanelBody title="Bản mẫu" initialOpen={false}>
                    <SelectControl
                        label="Chọn bản mẫu"
                        value={config.title?.includes('Việt Nam') ? 'vietnam' : 'exhibition'}
                        options={[
                            { label: 'Bản đồ Việt Nam', value: 'vietnam' },
                            { label: 'Sơ đồ Triển lãm Abstract', value: 'exhibition' }
                        ]}
                        onChange={(value) => {
                            if (value === 'vietnam') {
                                handleConfigChange(VIETNAM_MAP_PRESET);
                            } else {
                                handleConfigChange(EXHIBITION_MAP_PRESET);
                            }
                        }}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (config.title?.includes('Việt Nam')) {
                                handleConfigChange(VIETNAM_MAP_PRESET);
                            } else {
                                handleConfigChange(EXHIBITION_MAP_PRESET);
                            }
                        }}
                        style={{ marginTop: '12px', width: '100%' }}
                    >
                        <RotateCcw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Khôi phục bản mẫu hiện tại
                    </Button>
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
            />
        </div>
    );
};

const Save = ({ attributes }: any) => {
    const config = attributes.config || {};
    const mapId = attributes.mapId || 'default-map';

    // Prepare config for JS without the large SVG content to save space
    const jsConfig = { ...config };
    delete jsConfig.svgContent;

    return (
        <div className="jankx-svg-data-map-runtime font-sans flex flex-col gap-4"
             id="svg-map-runtime"
             data-config={JSON.stringify(jsConfig)}
             data-map-id={mapId}
             data-ssr="yes">
            <div className="relative bg-[#F1F7FA] rounded-[2rem] overflow-hidden shadow-2xl border border-white/50 min-h-[600px] flex items-center justify-center" id="map-container-root">
                <div id="svg-viewport" className="w-full h-full flex items-center justify-center transition-transform duration-75">
                    <div className="jankx-svg-map-wrapper relative w-full h-full flex items-center justify-center pointer-events-auto" style={{minHeight: '500px'}}>
                        {config.svgContent && (
                            <div dangerouslySetInnerHTML={{ __html: config.svgContent }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

if (typeof registerBlockType !== 'undefined') {
    registerBlockType('jankx/svg-data-map', {
        edit: MapEdit,
        save: Save,
    });
}
