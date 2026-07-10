import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Default fetch mock — returns empty success so pages don't crash on unmocked calls
global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });

// ResizeObserver requires a real constructor (arrow functions can't be used with 'new')
global.ResizeObserver = class {
  observe() {}
  disconnect() {}
  unobserve() {}
};

window.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.location.hash = '';
  // Restore default fetch mock after vi.clearAllMocks() resets it
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
});

afterEach(() => {
  localStorage.clear();
});
