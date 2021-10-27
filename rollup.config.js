export default [
  {
    input: 'src/index.js',
    external: id => /^(lib0|vjs)/.test(id),
    output: {
      name: 'VSync',
      file: 'dist/v-sync.cjs',
      format: 'cjs',
      sourcemap: true
    }
  }
]
