import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: [
    './src/**/*.test.ts',
  ],
  port: 7003,
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    include: ['./src/**'],
    exclude: ['**/node_modules/**'],
  },
  plugins: [
    esbuildPlugin({ ts: true, target: 'auto' }),
  ],
};
