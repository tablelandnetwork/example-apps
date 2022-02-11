import { mount } from '@vue/test-utils';
import { setupTest } from '@nuxt/test-utils'
import IndexPage from '@/pages/index.vue';
import flushPromises from 'flush-promises';


window.ethereum = {};

jest.mock('ethers', function () {
  return {
    providers: {
      Web3Provider: function () {
        // mock provider
        return {
          send: async function () {},
          getSigner: function () {
            // mock signer
            return {
              getAddress: function () {
                return 'testaddress';
              },
              signMessage: async function () {
                return 'testsignedmessage';
              }
            };
          }
        };
      }
    }
  }
});

describe('Index Page', function () {
  setupTest({
    configFile: 'nuxt.config.js'
  });

  let wrapper = mount(IndexPage);
/*
  beforeAll(async function () {
    const storePath = `${process.env.buildDir}/store.js`;
    const NuxtStore = await import(storePath);
    const store = await NuxtStore.createStore();

    // hoisted
    wrapper = mount(IndexPage, { store });
  });
*/
  test('is a Vue instance', function () {
    expect(wrapper.vm).toBeTruthy();
  });

  test('renders correctly', function () {
    expect(wrapper.element).toMatchSnapshot();
  });

  test('connects to metamask', async function () {
    const metamaskButton = wrapper.find('button');
    expect(metamaskButton.find('span').text()).toMatch('Connect to Tableland');

    await metamaskButton.trigger('click');
    await flushPromises();

    expect(metamaskButton.find('span').text()).toMatch('Disconnect');
  });
});
