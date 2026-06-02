<?php
namespace Jankx\Extensions\SvgDataMap;

use Jankx\Extensions\AbstractExtension;
use Jankx\Extensions\SvgDataMap\Gutenberg\SvgDataMapBlock;

class SvgDataMapExtension extends AbstractExtension
{
    protected static $instance;

    public function __construct()
    {
        $this->register_autoloader();
        parent::__construct();
    }

    protected function register_autoloader()
    {
        spl_autoload_register(function ($class) {
            $prefix = 'Jankx\\Extensions\\SvgDataMap\\';
            $base_dir = __DIR__ . '/'; // Current file is in includes/

            $len = strlen($prefix);
            if (strncmp($prefix, $class, $len) !== 0) {
                return;
            }

            $relative_class = substr($class, $len);
            $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

            if (file_exists($file)) {
                require $file;
            }
        });
    }

    public function init(): void
    {
        self::$instance = $this;
        add_action('wp_ajax_svg_data_map_fetch_posts', [$this, 'ajax_fetch_posts']);
        add_action('wp_ajax_nopriv_svg_data_map_fetch_posts', [$this, 'ajax_fetch_posts']);
    }

    public static function get_instance(): ?self
    {
        return self::$instance;
    }

    public function register_hooks(): void
    {
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('init', [$this, 'register_block']);
    }

    public function register_block()
    {
        $block_path = $this->get_extension_path();
        if (file_exists($block_path . '/block.json')) {
            $block = new SvgDataMapBlock($block_path);
            $block->boot();
            $block->register();
        }
    }



    public function ajax_fetch_posts()
    {
        $term_id = isset($_POST['term_id']) ? intval($_POST['term_id']) : 0;
        $taxonomy = isset($_POST['taxonomy']) ? sanitize_text_field($_POST['taxonomy']) : 'category';
        $post_type = isset($_POST['post_type']) ? sanitize_text_field($_POST['post_type']) : 'post';

        if (!$term_id) {
            wp_send_json_error(['message' => 'Invalid parameters']);
        }

        $args = [
            'post_type' => $post_type,
            'posts_per_page' => 5,
            'tax_query' => [
                [
                    'taxonomy' => $taxonomy,
                    'field' => 'term_id',
                    'terms' => $term_id
                ]
            ]
        ];

        $query = new \WP_Query($args);
        $html = '';

        if ($query->have_posts()) {
            $html .= '<ul class="space-y-3">';
            while ($query->have_posts()) {
                $query->the_post();
                $title = get_the_title();
                $link = get_permalink();
                $date = get_the_date();
                
                $html .= '<li class="group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition border-b border-slate-100 last:border-b-0">';
                $html .= '<a href="' . esc_url($link) . '" class="block">';
                $html .= '<h4 class="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition leading-tight">' . esc_html($title) . '</h4>';
                $html .= '<p class="text-[10px] text-slate-400 mt-1">' . esc_html($date) . '</p>';
                $html .= '</a>';
                $html .= '</li>';
            }
            $html .= '</ul>';
            wp_reset_postdata();
        } else {
            $html = '<p class="text-slate-400 text-xs italic">Chưa có bài viết nào trong khu vực này.</p>';
        }

        wp_send_json_success(['html' => $html]);
    }

    public function register_admin_menu()
    {
        add_menu_page(
            __('SVG Data Map', 'jankx'),
            __('SVG Data Map', 'jankx'),
            'manage_options',
            'svg-data-map',
            [$this, 'render_admin_page'],
            'dashicons-location-alt',
            30
        );
    }

    public function render_admin_page()
    {
        echo '<div id="root"></div>';
    }

    public function enqueue_admin_assets($hook)
    {
        if ($hook !== 'toplevel_page_svg-data-map') {
            return;
        }

        $base_url = $this->get_extension_url();
        
        // In development, we might want to load from Vite dev server
        // For now, let's assume it's built or we point to the vite dev server if it's running
        if (defined('JANKX_DEBUG') && JANKX_DEBUG) {
             wp_enqueue_script('svg-data-map-vite', 'http://localhost:3000/src/main.tsx', [], null, true);
             // We need to add type="module" to the script tag
             add_filter('script_loader_tag', function($tag, $handle) {
                 if ($handle === 'svg-data-map-vite') {
                     return str_replace('<script ', '<script type="module" ', $tag);
                 }
                 return $tag;
             }, 10, 2);
        } else {
            // Load from build directory
            $manifest_path = $this->get_extension_path() . '/dist/.vite/manifest.json';
            if (file_exists($manifest_path)) {
                $manifest = json_decode(file_get_contents($manifest_path), true);
                
                // Enqueue main script
                if (isset($manifest['src/main.tsx'])) {
                    $entry = $manifest['src/main.tsx'];
                    wp_enqueue_script('svg-data-map', $base_url . '/dist/' . $entry['file'], ['wp-element', 'wp-blocks'], $this->get_version(), true);
                    
                    // Enqueue script dependencies from .asset.php if it exists
                    $asset_file = $this->get_extension_path() . '/dist/assets/index.asset.php';
                    if (file_exists($asset_file)) {
                        $assets = require $asset_file;
                        foreach ($assets['dependencies'] as $dep) {
                            wp_enqueue_script($dep);
                        }
                    }
                }

                // Enqueue main style
                if (isset($manifest['style.css'])) {
                    wp_enqueue_style('svg-data-map', $base_url . '/dist/' . $manifest['style.css']['file'], [], $this->get_version());
                } elseif (isset($manifest['src/main.tsx']['css'])) {
                    foreach ($manifest['src/main.tsx']['css'] as $css) {
                        wp_enqueue_style('svg-data-map', $base_url . '/dist/' . $css, [], $this->get_version());
                    }
                }
            }
        }
    }
}
