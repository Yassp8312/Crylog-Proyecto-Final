module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
