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
                <p style={{ fontSize: '11px', color: '#1E4D65', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #b3d4e6', paddingBottom: '6px' }}>
                    Jankx SVG Data Map Info — Map ID: <code>{mapId}</code>
                </p>
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

