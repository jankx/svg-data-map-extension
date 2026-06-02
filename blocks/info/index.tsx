import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import App from '../shared/App';

const InfoEdit = ({ attributes, setAttributes }: any) => {
    const mapId = attributes.mapId || 'default-map';

    return (
        <div className="jankx-svg-data-map-info-editor">
            <App
                blockId="jankx/svg-data-map-info"
                mapId={mapId}
                isGutenberg={true}
            />
        </div>
    );
};

const Save = () => null;

if (typeof registerBlockType !== 'undefined') {
    registerBlockType('jankx/svg-data-map-info', {
        edit: InfoEdit,
        save: Save,
    });
}
