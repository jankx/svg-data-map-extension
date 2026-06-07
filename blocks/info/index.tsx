import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl } from '@wordpress/components';

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

// Scrollbar style presets
const SCROLLBAR_STYLES: Record<string, string> = {
    none: '',
    thin: `
        .jankx-svg-info-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .jankx-svg-info-scroll::-webkit-scrollbar-track { background: transparent; }
        .jankx-svg-info-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.35); border-radius: 99px; }
        .jankx-svg-info-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.6); }
        .jankx-svg-info-scroll { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,0.35) transparent; }
    `,
    modern: `
        .jankx-svg-info-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .jankx-svg-info-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
        .jankx-svg-info-scroll::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #a5b4fc, #818cf8); border-radius: 99px; }
        .jankx-svg-info-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #818cf8, #6366f1); }
        .jankx-svg-info-scroll { scrollbar-width: thin; scrollbar-color: #818cf8 #f1f5f9; }
    `,
    wide: `
        .jankx-svg-info-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .jankx-svg-info-scroll::-webkit-scrollbar-track { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .jankx-svg-info-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; border: 2px solid #f8fafc; }
        .jankx-svg-info-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .jankx-svg-info-scroll { scrollbar-width: auto; }
    `,
};

const InfoEdit = ({ attributes, setAttributes }: any) => {
    const mapId = attributes.mapId || 'default-map';
    const maxHeight = attributes.maxHeight || '';
    const maxHeightUnit = attributes.maxHeightUnit || 'px';
    const scrollbarStyle = attributes.scrollbarStyle || 'thin';
    const minHeight = attributes.minHeight || '';
    const minHeightUnit = attributes.minHeightUnit || 'px';

    // Build the inline max-height value
    const computedMaxHeight = maxHeight ? `${maxHeight}${maxHeightUnit}` : '';
    const computedMinHeight = minHeight ? `${minHeight}${minHeightUnit}` : '';

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

                <PanelBody title="Giới hạn chiều cao & Cuộn" initialOpen={true}>
                    <TextControl
                        label="Chiều cao tối đa (để trống = không giới hạn)"
                        value={maxHeight}
                        type="number"
                        onChange={(val: string) => setAttributes({ maxHeight: val })}
                        help={computedMaxHeight ? `Áp dụng: max-height: ${computedMaxHeight}` : 'Chưa đặt giới hạn chiều cao.'}
                    />
                    <SelectControl
                        label="Đơn vị chiều cao"
                        value={maxHeightUnit}
                        options={[
                            { label: 'px — Pixel cố định', value: 'px' },
                            { label: '% — Phần trăm thẻ cha', value: '%' },
                            { label: 'vh — Phần trăm chiều cao màn hình', value: 'vh' },
                            { label: 'vw — Phần trăm chiều rộng màn hình', value: 'vw' },
                            { label: 'em — Tương đối với font-size', value: 'em' },
                            { label: 'rem — Tương đối với font-size gốc', value: 'rem' },
                        ]}
                        onChange={(val: string) => setAttributes({ maxHeightUnit: val })}
                    />
                    <TextControl
                        label="Chiều cao tối thiểu (để trống = không giới hạn)"
                        value={minHeight}
                        type="number"
                        onChange={(val: string) => setAttributes({ minHeight: val })}
                        help={computedMinHeight ? `Áp dụng: min-height: ${computedMinHeight}` : 'Chưa đặt chiều cao tối thiểu.'}
                    />
                    <SelectControl
                        label="Đơn vị chiều cao tối thiểu"
                        value={minHeightUnit}
                        options={[
                            { label: 'px — Pixel cố định', value: 'px' },
                            { label: '% — Phần trăm thẻ cha', value: '%' },
                            { label: 'vh — Phần trăm chiều cao màn hình', value: 'vh' },
                            { label: 'vw — Phần trăm chiều rộng màn hình', value: 'vw' },
                            { label: 'em — Tương đối với font-size', value: 'em' },
                            { label: 'rem — Tương đối với font-size gốc', value: 'rem' },
                        ]}
                        onChange={(val: string) => setAttributes({ minHeightUnit: val })}
                    />
                    <SelectControl
                        label="Kiểu thanh cuộn (Scrollbar)"
                        value={scrollbarStyle}
                        options={[
                            { label: 'Không có scrollbar', value: 'none' },
                            { label: 'Mỏng — Đơn giản tinh tế', value: 'thin' },
                            { label: 'Hiện đại — Gradient tím indigo', value: 'modern' },
                            { label: 'Rộng — Classic rõ ràng', value: 'wide' },
                        ]}
                        onChange={(val: string) => setAttributes({ scrollbarStyle: val })}
                    />
                    {computedMaxHeight && scrollbarStyle !== 'none' && (
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 6,
                            padding: '8px 10px',
                            fontSize: 11,
                            color: '#166534',
                            marginTop: 8
                        }}>
                            ✅ Bật cuộn: nội dung cao hơn <strong>{computedMaxHeight}</strong> sẽ trigger scrollbar.
                        </div>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #edf2f7' }}>
                    <h4 style={{ margin: 0, color: '#2d3748', fontSize: '14px' }}>
                        Jankx Info Panel — Linking Map: <code style={{ color: '#e53e3e' }}>{mapId}</code>
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#718096' }}>
                        Thêm các block (Search, Data Layout) vào bên dưới để xây dựng giao diện chi tiết.
                        {computedMaxHeight && <> · <strong>Max height:</strong> {computedMaxHeight}</>}
                        {computedMinHeight && <> · <strong>Min height:</strong> {computedMinHeight}</>}
                        {computedMaxHeight && <> · Scrollbar: <em>{scrollbarStyle}</em></>}
                    </p>
                </div>
                <div
                    className={computedMaxHeight ? 'jankx-svg-info-scroll' : ''}
                    style={{
                        ...(computedMaxHeight ? { maxHeight: computedMaxHeight, overflowY: 'auto' } : {}),
                        ...(computedMinHeight ? { minHeight: computedMinHeight } : {})
                    }}
                >
                    <InnerBlocks
                        template={INFO_TEMPLATE}
                        templateLock={false}
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
