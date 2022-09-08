import 'dotenv/config';
import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      validatorHost: process.env.VALIDATOR,
      chain: process.env.CHAIN || 'ethereum-goerli', // 'local-tableland',
      contract: process.env.CONTRACT || '',
      accountService: process.env.SERVICE || 'localhost:1337',
      alchemyApiKey: process.env.ALCHEMY || ''
    }
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
