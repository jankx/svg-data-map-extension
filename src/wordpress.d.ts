// Type stubs for WordPress packages that are externalized at runtime
// These are provided by WordPress as wp.* globals

declare module '@wordpress/blocks' {
    export function registerBlockType(name: string, settings: Record<string, any>): void;
    export function unregisterBlockType(name: string): void;
}

declare module '@wordpress/element' {
    export function render(element: any, container: Element): void;
    export function createElement(type: any, props: any, ...children: any[]): any;
    export function useEffect(effect: any, deps?: any[]): void;
    export function useState<T>(initial: T): [T, (v: T) => void];
    export function useRef<T>(initial?: T): { current: T };
    export const Fragment: any;
}

declare module '@wordpress/block-editor' {
    export const useBlockProps: any;
    export const InnerBlocks: any;
    export const RichText: any;
}

declare module '@wordpress/components' {
    export const PanelBody: any;
    export const TextControl: any;
    export const SelectControl: any;
    export const ToggleControl: any;
    export const Button: any;
}

declare module '@wordpress/data' {
    export function select(store: string): any;
    export function dispatch(store: string): any;
    export function useSelect(mapSelect: any, deps?: any[]): any;
}

declare module '@wordpress/i18n' {
    export function __(text: string, domain?: string): string;
    export function _n(singular: string, plural: string, count: number, domain?: string): string;
}
