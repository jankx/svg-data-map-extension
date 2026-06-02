import React, { useEffect } from 'react';
import { registerBlockType } from '@wordpress/blocks';
import App from '../shared/App';
import { VIETNAM_MAP_PRESET } from '../shared/utils/samples';

const MapEdit = ({ attributes, setAttributes }: any) => {
    const config = attributes.config || {};
    const mapId = attributes.mapId || 'default-map';

    const handleConfigChange = (newConfig: any) => {
        setAttributes({ config: newConfig });
    };

    useEffect(() => {
        const hasValidConfig = config && Array.isArray(config.regions) && config.regions.length > 0;
        if (!hasValidConfig) {
            setAttributes({ config: VIETNAM_MAP_PRESET });
        }
    }, []);

    return (
        <div className="jankx-svg-data-map-editor">
            <App
                blockId="jankx/svg-data-map"
                blockConfig={config}
                mapId={mapId}
                onBlockConfigChange={handleConfigChange}
                isGutenberg={true}
            />
        </div>
    );
};

const Save = () => null;

if (typeof registerBlockType !== 'undefined') {
    registerBlockType('jankx/svg-data-map', {
        edit: MapEdit,
        save: Save,
    });
}
