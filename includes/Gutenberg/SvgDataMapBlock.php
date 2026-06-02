<?php
namespace Jankx\Extensions\SvgDataMap\Gutenberg;

use Jankx\Gutenberg\Block;

class SvgDataMapBlock extends Block
{
    protected $blockId = 'jankx/svg-data-map';

    protected function registerHooks(): void
    {
        add_action('enqueue_block_editor_assets', [$this, 'enqueueEditorAssets']);
    }

    public function enqueueEditorAssets()
    {
        $asset_file = $this->blockPath . '/dist/assets/index.asset.php';
        $assets = file_exists($asset_file) ? require $asset_file : [
            'dependencies' => ['wp-blocks', 'wp-element', 'wp-editor'],
            'version' => '1.0.0'
        ];

        // Create correct URL for the script
        $baseUrl = str_replace(ABSPATH, site_url('/'), $this->blockPath);
        // Better way: use the extension instance if available
        $extension = \Jankx\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if ($extension) {
            $scriptUrl = $extension->get_extension_url() . '/dist/assets/index.js';
            $styleUrl = $extension->get_extension_url() . '/dist/assets/index.css';
        } else {
            // fallback
            $scriptUrl = content_url('themes/jankx/extensions/svg-data-map/dist/assets/index.js');
            $styleUrl = content_url('themes/jankx/extensions/svg-data-map/dist/assets/index.css');
        }

        wp_enqueue_script(
            'jankx-svg-data-map-editor',
            $scriptUrl,
            $assets['dependencies'],
            $assets['version'],
            true
        );

        if (file_exists($this->blockPath . '/dist/assets/index.css')) {
            wp_enqueue_style(
                'jankx-svg-data-map-editor',
                $styleUrl,
                [],
                $assets['version']
            );
        }
    }

    public function render($attributes, $content = '', $block = null)
    {
        $config = $attributes['config'] ?? [];
        if (empty($config)) {
            return is_admin() ? __('Vui lòng cấu hình bản đồ.', 'jankx') : '';
        }

        if (is_admin()) {
            // In editor, the React 'Edit' component handles rendering.
            // We return empty here to avoid double rendering if any.
            return '';
        }

        // Enqueue React and other dependencies for frontend
        wp_enqueue_script('wp-element');

        return sprintf(
            '<div class="jankx-svg-data-map-runtime" data-config="%s"></div>',
            esc_attr(json_encode($config))
        );
    }
}
