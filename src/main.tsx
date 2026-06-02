import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { render, useEffect } from '@wordpress/element';
import App from './App.tsx';
import metadata from '../block.json';
import { VIETNAM_MAP_PRESET } from './utils/samples.ts';
import './index.css';

// 1. Gutenberg Block Registration
const Edit = ({ attributes, setAttributes }: any) => {
  const config = attributes.config || {};

  const handleConfigChange = (newConfig: any) => {
    setAttributes({ config: newConfig });
  };

  // Auto-sync default config to WordPress on first insert
  // so the block always has a valid config when saved
  useEffect(() => {
    const hasValidConfig = config && Array.isArray(config.regions) && config.regions.length > 0;
    if (!hasValidConfig) {
      setAttributes({ config: VIETNAM_MAP_PRESET });
    }
  }, []); // run once on mount

  return (
    <div className="jankx-svg-data-map-editor">
      <App
        blockConfig={config}
        onBlockConfigChange={handleConfigChange}
        isGutenberg={true}
      />
    </div>
  );
};

const Save = () => null;

// Only register block if wp.blocks is available (editor)
if (typeof registerBlockType !== 'undefined') {
  registerBlockType(metadata.name, {
    edit: Edit,
    save: Save,
  });
}

