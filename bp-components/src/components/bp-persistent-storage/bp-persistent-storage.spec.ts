import { newSpecPage } from '@stencil/core/testing'
import { BpPersistentStorage } from './bp-persistent-storage'

describe('BpPersistentStorage', () => {

  it('should render the component', async () => {
    const page = await newSpecPage({
      components: [BpPersistentStorage],
      html: `<bp-persistent-storage><p>Hello World!</p></bp-persistent-storage>`,
    })
    expect(page.root).toEqualHtml(`
      <bp-persistent-storage><p>Hello World!</p></bp-persistent-storage>
    `)
  })
})
