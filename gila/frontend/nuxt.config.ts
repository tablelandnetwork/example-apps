import 'dotenv/config';
import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  publicRuntimeConfig: {
    validatorHost: process.env.VALIDATOR || 'https://testnet.tableland.network',
    validatorNet: process.env.NETWORK || 'testnet',
    accountService: process.env.SERVICE || 'localhost:1337'
  },

  ssr: false,
  target: 'static',

  css: [
    'primevue/resources/themes/saga-blue/theme.css',
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css'
  ],
  buildModules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ]
});
