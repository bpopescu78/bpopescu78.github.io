import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'bp-web-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
      footer: '(c)2020 Bogdan Popescu'
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  buildEs5: false,
  extras: {
    dynamicImportShim: false,
    cssVarsShim: false,
    shadowDomShim: false,
    scriptDataOpts: false,
    safari10: false
  }
}
