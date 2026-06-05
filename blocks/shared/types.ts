/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MarkerIconType = string;

export interface DataItem {
  id: string;
  title: string;
  description: string;
  linkUrl?: string;
  linkLabel?: string;
}

export interface MarkerConfig {
  id: string;
  x: number; // percentage x (0-100) on view space
  y: number; // percentage y (0-100) on view space
  iconType: MarkerIconType;
  customIconName?: string;
  label?: string;
  showLabel?: boolean;
  showAnimation?: boolean;
  markerOffsetX?: number; // pixel offset from centroid (screen px at scale=1), saved after drag
  markerOffsetY?: number; // pixel offset from centroid (screen px at scale=1), saved after drag
}

export interface RegionConfig {
  id: string;
  name: string;
  pathIds: string[]; // SVG element path/polygon IDs grouped together
  fillColor?: string; // Custom region background color override
  hoverFillColor?: string; // Custom region hover color override
  marker?: MarkerConfig; // Optional interactive pin marker on the map
  items: DataItem[]; // Dynamic lists/articles to show (exactly like in the screenshot)
  description?: string; // Quick summary
  termId?: number; // WordPress taxonomy term ID
  taxonomy?: string; // WordPress taxonomy slug
  postType?: string; // WordPress post type slug
}

export interface MapSettings {
  defaultFillColor: string;
  hoverFillColor: string;
  selectedFillColor: string;
  markerColor: string;
  backgroundColor: string;
  showMarkerLabels: boolean;
}

export interface SVGMapConfig {
  title: string;
  description: string;
  svgContent: string; // Normalized or original SVG code in string
  regions: RegionConfig[];
  settings: MapSettings;
}
