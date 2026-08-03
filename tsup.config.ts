import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/board/index.ts'],
  tsconfig: 'tsconfig.lib.json',
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['three', 'react', 'react-dom']
});
