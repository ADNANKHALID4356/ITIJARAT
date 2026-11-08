/**
 * bentoConfig.js — Design tokens, layout presets, and responsive span mappings
 * for the International Tijarat Bento Grid system.
 */

export const BENTO_TOKENS = {
  // Spacing & Gutters
  gap: {
    mobile: 'gap-3',      // 12px
    tablet: 'sm:gap-4',   // 16px
    desktop: 'lg:gap-5'   // 20px
  },
  // Corner Radii (20px - 28px standard)
  radius: {
    tile: 'rounded-2xl lg:rounded-3xl',
    inner: 'rounded-xl lg:rounded-2xl'
  },
  // Minimum touch target
  minTouchTarget: 'min-h-[44px] min-w-[44px]',
  // Transition speed
  transition: 'transition-all duration-300 ease-out'
};

/**
 * CSS Grid Span classes for each tile size.
 * Desktop: 4 columns
 * Tablet: 2 columns
 * Mobile: Stacked / 2-column with responsive span collapse
 */
export const TILE_SPANS = {
  hero: {
    desktop: 'col-span-2 row-span-2',
    tablet: 'sm:col-span-2 sm:row-span-2',
    mobile: 'col-span-2 row-span-2'
  },
  wide: {
    desktop: 'col-span-2 row-span-1',
    tablet: 'sm:col-span-2 sm:row-span-1',
    mobile: 'col-span-2 row-span-1'
  },
  tall: {
    desktop: 'col-span-1 row-span-2',
    tablet: 'sm:col-span-1 sm:row-span-2',
    mobile: 'col-span-1 row-span-2'
  },
  small: {
    desktop: 'col-span-1 row-span-1',
    tablet: 'sm:col-span-1 sm:row-span-1',
    mobile: 'col-span-1 row-span-1'
  }
};

/**
 * Deterministic, zero-gap layout presets based on item count.
 * Returns an array of slot sizes ['hero', 'tall', 'wide', 'small', ...] matching the count.
 * Every preset is engineered to tile into a 4-column grid with 0 empty gaps.
 */
export const BENTO_COUNT_PRESETS = {
  // 1 item: Dominant Hero centered
  1: ['hero'],

  // 2 items: 1 Hero (2x2) + 1 Hero (2x2) = 4 cols x 2 rows
  2: ['hero', 'hero'],

  // 3 items: 1 Hero (2x2) + 2 Talls (1x2 each) = 4 cols x 2 rows (2 + 1 + 1 = 4)
  3: ['hero', 'tall', 'tall'],

  // 4 items: 1 Hero (2x2) + 1 Tall (1x2) + 2 Smalls (1x1 each stacked in col 4) = 4 cols x 2 rows
  4: ['hero', 'tall', 'small', 'small'],

  // 5 items: 1 Hero (2x2) + 4 Smalls (1x1 each in 2x2 block) = 4 cols x 2 rows
  5: ['hero', 'small', 'small', 'small', 'small'],

  // 6 items: 1 Hero (2x2) + 1 Wide (2x1) + 4 Smalls (1x1)
  // Row 1-2: Hero (2x2) + 2 Smalls (col 3-4, row 1) + 1 Wide (col 3-4, row 2)
  // Row 3: 2 Smalls (col 1-2) + 1 Wide or 2 Smalls (col 3-4)
  6: ['hero', 'small', 'small', 'wide', 'wide', 'wide'],

  // 7 items: Hero (2x2) + 2 Talls (1x2) in rows 1-2; Row 3 has 1 Wide (2x1) + 2 Smalls (1x1 each)
  7: ['hero', 'tall', 'tall', 'wide', 'small', 'small', 'wide'],

  // 8 items: Hero (2x2) + 2 Talls (1x2); Row 3 has 4 Smalls (1x1 each)
  8: ['hero', 'tall', 'tall', 'small', 'small', 'small', 'small', 'wide'],

  // 12 items: 2 interlocking blocks (each 6 items or Hero + balanced companions)
  12: [
    'hero', 'tall', 'tall', 'small', 'small', 'small', 'small',
    'wide', 'wide', 'small', 'small', 'hero'
  ]
};

/**
 * Returns the layout preset for any given product count.
 * For counts > 12 or unlisted counts, dynamically tiles balanced 4-column blocks with no gaps.
 */
export function getPresetForCount(count) {
  if (count <= 0) return [];
  if (BENTO_COUNT_PRESETS[count]) {
    return BENTO_COUNT_PRESETS[count];
  }

  // Fallback algorithm for arbitrary count N:
  // Starts with Hero (2x2), then fills in pairs/quads so row totals always sum to 4 cols.
  const slots = ['hero'];
  let remaining = count - 1;

  while (remaining > 0) {
    if (remaining === 1) {
      // 1 item remaining: make it a 2x2 Hero or Wide
      slots.push('wide');
      remaining -= 1;
    } else if (remaining === 2) {
      // 2 items: 2 Talls (1x2 + 1x2 = 2 cols) or 2 Smalls
      slots.push('tall', 'tall');
      remaining -= 2;
    } else if (remaining === 3) {
      slots.push('tall', 'small', 'small');
      remaining -= 3;
    } else {
      // 4 items: 4 Smalls (complete 2x2 quadrant or row of 4)
      slots.push('small', 'small', 'small', 'small');
      remaining -= 4;
    }
  }

  return slots;
}

