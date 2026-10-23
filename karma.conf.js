const fs = require('fs');
const { createInstrumenter } = require('istanbul-lib-instrument');

// Para medir cobertura: `npm run test:coverage` (agrega --coverage).
const withCoverage = process.argv.includes('--coverage');

// Plugin de esbuild: instrumenta con Istanbul los archivos de src/ (menos las pruebas)
// para que karma-coverage pueda armar el reporte.
const instrumenter = createInstrumenter({ esModules: true, parserPlugins: ['jsx'], compact: false });
const istanbulPlugin = {
  name: 'istanbul',
  setup(build) {
    build.onLoad({ filter: /[\\/]src[\\/].*\.jsx?$/ }, async args => {
      if (/\.spec\.js$/.test(args.path) || /[\\/]test[\\/]/.test(args.path)) return undefined;
      const code = await fs.promises.readFile(args.path, 'utf8');
      return { contents: instrumenter.instrumentSync(code, args.path), loader: 'jsx' };
    });
  }
};

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-esbuild', 'karma-coverage'],
    files: ['src/**/*.spec.js'],
    preprocessors: {
      'src/**/*.spec.js': ['esbuild'],
    },
    // esbuild compila el JSX directamente (sin Babel ni webpack)
    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      define: { 'process.env.NODE_ENV': '"test"' },
      plugins: withCoverage ? [istanbulPlugin] : [],
    },
    reporters: withCoverage ? ['progress', 'coverage'] : ['progress'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'html', subdir: 'html' }, { type: 'text-summary' }, { type: 'lcovonly', subdir: '.' }],
    },
    browsers: ['ChromeHeadless'],
    singleRun: true,
  });
};
