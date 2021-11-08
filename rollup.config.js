export default [
  {
    input: 'src/index.js',
    external: id => /^(lib0|crdtmap)/.test(id),
    output: {
      name: 'CrdtMapSync',
      file: 'dist/crdtmap-sync.cjs',
      format: 'cjs',
      sourcemap: true
    }
  }
]
