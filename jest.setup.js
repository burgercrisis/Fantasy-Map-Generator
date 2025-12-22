// Jest setup file for language name normalization tests

// Configure fast-check for property-based testing
const fc = require('fast-check');

// Set default number of runs for property tests (minimum 100 as per requirements)
fc.configureGlobal({
  numRuns: 100,
  verbose: false,
  seed: 42 // Fixed seed for reproducible tests
});

// Global test utilities
global.fc = fc;

// Custom matchers for language name testing
expect.extend({
  toBeValidLanguageName(received) {
    const pass = typeof received === 'string' && 
                 received.length > 0 && 
                 /^[A-Z][a-z]*(\s+[A-Z][a-z]*)*$/.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid language name`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid language name (proper title case)`,
        pass: false,
      };
    }
  },
  
  toBeShortName(received) {
    const pass = typeof received === 'string' && received.length < 4;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a short name`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a short name (< 4 characters)`,
        pass: false,
      };
    }
  }
});

// Console log suppression for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});