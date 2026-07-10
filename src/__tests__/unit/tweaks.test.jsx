import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio } from '../../tweaks-panel';

// ─── useTweaks hook ───────────────────────────────────────────────────────────
describe('useTweaks', () => {
  const DEFAULTS = { theme: 'dark', density: 'regular', accent: '#0d7d7d' };

  it('returns default values on first render', () => {
    const { result } = renderHook(() => useTweaks(DEFAULTS));
    expect(result.current[0]).toEqual(DEFAULTS);
  });

  it('updates a single value with setTweak(key, value)', () => {
    const { result } = renderHook(() => useTweaks(DEFAULTS));
    act(() => { result.current[1]('theme', 'light'); });
    expect(result.current[0].theme).toBe('light');
    expect(result.current[0].density).toBe('regular');
  });

  it('updates multiple values when called with an object', () => {
    const { result } = renderHook(() => useTweaks(DEFAULTS));
    act(() => { result.current[1]({ theme: 'light', density: 'compact' }); });
    expect(result.current[0].theme).toBe('light');
    expect(result.current[0].density).toBe('compact');
    expect(result.current[0].accent).toBe('#0d7d7d');
  });

  it('preserves unchanged keys when updating one', () => {
    const { result } = renderHook(() => useTweaks(DEFAULTS));
    act(() => { result.current[1]('accent', '#2563eb'); });
    expect(result.current[0].theme).toBe('dark');
    expect(result.current[0].density).toBe('regular');
    expect(result.current[0].accent).toBe('#2563eb');
  });

  it('can update value multiple times', () => {
    const { result } = renderHook(() => useTweaks(DEFAULTS));
    act(() => { result.current[1]('theme', 'light'); });
    act(() => { result.current[1]('theme', 'dark'); });
    expect(result.current[0].theme).toBe('dark');
  });

  it('setTweak returns stable reference across renders', () => {
    const { result, rerender } = renderHook(() => useTweaks(DEFAULTS));
    const first = result.current[1];
    rerender();
    expect(result.current[1]).toBe(first);
  });
});

// ─── TweakSection ─────────────────────────────────────────────────────────────
describe('TweakSection', () => {
  it('renders label text when panel is open', async () => {
    render(
      <TweaksPanel>
        <TweakSection label="Layout" />
      </TweaksPanel>
    );
    // Open the panel via postMessage
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: '__activate_edit_mode' } }));
    });
    await waitFor(() => {
      expect(screen.getByText('Layout')).toBeInTheDocument();
    });
  });
});

// ─── TweakRadio ──────────────────────────────────────────────────────────────
describe('TweakRadio', () => {
  it('renders label and option buttons', () => {
    render(<TweakRadio label="Color Mode" value="dark" options={['dark','light']} onChange={vi.fn()} />);
    expect(screen.getByText('Color Mode')).toBeInTheDocument();
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(screen.getByText('light')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', async () => {
    const onChange = vi.fn();
    render(<TweakRadio label="Mode" value="dark" options={['dark','light']} onChange={onChange} />);
    await userEvent.click(screen.getByText('light'));
    expect(onChange).toHaveBeenCalledWith('light');
  });

  it('marks active option with "on" class', () => {
    render(<TweakRadio label="Mode" value="light" options={['dark','light']} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const lightBtn = buttons.find(b => b.textContent === 'light');
    expect(lightBtn).toHaveClass('on');
  });

  it('does not mark inactive option with "on" class', () => {
    render(<TweakRadio label="Mode" value="light" options={['dark','light']} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const darkBtn = buttons.find(b => b.textContent === 'dark');
    expect(darkBtn).not.toHaveClass('on');
  });
});

// ─── TweakColor ──────────────────────────────────────────────────────────────
describe('TweakColor', () => {
  it('renders label', () => {
    render(<TweakColor label="Accent" value="#0d7d7d" options={['#0d7d7d','#2563eb']} onChange={vi.fn()} />);
    expect(screen.getByText('Accent')).toBeInTheDocument();
  });

  it('renders a button for each color option', () => {
    render(<TweakColor label="Accent" value="#0d7d7d" options={['#0d7d7d','#2563eb','#4f46e5']} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(3);
  });

  it('marks active color with data-on="1"', () => {
    render(<TweakColor label="Accent" value="#2563eb" options={['#0d7d7d','#2563eb']} onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    const activeBtn = radios.find(b => b.title === '#2563eb');
    expect(activeBtn).toHaveAttribute('data-on', '1');
  });

  it('calls onChange with the color value when a swatch is clicked', async () => {
    const onChange = vi.fn();
    render(<TweakColor label="Accent" value="#0d7d7d" options={['#0d7d7d','#2563eb']} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]);
    expect(onChange).toHaveBeenCalledWith('#2563eb');
  });
});

// ─── TweaksPanel open/close ───────────────────────────────────────────────────
describe('TweaksPanel', () => {
  it('renders nothing when closed (returns null)', () => {
    const { container } = render(<TweaksPanel><div>content</div></TweaksPanel>);
    expect(container.firstChild).toBeNull();
  });

  it('shows panel and close button when opened via postMessage', async () => {
    render(<TweaksPanel><div data-testid="panel-child">Panel Content</div></TweaksPanel>);
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: '__activate_edit_mode' } }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('panel-child')).toBeInTheDocument();
    });
  });

  it('shows close button (✕) when open', async () => {
    render(<TweaksPanel><div>x</div></TweaksPanel>);
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: '__activate_edit_mode' } }));
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Close tweaks')).toBeInTheDocument();
    });
  });

  it('hides panel when close button is clicked', async () => {
    render(<TweaksPanel><div data-testid="content">visible</div></TweaksPanel>);
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: '__activate_edit_mode' } }));
    });
    await waitFor(() => screen.getByTestId('content'));
    await userEvent.click(screen.getByLabelText('Close tweaks'));
    await waitFor(() => {
      expect(screen.queryByTestId('content')).toBeNull();
    });
  });

  it('closes via __deactivate_edit_mode message', async () => {
    render(<TweaksPanel><div data-testid="panel-body">body</div></TweaksPanel>);
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: '__activate_edit_mode' } }));
    });
    await waitFor(() => screen.getByTestId('panel-body'));
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: '__deactivate_edit_mode' } }));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('panel-body')).toBeNull();
    });
  });
});
