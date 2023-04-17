//jest.config.js
module.exports = {
    roots: ["<rootDir>/src"],
    testMatch: [
      "**/__tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)",
    ],
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest",
    },
    coveragePathIgnorePatterns: [
      "/node_modules/"
    ],
    moduleNameMapper: {
      "\\.(css|less)$": "identity-obj-proxy",
    },
    testEnvironment: "jsdom"
  };