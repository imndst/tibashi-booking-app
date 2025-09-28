import { terser } from "rollup-plugin-terser";

export default {
  input: 'tibashi-js/main.js',
  output: {
    dir: 'dist',
    format: 'es',   // ✅ خروجی به صورت ES Module
    sourcemap: true
  }
};
