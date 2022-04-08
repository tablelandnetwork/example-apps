import { defineNuxtPlugin } from "#app";
import { createPinia } from 'pinia';
import { $store } from '../store';

export default defineNuxtPlugin((nuxtApp) => {
  console.log($store);
  const pinia = createPinia();
  nuxtApp.vueApp.use(pinia);
  return {
    provide: { store: $store(pinia) }
  };
});
