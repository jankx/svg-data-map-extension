/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';

// Mock SVG coordinate transformation logic
function calculateMarkerPosition(
  screenX: number,
  screenY: number,
  layerLeft: number,
  layerTop: number,
  scale: number,
  mode: 'editor' | 'frontend'
): { x: number; y: number } {
  if (mode === 'editor') {
    return {
      x: (screenX - layerLeft) / scale,
      y: (screenY - layerTop) / scale,
    };
  } else {
    // Frontend does not use map zoom scaling
    return {
      x: screenX - layerLeft,
      y: screenY - layerTop,
    };
  }
}

function getMarkerTransform(scale: number, mode: 'editor' | 'frontend'): string {
  if (mode === 'editor') {
    return `translate(-50%, -50%) scale(${1 / scale})`;
  }
  return `translate(-50%, -50%)`;
}

describe('Marker Position Calculation', () => {
  describe('Editor Mode', () => {
    it('should calculate marker position correctly at scale = 1', () => {
      const result = calculateMarkerPosition(400, 300, 0, 0, 1, 'editor');
      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });

    it('should calculate marker position correctly at scale = 2', () => {
      const result = calculateMarkerPosition(400, 300, 0, 0, 2, 'editor');
      expect(result.x).toBe(200);
      expect(result.y).toBe(150);
    });
  });

  describe('Frontend Mode', () => {
    it('should calculate marker position without scale division', () => {
      const result = calculateMarkerPosition(400, 300, 0, 0, 2, 'frontend');
      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });
  });

  describe('Transform application', () => {
    it('editor mode applies counter-scale to keep marker size constant', () => {
      expect(getMarkerTransform(2, 'editor')).toBe('translate(-50%, -50%) scale(0.5)');
      expect(getMarkerTransform(0.5, 'editor')).toBe('translate(-50%, -50%) scale(2)');
    });

    it('frontend mode does not apply scale', () => {
      expect(getMarkerTransform(2, 'frontend')).toBe('translate(-50%, -50%)');
    });
  });
});
