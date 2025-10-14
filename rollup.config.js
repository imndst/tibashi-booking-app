const postcss = require("rollup-plugin-postcss");
const { terser } = require("rollup-plugin-terser");
const path = require("path");

module.exports = [
  // 🔹 JS Bundle
  {
    input: "./main.v3.js",
    output: {
      dir: "dist",
      entryFileNames: "[name]-[hash].js", // Add hash to JS file
      format: "es",
      sourcemap: true,
    },
    plugins: [
      postcss({
        extract: true,      // Extract CSS from JS
        minimize: true,     // Minify CSS
        sourceMap: true,
      }),
      terser(),             // Minify JS
    ],
  },

  // 🔹 CSS Bundle (standalone)
  {
    input: "./app.css",     // Input CSS file
    output: {
      dir: "dist",
      assetFileNames: "[name]-[hash][extname]", // Add hash to CSS file
    },
    plugins: [
      postcss({
        extract: true,      // Output separate CSS file
        minimize: true,     // Minify CSS
        sourceMap: true,
      }),
    ],
  },
];
