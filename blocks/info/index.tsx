import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import App from '../shared/App';

/**
 * Default inner blocks template:
 * 1. jankx/advanced-filters  — search bar + "Bộ lọc" button (matches mockup top row)
 * 2. jankx/dynamic-data-layout — the scrollable post/item list below
 */
const INFO_TEMPLATE: any = [
    [
        'jankx/advanced-filters',
        {
            filterType: 'keyword',
            layout: 'horizontal',
            keywordFilter: {
                enabled: true,
                placeholder: 'Tìm kiếm......',
            },
            showResetButton: true,
            resetButtonText: 'Bộ lọc',
            ajaxEnabled: true,
        },
    ],
    [
        'jankx/dynamic-data-layout',
        {
            layout: 'list',
            postsPerPage: 10,
            queryPreset: 'custom',
            showTitle: true,
            showExcerpt: true,
            showFeaturedImage: false,
        },
    ],
];

const InfoEdit = ({ attributes, setAttributes }: any) => {
    const mapId = attributes.mapId || 'default-map';

    return (
        <>
            <InspectorControls>
                <PanelBody title="Cấu hình Info Block" initialOpen={true}>
                    <TextControl
                        label="Map ID (liên kết với SVG Data Map block)"
                        value={mapId}
                        onChange={(val: string) => setAttributes({ mapId: val })}
                        help="Nhập cùng Map ID với block SVG Data Map để đồng bộ dữ liệu vùng."
                    />
                    <ToggleControl
                        label="Hiển thị thanh tìm kiếm"
                        checked={attributes.showSearchBar ?? true}
                        onChange={(val: boolean) => setAttributes({ showSearchBar: val })}
                    />
                </PanelBody>
            </InspectorControls>

            <div className="jankx-svg-data-map-info-editor">
                {/* Mini map preview so editor can see which map is linked */}
                <App
                    blockId="jankx/svg-data-map-info"
                    mapId={mapId}
                    isGutenberg={true}
                />

                {/* Inner blocks: advanced-filters on top, dynamic-data-layout below */}
                <div
                    className="jankx-svg-map-info-inner-blocks-container"
                    style={{
                        border: '1px dashed #b3d4e6',
                        borderRadius: '8px',
                        padding: '12px',
                        marginTop: '12px',
                        background: '#f0f8ff',
                    }}
                >
                    <p style={{ fontSize: '10px', color: '#1E4D65', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Nội dung Info Panel (Inner Blocks)
                    </p>
                    <InnerBlocks
                        template={INFO_TEMPLATE}
                        templateLock={false}
                        allowedBlocks={[
                            'jankx/advanced-filters',
                            'jankx/dynamic-data-layout',
                            'jankx/dynamic-data-template',
                            'core/heading',
                            'core/paragraph',
                            'core/group',
                        ]}
                    />
                </div>
            </div>
        </>
    );
};

const Save = () => {
    return <InnerBlocks.Content />;
};

if (typeof registerBlockType !== 'undefined') {
    registerBlockType('jankx/svg-data-map-info', {
        edit: InfoEdit,
        save: Save,
    });
}
