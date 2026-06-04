import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import App from '../shared/App';

const INFO_TEMPLATE: any = [
    ['jankx/dynamic-data-layout', {
        layout: 'default',
        query_preset: 'default'
    }]
];

const InfoEdit = ({ attributes, setAttributes }: any) => {
    const mapId = attributes.mapId || 'default-map';

    return (
        <div className="jankx-svg-data-map-info-editor">
            <App
                blockId="jankx/svg-data-map-info"
                mapId={mapId}
                isGutenberg={true}
            />
            <div className="jankx-svg-map-info-inner-blocks-container" style={{ border: '1px dashed #ccc', padding: '10px', marginTop: '10px' }}>
                <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Nội dung mặc định (Inner Blocks):</p>
                <InnerBlocks
                    template={INFO_TEMPLATE}
                    templateLock={false}
                />
            </div>
        </div>
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
