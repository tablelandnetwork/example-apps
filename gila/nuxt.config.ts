import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  env: {
    validatorHost: process.env.VALIDATOR || 'https://testnet.tableland.network',
    validatorNet: process.env.NETWORK || 'testnet'
  },
  css: [
    'primevue/resources/themes/saga-blue/theme.css',
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css'
  ],
  buildModules: [
    '@nuxtjs/tailwindcss'
  ]
});
