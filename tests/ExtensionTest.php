<?php
/**
 * Mocking necessary Jankx Framework and WordPress environments
 */
namespace Jankx\Extensions {
    if (!class_exists('Jankx\Extensions\AbstractExtension')) {
        abstract class AbstractExtension {
            protected $extension_path;
            protected $extension_url;
            protected $manifest_data;
            public function __construct() {
                $this->init();
            }
            abstract public function init(): void;
            public function set_extension_path($path) { $this->extension_path = $path; }
            public function get_extension_path() { return $this->extension_path; }
            public function set_extension_url($url) { $this->extension_url = $url; }
            public function get_extension_url() { return $this->extension_url; }
            public function set_manifest_data($data) { $this->manifest_data = $data; }
            public function activate() { $this->register_hooks(); }
            abstract public function register_hooks(): void;
        }
    }
}

namespace Jankx\Gutenberg {
    if (!class_exists('Jankx\Gutenberg\Block')) {
        abstract class Block {
            protected $blockPath;
            protected $blockId;
            public function __construct($path) { $this->blockPath = $path; }
            public function getBlockId() { return $this->blockId; }
            public function register(): void {}
        }
    }
}

namespace {
    if (!function_exists('add_action')) {
        function add_action($tag, $callback, $priority = 10, $accepted_args = 1) {}
    }
    if (!function_exists('__')) {
        function __($text, $domain = 'jankx') { return $text; }
    }
    if (!function_exists('is_admin')) {
        function is_admin() { return false; }
    }
    if (!function_exists('esc_attr')) {
        function esc_attr($text) { return $text; }
    }
    if (!function_exists('json_encode')) {
        // use built-in
    }
}

namespace Puleeno\Extensions\SvgDataMap\Tests {
    use PHPUnit\Framework\TestCase;
    use Puleeno\Extensions\SvgDataMap\SvgDataMapExtension;
    use Puleeno\Extensions\SvgDataMap\Gutenberg\SvgDataMapBlock;

    class ExtensionTest extends TestCase
    {
        public function test_extension_initialization()
        {
            $extension = new SvgDataMapExtension();
            $this->assertInstanceOf(SvgDataMapExtension::class, $extension);
        }

        public function test_block_initialization()
        {
            $block = new SvgDataMapBlock('/fake/path');
            // blockId is protected in child but getBlockId should return it
            $this->assertEquals('jankx/svg-data-map', $block->getBlockId());
        }

        public function test_manifest_existence()
        {
            $manifestPath = dirname(dirname(__FILE__)) . '/manifest.json';
            $this->assertFileExists($manifestPath);
            
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $this->assertEquals('svg-data-map', $manifest['extension_id']);
        }
    }
}
