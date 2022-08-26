import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import css from 'rollup-plugin-css-only';
import sveltePreprocess from 'svelte-preprocess';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

dotenv.config();

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production
      }
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // Setup injecting things contained in the env
    // Note: the injections are literal, so if you inject 'process.env.FOO': foo
    //       with `const amIFoo = process.env.FOO;` in your app, then the result
    //       will be `const amIFoo = foo`, notice that there's no quotes on foo
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.VALIDATOR_HOST': JSON.stringify(process.env.VALIDATOR_HOST),
      'process.env.TABLELAND_NETWORK': JSON.stringify(process.env.TABLELAND_NETWORK),
      'process.env.MOVES_TABLENAME': JSON.stringify(process.env.MOVES_TABLENAME),
      'process.env.TOKEN_TABLENAME': JSON.stringify(process.env.TOKEN_TABLENAME),
      'process.env.TOKEN_CONTRACT_ADDRESS': JSON.stringify(process.env.TOKEN_CONTRACT_ADDRESS)
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({
      resolveJsonModule: true,
      sourceMap: !production,
      inlineSources: !production
    }),

    json(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
