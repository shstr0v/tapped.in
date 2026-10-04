const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: ["coverage/**", ".expo/**", "node_modules/**"],
  },
];
