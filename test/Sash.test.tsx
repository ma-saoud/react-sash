import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Sash, type SashProps } from '../src/index.js';

afterEach(cleanup);

function renderSplit(props: Partial<SashProps> = {}, count = 2) {
  render(
    <Sash {...props}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>pane {i}</div>
      ))}
    </Sash>,
  );
  const dividers = screen.queryAllByRole('separator');
  const panes = Array.from({ length: count }, (_, i) => screen.getByText(`pane ${i}`).parentElement!);
  return { dividers, panes };
}

const sizesOf = (panes: HTMLElement[]) => panes.map((pane) => Number(pane.style.flexGrow));

// jsdom has no layout: fake pointer capture, and put the panes on either side of `divider`
// at 0–500px and 510–1010px, with the 10px divider between them.
function stubDrag(divider: HTMLElement) {
  divider.setPointerCapture = vi.fn();
  divider.hasPointerCapture = () => true;
  const rect = (start: number) =>
    ({ left: start, right: start + 500, width: 500, top: start, bottom: start + 500, height: 500 }) as DOMRect;
  divider.previousElementSibling!.getBoundingClientRect = () => rect(0);
  divider.nextElementSibling!.getBoundingClientRect = () => rect(510);
}

describe('Sash', () => {
  it('splits evenly between any number of panes, with a divider between each pair', () => {
    const { dividers, panes } = renderSplit({ dividerLabel: 'Resize sidebar' }, 4);

    expect(dividers).toHaveLength(3);
    expect(sizesOf(panes)).toEqual([25, 25, 25, 25]);
    expect(dividers[0].getAttribute('aria-label')).toBe('Resize sidebar');
    expect(dividers[0].getAttribute('aria-orientation')).toBe('vertical');
    expect(dividers[0].hasAttribute('tabindex')).toBe(false); // mouse only
  });

  it('skips empty children', () => {
    render(
      <Sash>
        <div />
        {false}
        {null}
        <div />
      </Sash>,
    );
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('passes className and other props to the root', () => {
    render(
      <Sash className="mine" data-testid="root" direction="vertical">
        <div />
        <div />
      </Sash>,
    );
    const root = screen.getByTestId('root');
    expect(root.className).toBe('sash sash--vertical mine');
  });

  it('resizes by dragging, changing only the two panes next to the divider', () => {
    const { dividers, panes } = renderSplit({ defaultSizes: [20, 30, 50] }, 3);
    const divider = dividers[1];
    stubDrag(divider);

    fireEvent.pointerDown(divider, { button: 0, pointerId: 1 });
    expect(divider.parentElement!.classList.contains('sash--dragging')).toBe(true);

    fireEvent.pointerMove(divider, { pointerId: 1, clientX: 505 }); // middle of the two
    expect(sizesOf(panes)).toEqual([20, 40, 40]);

    fireEvent.pointerMove(divider, { pointerId: 1, clientX: 5000 });
    expect(sizesOf(panes)).toEqual([20, 70, 10]);

    fireEvent.lostPointerCapture(divider, { pointerId: 1 });
    expect(divider.parentElement!.classList.contains('sash--dragging')).toBe(false);
  });

  it('drags along the y axis for a vertical split', () => {
    const { dividers, panes } = renderSplit({ direction: 'vertical' });
    stubDrag(dividers[0]);

    expect(dividers[0].getAttribute('aria-orientation')).toBe('horizontal');
    fireEvent.pointerMove(dividers[0], { pointerId: 1, clientX: 9999, clientY: 255 });
    expect(sizesOf(panes)).toEqual([25, 75]);
  });

  it('never makes a pane smaller than min', () => {
    const { dividers, panes } = renderSplit({ min: 20 });
    stubDrag(dividers[0]);

    fireEvent.pointerMove(dividers[0], { pointerId: 1, clientX: 0 });
    expect(sizesOf(panes)).toEqual([20, 80]);
    fireEvent.pointerMove(dividers[0], { pointerId: 1, clientX: 5000 });
    expect(sizesOf(panes)).toEqual([80, 20]);
  });

  it('resets to defaultSizes on double-click', () => {
    const { dividers, panes } = renderSplit({ defaultSizes: [30, 70] });
    stubDrag(dividers[0]);

    fireEvent.pointerMove(dividers[0], { pointerId: 1, clientX: 605 });
    expect(sizesOf(panes)).toEqual([60, 40]);
    fireEvent.doubleClick(dividers[0]);
    expect(sizesOf(panes)).toEqual([30, 70]);
  });

  it('keeps the other panes mounted when one is removed', () => {
    const ui = (showFirst: boolean) => (
      <Sash>
        {showFirst && <div>pane 0</div>}
        <div>pane 1</div>
      </Sash>
    );
    const { rerender } = render(ui(true));
    const second = screen.getByText('pane 1');

    rerender(ui(false));
    expect(screen.getByText('pane 1')).toBe(second);
    expect(screen.queryAllByRole('separator')).toHaveLength(0);
    expect(second.parentElement!.style.flexGrow).toBe('100');
  });

  it('works controlled', () => {
    const onSizesChange = vi.fn();

    function Controlled() {
      const [sizes, setSizes] = useState([40, 60]);
      return (
        <Sash
          sizes={sizes}
          onSizesChange={(next) => {
            onSizesChange(next);
            setSizes(next);
          }}
        >
          <div>pane 0</div>
          <div>pane 1</div>
        </Sash>
      );
    }

    render(<Controlled />);
    const divider = screen.getByRole('separator');
    const panes = [0, 1].map((i) => screen.getByText(`pane ${i}`).parentElement!);
    expect(sizesOf(panes)).toEqual([40, 60]);

    stubDrag(divider);
    fireEvent.pointerMove(divider, { pointerId: 1, clientX: 255 });
    expect(onSizesChange).toHaveBeenCalledWith([25, 75]);
    expect(sizesOf(panes)).toEqual([25, 75]);
  });

  it('does not move on its own when controlled', () => {
    const onSizesChange = vi.fn();
    const { dividers, panes } = renderSplit({ sizes: [40, 60], onSizesChange });
    stubDrag(dividers[0]);

    fireEvent.pointerMove(dividers[0], { pointerId: 1, clientX: 255 });
    expect(onSizesChange).toHaveBeenCalledWith([25, 75]);
    expect(sizesOf(panes)).toEqual([40, 60]);
  });
});
