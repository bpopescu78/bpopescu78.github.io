import { newSpecPage } from '@stencil/core/testing'
import { BpMessageBroker } from './bp-message-broker'

describe('BpMessageBroker', () => {
  const queueName = 'testQueue'
  const mockData = {
    marco: 'polo'
  }

  it('should render the component', async () => {
    const page = await newSpecPage({
      components: [BpMessageBroker],
      html: `<bp-message-broker><p>Hello World!</p></bp-message-broker>`,
    })
    expect(page.root).toEqualHtml(`
      <bp-message-broker><p>Hello World!</p></bp-message-broker>
    `)
  })

  it('should have the subscribeToQueue() method', () => {
    const broker = new BpMessageBroker()
    expect(broker.subscribeToQueue).toBeDefined()
  })

  it('should have the publishToQueue() method', () => {
    const broker = new BpMessageBroker()
    expect(broker.publishToQueue).toBeDefined()
  })

  it('should have the unsubscribeToQueue() method', () => {
    const broker = new BpMessageBroker()
    expect(broker.unsubscribeToQueue).toBeDefined()
  })

  it('should have the getLastQueued() method', () => {
    const broker = new BpMessageBroker()
    expect(broker.getLastQueued).toBeDefined()
  })

  it('should allow subscribing to a new queue of type "observable" w/o defining the type', async () => {
    const broker = new BpMessageBroker()
    await expect(broker.subscribeToQueue(queueName, () => {})).resolves.toMatchObject({
      queueName,
      queueType: 'observable'
    })
  })

  it('should allow subscribing to a new queue of type "observable"', async () => {
    const queueType = 'observable'

    const broker = new BpMessageBroker()
    await expect(broker.subscribeToQueue(queueName, () => {}, queueType)).resolves.toMatchObject({
      queueName,
      queueType
    })
  })

  it('should allow subscribing to a new queue of type "FIFO"', async () => {
    const queueType = 'FIFO'

    const broker = new BpMessageBroker()
    await expect(broker.subscribeToQueue(queueName, () => {}, queueType)).resolves.toMatchObject({
      queueName,
      queueType
    })
  })

  it('should not allow subscribing to an unknown type of queue', async () => {
    const queueType = 'WTF_QUEUE'

    const broker = new BpMessageBroker()
    await expect(broker.subscribeToQueue(queueName, () => {}, queueType)).rejects.toThrowError(`Trying to subscribeToQueue('${queueName}') as unknown/not permitted queueType = '${queueType}'. The allowed types are: `)
  })

  it('should allow subscribing to an existing queue w/o specifying the type', async () => {
    const broker = new BpMessageBroker()

    await broker.subscribeToQueue(queueName, () => {})
    await expect(broker.subscribeToQueue(queueName, () => {})).resolves.toMatchObject({
      queueName,
      queueType: 'observable',
      subscribersNumber: 2
    })
  })

  it('should allow subscribing to an existing queue of the same type', async () => {
    const queueType = 'FIFO'

    const broker = new BpMessageBroker()
    await broker.subscribeToQueue(queueName, () => {}, queueType)
    await expect(broker.subscribeToQueue(queueName, () => {}, queueType)).resolves.toMatchObject({
      queueName,
      queueType,
      subscribersNumber: 2
    })
  })

  it('should not allow subscribing to an existing queue of different type', async () => {
    const queueType = 'FIFO'

    const broker = new BpMessageBroker()
    await broker.subscribeToQueue(queueName, () => {})
    await expect(broker.subscribeToQueue(queueName, () => {}, queueType)).rejects
      .toThrowError(`Trying to subscribeToQueue('${queueName}') as queueType = '${queueType}' but the queue type is already defined as 'observable'`)
  })

  it('should not receive anything when connecting to an "observable" type queue where no previous values were emitted', async () => {
    const mockFunction = jest.fn();

    const broker = new BpMessageBroker()
    await broker.subscribeToQueue(queueName, mockFunction)
    await expect(mockFunction).not.toBeCalledWith(expect.anything())
  })

  it('should receive the last emitted value when connecting to an "observable" type queue where previous values were emitted', async () => {
    const mockFunction = jest.fn();

    const broker = new BpMessageBroker()
    await broker.publishToQueue(queueName, [mockData])
    await broker.subscribeToQueue(queueName, mockFunction)
    await expect(mockFunction).toBeCalledWith(mockData)
  })

  it('should allow unsubscribing from a queue', async () => {
    const subscribeFunction = () => {}

    const broker = new BpMessageBroker()
    await expect(broker.subscribeToQueue(queueName, subscribeFunction)).resolves.toMatchObject({
      queueName,
      subscribersNumber: 1
    })
    // expect unsubscribe from a non-existing queue to return "false"
    await expect(broker.unsubscribeToQueue(`${queueName}_WTF`, subscribeFunction)).rejects.toEqual(false)
    // expect unsubscribe from an existing queue to return "true"
    await expect(broker.unsubscribeToQueue(queueName, subscribeFunction)).resolves.toEqual(true)
    // checking that the subscription was removed: expect subscribing with another function to return 1 subscriber
    await expect(broker.subscribeToQueue(queueName, () => {})).resolves.toMatchObject({
      queueName,
      subscribersNumber: 1
    })
  })

  it('should receive the last emitted value using getLastQueued()', async () => {
    const broker = new BpMessageBroker()
    // expect "undefined" if nothing was emitted on the queue yet
    await expect(broker.getLastQueued(queueName)).resolves.toEqual(undefined)
    // expect to receive the latest emitted value if something was emitted
    await broker.publishToQueue(queueName, mockData)
    await expect(broker.getLastQueued(queueName)).resolves.toEqual(mockData)
    // expect "undefined" if the queue name does not exist
    await expect(broker.getLastQueued(`${queueName}_WTF`)).resolves.toEqual(undefined)
  })
})
