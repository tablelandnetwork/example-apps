import { defineNuxtPlugin } from "#app";
import PrimeVue from "primevue/config";

import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';


export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {ripple: true});

  nuxtApp.vueApp.component('AutoComplete', AutoComplete);
  nuxtApp.vueApp.component('Button', Button);
  nuxtApp.vueApp.component('Card', Card);
  nuxtApp.vueApp.component('Dialog', Dialog);
  nuxtApp.vueApp.component('Inplace', Inplace);
  nuxtApp.vueApp.component('InputText', InputText);
  nuxtApp.vueApp.component('Message', Message);
  nuxtApp.vueApp.component('ProgressSpinner', ProgressSpinner);
  nuxtApp.vueApp.component('Textarea', Textarea);
});
