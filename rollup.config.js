import typescript from 'rollup-plugin-typescript2';
import {uglify} from 'rollup-plugin-uglify';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import pkg from './package.json';

const input = './src/index.ts';
const external = id => !id.startsWith('.') && !id.startsWith('/');

export default [{
  input,
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
  ],
  external,
  plugins: [
    typescript({
      check: true,
      typescript: require('typescript'),
      tsconfig: './tsconfig.base.json',
    }),
    nodeResolve(),
    commonjs(),
    uglify(),
  ],
}, {
  input,
  output: [
    {
      file: pkg.module,
      format: 'es'
    },
    {
      file: 'examples/lib/index.esm.js',
      format: 'es'
    },
  ],
  external,
  plugins: [
    typescript({
      check: true,
      typescript: require('typescript'),
      tsconfig: './tsconfig.base.json',
    }),
    nodeResolve(),
    commonjs(),
  ],
}]

// import babel from 'rollup-plugin-babel';
// import commonjs from 'rollup-plugin-commonjs';
// import nodeResolve from 'rollup-plugin-node-resolve';
// import pkg from './package.json';

// const input = './src/index.js';

// const external = id => !id.startsWith('.') && !id.startsWith('/');

// export default [
//   {
//     input,
//     output: {
//       file: pkg.main,
//       format: 'cjs',
//     },
//     external,
//     plugins: [
//       babel({
//         runtimeHelpers: true,
//         plugins: ['@babel/transform-runtime'],
//       }),
//       nodeResolve(),
//       commonjs(),
//     ],
//   },

//   {
//     input,
//     output: {
//       file: pkg.module,
//       format: 'esm',
//     },
//     external,
//     plugins: [
//       babel({
//         runtimeHelpers: true,
//         plugins: [['@babel/transform-runtime', { useESModules: true }]],
//       }),
//       nodeResolve(),
//       commonjs(),
//     ],
//   },
// ];
