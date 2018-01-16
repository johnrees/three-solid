import resolve from 'rollup-plugin-node-resolve';
// import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'umd',
      file: 'lib/umd.js',
      name: 'ThreeBSP'
    },
    {
      format: 'es',
      file: 'lib/module.js'
    }
  ],
  plugins: [
    typescript(),
    resolve({
      // pass custom options to the resolve plugin
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    // babel({
    //   exclude: 'node_modules/**' // only transpile our source code
    // })
  ],
  // indicate which modules should be treated as external
  external: ['three']
};
