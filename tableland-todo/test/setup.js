import path from 'path';
import glob from 'glob';

// register all components for the wrapper
export function registerComponents(vm) {
  const fileComponents = glob.sync(path.join(__dirname, '../components/**/*.vue'));

  for (const file of fileComponents) {
    const name = file.match(/(\w*)\.vue$/)[1];

    vm.component(name, require(file).default);
  }
}
