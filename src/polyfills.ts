// Polyfill for React scheduler __name function
// This fixes the "TypeError: __name is not a function" error

if (typeof (globalThis as any).__name === 'undefined') {
  (globalThis as any).__name = function(fn: any, name: string) {
    return fn;
  };
}

// Additional React scheduler polyfills
if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = {
    now: () => Date.now()
  } as Performance;
}

// Polyfill for Node.js process global (required by Babel libraries)
if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = {
    env: {
      NODE_ENV: import.meta.env.MODE || 'production'
    }
  };
}

export {};