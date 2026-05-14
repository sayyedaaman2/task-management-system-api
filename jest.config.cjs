/* eslint-env node */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  extensionsToTreatAsEsm: [".ts"],

  moduleNameMapper: {
    "^@/(.*)[.]js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^([\\.]{1,2}/.*)[.]js$": "$1",
  },

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  setupFiles: ["<rootDir>/src/__tests__/setup/globalSetup.ts"],

  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup/jest.setup.ts"],

  testMatch: ["**/src/__tests__/unit/**/*.test.ts", "**/src/__tests__/integration/**/*.test.ts"],

  clearMocks: true,

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/seeders/**",
    "!src/server.ts",
    "!src/lib/**",
    "!src/types/**",
  ],
};
