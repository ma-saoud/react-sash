import type { HTMLAttributes, ReactNode } from 'react';

export interface SashProps extends HTMLAttributes<HTMLDivElement> {
  /** The panes, left to right (or top to bottom). Any number; `null`, `false` and `undefined` are skipped. */
  children?: ReactNode;
  /** `horizontal` puts the panes side by side, `vertical` stacks them. Default `horizontal`. */
  direction?: SashDirection;
  /** Starting size of each pane, in %. Double-clicking a divider resets to them. Default: equal sizes. */
  defaultSizes?: number[];
  /** Size of each pane, in %. Pass it with `onSizesChange` to control the split. */
  sizes?: number[];
  /** Called with the new size of every pane, in %, whenever the user resizes. */
  onSizesChange?: (sizes: number[]) => void;
  /** Smallest size of any pane, in %. Default `10`. */
  min?: number;
  /** Accessible name of the dividers, e.g. "Resize sidebar". Default `"Resize"`. */
  dividerLabel?: string;
}

export type SashDirection = 'horizontal' | 'vertical';
