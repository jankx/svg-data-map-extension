<?php
namespace Puleeno\Extensions\SvgDataMap\Gutenberg;

use Jankx\Gutenberg\Block;

class SvgDataMapInfoBlock extends Block
{
    protected $blockId = 'jankx/svg-data-map-info';

    protected function registerEditorAssets(): void
    {
        $asset_file = dirname(dirname($this->blockPath)) . '/dist/assets/index.asset.php';
        $assets = file_exists($asset_file) ? require $asset_file : [
            'dependencies' => ['wp-blocks', 'wp-element', 'wp-editor'],
            'version' => '1.0.0'
        ];

        $extension = \Puleeno\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

        $scriptUrl = $extension->get_extension_url() . '/dist/assets/index.js';

        wp_enqueue_script(
            'jankx-svg-data-map-info-editor',
            $scriptUrl,
            $assets['dependencies'],
            '999.9.9',
            true
        );
    }

    protected function registerFrontendAssets(): void
    {
        $extension = \Puleeno\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

        $scriptUrl = $extension->get_extension_url() . '/dist/assets/frontend.js';
        wp_enqueue_script(
            'jankx-svg-data-map-frontend',
            $scriptUrl,
            [],
            '1.0.0',
            true
        );
    }

    public function render($attributes, $content = '', $block = null)
    {
        $mapId        = $attributes['mapId'] ?? 'default-map';
        $hasContent   = trim((string) $content) !== '';

        ob_start();
        ?>
        <div class="jankx-svg-data-map-info-runtime"
             id="svg-map-info-<?php echo esc_attr($mapId); ?>"
             data-map-id="<?php echo esc_attr($mapId); ?>">

            <div class="jankx-svg-map-info-container">
                <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            </div><!-- .jankx-svg-map-info-container -->

        </div><!-- .jankx-svg-data-map-info-runtime -->
        <?php
        return ob_get_clean();
    }
}
