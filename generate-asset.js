import { copyFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Copy main CSS to assets/index.css so block.json can reference it
const srcCss = join(__dirname, 'dist/svg-data-map.css');
const dstCss = join(__dirname, 'dist/assets/index.css');
if (existsSync(srcCss)) {
    copyFileSync(srcCss, dstCss);
    console.log('Copied CSS to', dstCss);
}

const version = Date.now().toString();

// Write index.asset.php (editor script - requires WP libs)
writeFileSync(
    join(__dirname, 'dist/assets/index.asset.php'),
    `<?php return array('dependencies' => array('wp-blocks', 'wp-element', 'wp-components', 'wp-i18n', 'wp-block-editor'), 'version' => '${version}');`
);

// Write frontend.asset.php (no WP dependencies — pure vanilla JS)
writeFileSync(
    join(__dirname, 'dist/assets/frontend.asset.php'),
    `<?php return array('dependencies' => array(), 'version' => '${version}');`
);

console.log('Asset PHP files generated.');
