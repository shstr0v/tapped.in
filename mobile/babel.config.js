module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
          root: ["."],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
