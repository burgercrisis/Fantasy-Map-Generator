/**
 * Jest configuration for Placename Replacement Tool
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module paths
  roots: ['<rootDir>'],
  
  // Verbose output
  verbose: true,
  
  // Timeout for tests (important for property-based tests)
  testTimeout: 30000
};