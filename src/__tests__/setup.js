import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

global.fetch = vi.fn();

global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

window.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.location.hash = '';
  global.fetch = vi.fn();
});

afterEach(() => {
  localStorage.clear();
});
