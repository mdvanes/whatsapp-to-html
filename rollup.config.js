import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import json from 'rollup-plugin-json';

const commonPlugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    rollupCommonJSResolveHack: true,
  }),
  babel({
    exclude: "node_modules/**",
    extensions: ["ts"],
  }),
  json()
];

export default [
  {
    input: "src/index.ts",
    plugins: commonPlugins,

    external: ["fs", "os"],
    output: [
      {
        globals: {
          "date-and-time": "date-and-time",
        },
        format: "cjs",
        file: "dist/whatsapp-to-html.js",
      },
      {
        globals: {
          "date-and-time": "date-and-time",
        },
        format: "esm",
        file: "dist/whatsapp-to-html.es.js",
      },
    ],
  },
  {
    input: "src/index.ts",
    plugins: commonPlugins.concat([terser()]),
    external: ["fs", "os"],
    output: [
      {
        globals: {
          "date-and-time": "date-and-time",
        },
        format: "cjs",
        file: "dist/whatsapp-to-html.min.js",
      },
      {
        globals: {
          "date-and-time": "date-and-time",
        },
        format: "esm",
        file: "dist/whatsapp-to-html.es.min.js",
      },
    ],
  },
  {
    input: "src/cli.ts",
    plugins: commonPlugins,
    external: ["fs", "os"],
    output: {
      banner: "#!/usr/bin/env node",
      globals: {
        "date-and-time": "date-and-time",
      },
      format: "cjs",
      file: "bin/cli",
    },
  },
];
