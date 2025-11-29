

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

async function main() {
  console.log('Running Firebase Integration Tests...');
  
  // Mock window for the test module if needed
  if (typeof window === 'undefined') {
      (global as any).window = {
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
      };
  }

  // Dynamic import to ensure mocks are in place
  const { testFirebaseIntegration, testFirebaseConnection } = await import('../src/tests/firebaseIntegrationTest');

  try {
    const connectionSuccess = await testFirebaseConnection();
    if (!connectionSuccess) {
        console.warn('Firebase connection failed. Some tests might fail.');
    }

    const results = await testFirebaseIntegration();
    if (results.success) {
      console.log('All tests passed!');
      process.exit(0);
    } else {
      console.error('Tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

main();
