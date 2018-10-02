import typescript from 'rollup-plugin-typescript2';
import {uglify} from 'rollup-plugin-uglify';

import pkg from './package.json';

export default [{
  input: './src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
  ],
  plugins: [
    typescript({
      check: true,
      typescript: require('typescript'),
      tsconfig: './tsconfig.base.json',
    }),
    uglify(),
  ],
  watch: {
    chokidar: false
  },
}, {
  input: './src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es'
    },
  ],
  plugins: [
    typescript({
      check: true,
      typescript: require('typescript'),
      tsconfig: './tsconfig.base.json',
    }),
  ],
  watch: {
    chokidar: false
  },
}]
