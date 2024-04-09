export default {
  publicDir: 'src',
  input: 'src/index.js',
  sourcemap: true,
  mode: 'development',
  server: {
    port: '8848',
    mode: 'development',
    strictPort: true,
    open: true,
    https: false,
    origin: 'http://127.0.0.1:8848'
  }
}
