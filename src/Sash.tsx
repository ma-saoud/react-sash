'use client';

import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useState,
  type PointerEvent,
} from 'react';
import type { SashProps } from './types/index.js';
import {
  clamp,
  equalSizes,
} from './utils/index.js';

export const Sash = forwardRef<HTMLDivElement, SashProps>(function Sash(
  {
    children,
    direction = 'horizontal',
    defaultSizes,
    sizes: controlledSizes,
    onSizesChange,
    min = 10,
    dividerLabel = 'Resize',
    className,
    ...rest
  },
  ref,
) {
  const panes = Children.toArray(children);
  const vertical = direction === 'vertical';
  const initialSizes =
    defaultSizes?.length === panes.length ? defaultSizes : equalSizes(panes.length);
  const [uncontrolledSizes, setUncontrolledSizes] = useState(initialSizes);
  const [dragging, setDragging] = useState(false);

  const current = controlledSizes ?? uncontrolledSizes;
  const sizes = current.length === panes.length ? current : initialSizes;

  function resize(next: number[]) {
    if (next.every((size, i) => size === sizes[i])) return;
    if (controlledSizes === undefined) setUncontrolledSizes(next);
    onSizesChange?.(next);
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>, i: number) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const a = e.currentTarget.previousElementSibling!.getBoundingClientRect();
    const b = e.currentTarget.nextElementSibling!.getBoundingClientRect();
    const gap = vertical ? b.top - a.bottom : b.left - a.right;
    const pos = (vertical ? e.clientY - a.top : e.clientX - a.left) - gap / 2;
    const total = vertical ? a.height + b.height : a.width + b.width;

    const pair = sizes[i - 1] + sizes[i];
    const floor = Math.min(min, pair / 2);
    const first = clamp((pos / total) * pair, floor, pair - floor);
    const next = [...sizes];
    next[i - 1] = first;
    next[i] = pair - first;
    resize(next);
  }

  const classes = [
    'sash',
    `sash--${direction}`,
    dragging && 'sash--dragging',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} ref={ref} className={classes}>
      {panes.map((pane, i) => (
        <Fragment key={isValidElement(pane) ? pane.key : i}>
          {i > 0 && (
            <div
              className="sash__divider"
              role="separator"
              aria-orientation={vertical ? 'horizontal' : 'vertical'}
              aria-label={dividerLabel}
              onPointerDown={handlePointerDown}
              onPointerMove={(e) => handlePointerMove(e, i)}
              onLostPointerCapture={() => setDragging(false)}
              onDoubleClick={() => resize(initialSizes)}
            />
          )}
          <div className="sash__pane" style={{ flexGrow: sizes[i] }}>
            {pane}
          </div>
        </Fragment>
      ))}
    </div>
  );
});
