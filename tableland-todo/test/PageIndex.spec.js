import { createLocalVue, mount } from '@vue/test-utils';
import { setupTest } from '@nuxt/test-utils'
import IndexPage from '@/pages/index.vue';
import flushPromises from 'flush-promises';

import { registerComponents } from './setup';

window.ethereum = {chainId: '0x4'};

describe('Index Page', function () {
  setupTest({
    configFile: 'nuxt.config.js'
  });

  let wrapper;

  beforeAll(async function () {
    const localVue = createLocalVue();
    registerComponents(localVue);

    // env defined in global setup
    const storePath = `${process.env.buildDir}/store.js`;
    const NuxtStore = await import(storePath);
    const store = await NuxtStore.createStore();

    // hoisted
    wrapper = mount(IndexPage, {
      localVue: localVue,
      store: store,
      attachTo: document.body
    });
  });


  test('is a Vue instance', async function () {
    await expect(wrapper.vm).toBeTruthy();
  });

  test('renders correctly', async function () {
    await expect(wrapper.element).toMatchSnapshot();
  });

  test('connects to metamask', async function () {
    const metamaskButton = wrapper.find('button');
    await expect(metamaskButton.find('span').text()).toMatch('Connect to Tableland');

    await metamaskButton.trigger('click');
    await flushPromises();

    await expect(metamaskButton.find('span').text()).toMatch('Disconnect');
  });
});
