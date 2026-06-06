import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

/**
 * Default inner blocks template:
 * 1. jankx/advanced-filters  — search / filter bar
 * 2. jankx/dynamic-data-layout — the post list below
 */
const INFO_TEMPLATE: any = [
    [
        'jankx/advanced-filters',
        {
            filterType: 'keyword',
            layout: 'horizontal',
            keywordFilter: {
                enabled: true,
                placeholder: 'Tìm kiếm...',
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
            queryPreset: 'default',
            showTitle: true,
            showExcerpt: true,
            showFeaturedImage: false,
        },
    ],
];

const InfoEdit = ({ attributes, setAttributes }: any) => {
    const mapId = attributes.mapId || 'default-map';
    const blockProps = useBlockProps({
        className: 'jankx-svg-data-map-info-editor',
        style: { padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }
    });

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

            <div {...blockProps}>
                <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #edf2f7' }}>
                    <h4 style={{ margin: 0, color: '#2d3748', fontSize: '14px' }}>
                        Jankx Info Panel — Linking Map: <code style={{ color: '#e53e3e' }}>{mapId}</code>
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#718096' }}>
                        Thêm các block (Search, Data Layout) vào bên dưới để xây dựng giao diện chi tiết.
                    </p>
                </div>
                <InnerBlocks
                    template={INFO_TEMPLATE}
                    templateLock={false}
                />
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

