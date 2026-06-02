import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { render } from '@wordpress/element';
import App from './App.tsx';
import metadata from '../block.json';
import './index.css';

// 1. Gutenberg Block Registration
const Edit = ({ attributes, setAttributes }: any) => {
  const config = attributes.config || {};

  const handleConfigChange = (newConfig: any) => {
    setAttributes({ config: newConfig });
  };

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

// 2. Runtime & Admin Page Mounting
document.addEventListener('DOMContentLoaded', () => {
  // Handle standalone admin page if #root exists
  const rootElement = document.getElementById('root');
  if (rootElement) {
    render(<App isGutenberg={true} />, rootElement);
  }
});
