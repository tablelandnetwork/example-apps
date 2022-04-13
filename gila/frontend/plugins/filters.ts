import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(function (nuxtApp) {
  return {
    provide: {
      date: val => {
        if (!val) return '';
        const date = new Date(val);
        return date.toLocaleString();
      }
    }
  };
});
