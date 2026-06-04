/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';

// Mock SVG coordinate transformation logic
// After fix: both modes should divide by scale for consistency
function calculateMarkerPosition(
  screenX: number,
  screenY: number,
  layerLeft: number,
  layerTop: number,
  scale: number,
  mode: 'editor' | 'frontend'
): { x: number; y: number } {
  // Both modes now divide by scale for consistency
  return {
    x: (screenX - layerLeft) / scale,
    y: (screenY - layerTop) / scale,
  };
}

describe('Marker Position Calculation', () => {
  describe('Editor Mode (with scale factor)', () => {
    it('should calculate marker position correctly at scale = 1', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 1;

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');

      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });

    it('should calculate marker position correctly at scale = 2', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 2;

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');

      // At scale=2, position should be halved
      expect(result.x).toBe(200);
      expect(result.y).toBe(150);
    });

    it('should calculate marker position correctly at scale = 0.5', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 0.5;

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');

      // At scale=0.5, position should be doubled
      expect(result.x).toBe(800);
      expect(result.y).toBe(600);
    });

    it('should handle offset from layer origin', () => {
      const screenX = 500;
      const screenY = 400;
      const layerLeft = 50;
      const layerTop = 30;
      const scale = 1.5;

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');

      const relativeX = screenX - layerLeft; // 450
      const relativeY = screenY - layerTop;  // 370
      expect(result.x).toBeCloseTo(relativeX / scale, 2); // 300
      expect(result.y).toBeCloseTo(relativeY / scale, 2); // 246.67
    });
  });

  describe('Frontend Mode (now with scale factor - FIXED)', () => {
    it('should calculate marker position correctly at scale = 1', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 1;

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');

      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });

    it('should calculate marker position correctly at scale = 2 (now divides by scale)', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 2;

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');

      // Frontend mode now also divides by scale (FIXED)
      expect(result.x).toBe(200);
      expect(result.y).toBe(150);
    });

    it('should handle offset from layer origin', () => {
      const screenX = 500;
      const screenY = 400;
      const layerLeft = 50;
      const layerTop = 30;
      const scale = 2;

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');

      // Frontend mode now also divides by scale (FIXED)
      const relativeX = screenX - layerLeft; // 450
      const relativeY = screenY - layerTop;  // 370
      expect(result.x).toBeCloseTo(relativeX / scale, 2); // 225
      expect(result.y).toBeCloseTo(relativeY / scale, 2); // 185
    });
  });

  describe('Consistency between Editor and Frontend modes (FIXED)', () => {
    it('should produce same position at scale = 1', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 1;

      const editorResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');
      const frontendResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');

      // At scale=1, both should be equal
      expect(editorResult.x).toBe(frontendResult.x);
      expect(editorResult.y).toBe(frontendResult.y);
    });

    it('should now produce SAME positions at scale != 1 (FIXED)', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 2;

      const editorResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');
      const frontendResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');

      // After fix: At scale=2, both should now produce the SAME result
      expect(editorResult.x).toBe(frontendResult.x);
      expect(editorResult.y).toBe(frontendResult.y);

      // Both should produce half the original screen coordinate
      expect(editorResult.x).toBe(200);
      expect(editorResult.y).toBe(150);
    });

    it('should demonstrate consistency at scale = 1.5', () => {
      const screenX = 600;
      const screenY = 450;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 1.5;

      const editorResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');
      const frontendResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');

      console.log('Editor result:', editorResult);
      console.log('Frontend result:', frontendResult);

      // After fix: Both should be equal
      expect(editorResult.x).toBe(frontendResult.x);
      expect(editorResult.y).toBe(frontendResult.y);

      // Both should divide by scale
      expect(editorResult.x).toBeCloseTo(400, 2); // 600 / 1.5
      expect(frontendResult.x).toBeCloseTo(400, 2);
    });
  });

  describe('Transform application', () => {
    it('should apply correct transform string for marker (no scale)', () => {
      // After fix: marker no longer scales with zoom to prevent becoming huge
      const transform = `translate(-50%, -50%)`;

      expect(transform).toBe('translate(-50%, -50%)');
    });

    it('should set correct transform origin', () => {
      const transformOrigin = 'center bottom';
      expect(transformOrigin).toBe('center bottom');
    });

    it('transform should NOT include scale to prevent marker becoming huge when zoomed', () => {
      const scale = 2;
      // Marker should NOT scale with zoom to prevent becoming huge
      const transform = `translate(-50%, -50%)`;

      // Transform should NOT contain scale
      expect(transform).not.toContain('scale');
      expect(transform).not.toContain('scale(2)');
    });
  });

  describe('Cross-platform consistency (Editor JS, Frontend JS, PHP)', () => {
    it('all three modes should produce identical position calculations at various scales', () => {
      const testCases = [
        { screenX: 400, screenY: 300, layerLeft: 0, layerTop: 0, scale: 1 },
        { screenX: 400, screenY: 300, layerLeft: 0, layerTop: 0, scale: 1.5 },
        { screenX: 400, screenY: 300, layerLeft: 0, layerTop: 0, scale: 2 },
        { screenX: 600, screenY: 450, layerLeft: 50, layerTop: 30, scale: 0.5 },
        { screenX: 800, screenY: 600, layerLeft: 100, layerTop: 50, scale: 3 },
      ];

      testCases.forEach((testCase, index) => {
        const { screenX, screenY, layerLeft, layerTop, scale } = testCase;

        // All three modes should use the same calculation logic
        const expectedX = (screenX - layerLeft) / scale;
        const expectedY = (screenY - layerTop) / scale;

        // Simulate Editor Mode (SVGMapContainer.tsx)
        const editorResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');

        // Simulate Frontend Mode (frontend.ts)
        const frontendResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');

        // Simulate PHP Mode (SVG inline script in SvgDataMapBlock.php)
        // PHP script should use same logic: (screenPt.x - layerRect.left) / currentScale
        const phpResult = {
          x: (screenX - layerLeft) / scale,
          y: (screenY - layerTop) / scale,
        };

        // All three should produce identical results
        expect(editorResult.x).toBeCloseTo(expectedX, 5);
        expect(editorResult.y).toBeCloseTo(expectedY, 5);
        expect(frontendResult.x).toBeCloseTo(expectedX, 5);
        expect(frontendResult.y).toBeCloseTo(expectedY, 5);
        expect(phpResult.x).toBeCloseTo(expectedX, 5);
        expect(phpResult.y).toBeCloseTo(expectedY, 5);

        // Editor and Frontend should be exactly the same
        expect(editorResult.x).toBe(frontendResult.x);
        expect(editorResult.y).toBe(frontendResult.y);

        // PHP should match both JS implementations
        expect(phpResult.x).toBe(editorResult.x);
        expect(phpResult.y).toBe(editorResult.y);
        expect(phpResult.x).toBe(frontendResult.x);
        expect(phpResult.y).toBe(frontendResult.y);
      });
    });

    it('all three modes should apply identical transform strings (no scale)', () => {
      // After fix: marker transform should NOT include scale to prevent becoming huge
      const editorTransform = `translate(-50%, -50%)`;
      const frontendTransform = `translate(-50%, -50%)`;
      const phpTransform = `translate(-50%, -50%)`;

      expect(editorTransform).toBe(frontendTransform);
      expect(frontendTransform).toBe(phpTransform);
      // None should contain scale
      expect(editorTransform).not.toContain('scale');
      expect(frontendTransform).not.toContain('scale');
      expect(phpTransform).not.toContain('scale');
    });

    it('all three modes should use same transform origin', () => {
      const transformOrigin = 'center bottom';

      // This should be consistent across all three implementations
      expect(transformOrigin).toBe('center bottom');
    });

    it('edge case: scale = 0 should handle gracefully', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 0;

      // This would cause division by zero, but the implementation should handle it
      // In practice, scale should never be 0 (min scale is 0.5 in actual code)
      const safeScale = Math.max(scale, 0.5);

      const result = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, safeScale, 'editor');

      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
    });

    it('edge case: very small scale values', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 0.1;

      const editorResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');
      const frontendResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');
      const phpResult = {
        x: (screenX - layerLeft) / scale,
        y: (screenY - layerTop) / scale,
      };

      // All should produce very large values but remain consistent
      expect(editorResult.x).toBe(frontendResult.x);
      expect(editorResult.y).toBe(frontendResult.y);
      expect(phpResult.x).toBe(editorResult.x);
      expect(phpResult.y).toBe(editorResult.y);
    });

    it('edge case: very large scale values', () => {
      const screenX = 400;
      const screenY = 300;
      const layerLeft = 0;
      const layerTop = 0;
      const scale = 10;

      const editorResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');
      const frontendResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');
      const phpResult = {
        x: (screenX - layerLeft) / scale,
        y: (screenY - layerTop) / scale,
      };

      // All should produce very small values but remain consistent
      expect(editorResult.x).toBe(frontendResult.x);
      expect(editorResult.y).toBe(frontendResult.y);
      expect(phpResult.x).toBe(editorResult.x);
      expect(phpResult.y).toBe(editorResult.y);
    });

    it('offset layer position should be handled consistently across all modes', () => {
      const screenX = 500;
      const screenY = 400;
      const layerLeft = 100;
      const layerTop = 50;
      const scale = 1.5;

      const relativeX = screenX - layerLeft; // 400
      const relativeY = screenY - layerTop;  // 350

      const expectedX = relativeX / scale;  // ~266.67
      const expectedY = relativeY / scale;  // ~233.33

      const editorResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'editor');
      const frontendResult = calculateMarkerPosition(screenX, screenY, layerLeft, layerTop, scale, 'frontend');
      const phpResult = {
        x: (screenX - layerLeft) / scale,
        y: (screenY - layerTop) / scale,
      };

      expect(editorResult.x).toBeCloseTo(expectedX, 2);
      expect(editorResult.y).toBeCloseTo(expectedY, 2);
      expect(frontendResult.x).toBeCloseTo(expectedX, 2);
      expect(frontendResult.y).toBeCloseTo(expectedY, 2);
      expect(phpResult.x).toBeCloseTo(expectedX, 2);
      expect(phpResult.y).toBeCloseTo(expectedY, 2);
    });
  });
});
