module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-esbuild'],
    files: ['src/**/*.spec.js'],
    preprocessors: {
      'src/**/*.spec.js': ['esbuild'],
    },
    // esbuild compila el JSX directamente (sin Babel ni webpack)
    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      define: { 'process.env.NODE_ENV': '"test"' },
    },
    browsers: ['ChromeHeadless'],
    singleRun: true,
  });
};
