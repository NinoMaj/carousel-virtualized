import typescript from 'rollup-plugin-typescript2';
import {uglify} from 'rollup-plugin-uglify';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import pkg from './package.json';

const external = id => !id.startsWith('.') && !id.startsWith('/');

export default [{
  input: './src/index.ts',
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
  input: './src/index.ts',
  output: [
    {
      file: pkg.module,
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
