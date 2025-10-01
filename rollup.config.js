import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";

export default [
  // 🔸 JS Bundle
  {
    input: "tibashi-js/main.js",
    output: {
      dir: "dist",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      postcss({
        extract: true,   // CSS داخل JS جدا بشه
        minimize: true,
        sourceMap: true,
      }),
      terser(),
    ],
  },

  // 🔸 CSS Bundle مستقل
  {
    input: "./css/app.css",   // ورودی اصلی CSS
    output: {
      dir: "dist",
    },
    plugins: [
      postcss({
        extract: "yapp.css",  // خروجی نهایی
        minimize: true,
        sourceMap: true,
      }),
    ],
  },
];
