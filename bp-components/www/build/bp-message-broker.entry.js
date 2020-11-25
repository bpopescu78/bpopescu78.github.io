import { r as registerInstance, h } from './index-8ac4ad20.js';

const QUEUE_TYPE_OBSERVABLE = 'observable';
const QUEUE_TYPE_FIFO = 'FIFO';
const BpMessageBroker = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.__queue = {};
    this.__queueTypes = {
      [QUEUE_TYPE_OBSERVABLE]: 1,
      [QUEUE_TYPE_FIFO]: 2
    };
  }
  /**
   * Obtains the last element emitted in `queueName`.
   *
   * Returns a `Promise` that always resolves to an `object` except if the queue does not exist or no value was emitted yet, in which case it resolves to `undefined`.
   */
  async getLastQueued(queueName) {
    return new Promise((resolve) => {
      const queuePosition = this.__queue[queueName] ? this.__queue[queueName].msgs.length - 1 : 0;
      resolve(!this.__queue[queueName] || !this.__queue[queueName].msgs[queuePosition]
        ? undefined // if there's no queue with this name or nothing in queue return undefined
        : this.__queue[queueName].msgs[queuePosition].data // return last queued element
      );
    });
  }
  /**
   * Unsubscribes from `queueName`.
   */
  async unsubscribeToQueue(queueName, callBackFunction) {
    return new Promise((resolve, reject) => {
      // if there's no queue with this name return false
      if (!this.__queue[queueName]) {
        return reject(false);
      }
      // remove the subscriber from the subscriber list
      this.__queue[queueName].subscribers = this.__queue[queueName].subscribers.filter(cbFunc => cbFunc !== callBackFunction);
      resolve(true);
    });
  }
  /**
   * Subscribes a `callBackFunction` to `queueName` of type `queueType`.
   * Possible values for `queueType` are QUEUE_TYPE_OBSERVABLE = 'observable' and QUEUE_TYPE_FIFO = 'FIFO'.
   * The default value is QUEUE_TYPE_OBSERVABLE.
   *
   * If the queue does not exist, it is created.
   */
  async subscribeToQueue(queueName, callBackFunction, queueType = QUEUE_TYPE_OBSERVABLE) {
    return new Promise((resolve, reject) => {
      // check that queueType has an allowed value
      if (!this.__queueTypes[queueType]) {
        return reject(new Error(`Trying to subscribeToQueue('${queueName}') as unknown/not permitted queueType = '${queueType}'. The allowed types are: '${Object.keys(this.__queueTypes).join(`', '`)}'`));
      }
      // if there's no queue with this name create it
      if (!this.__queue[queueName]) {
        this._createQueue(queueName);
      }
      // if there's no type set yet, set it on a "First come / First served" basis! :-)
      if (!this.__queue[queueName].type) {
        this.__queue[queueName].type = queueType;
      }
      else if (this.__queue[queueName].type !== queueType) {
        return reject(new Error(`Trying to subscribeToQueue('${queueName}') as queueType = '${queueType}' but the queue type is already defined as '${this.__queue[queueName].type}'`));
      }
      // add the callBackFunction to the subscribers list
      this.__queue[queueName].subscribers.push(callBackFunction);
      if (this.__queue[queueName].msgs.length === 1 && this.__queue[queueName].msgs[0]) {
        // broadcast last value to the new subscriber
        callBackFunction(this.__queue[queueName].msgs[0].data);
      }
      // to analyze if the following is needed... normally not for queueType = 'observable'
      else if (this.__queue[queueName].msgs.length > 1) {
        // broadcast queue value to all subscribers
        this._broadcastInQueue(queueName);
      }
      resolve({
        queueName,
        queueType: this.__queue[queueName].type,
        subscribersNumber: this.__queue[queueName].subscribers.length
      });
    });
  }
  /**
   * Publish content to `queueName`.
   *
   * `content` can be of any type but if `content` is of type `Array`, its elements will be sent to the queue as distinct values.
   * For example:
   * ```ts
   * publishToQueue('my-queue-name', [1, 4, 5])
   * ```
   * will emit 3 values on the `my-queue-name` in the array order: `1`, `3` and `5`.
   *
   * If the actual data we want to emit as a single value is the array `[1, 4, 5]`, then it needs to be escaped inside an additional array:
   * ```ts
   * publishToQueue('my-queue-name', [[1, 4, 5]])
   * ```
   *
   * It is a good practice to always send the value to be emitted inside an array in order to avoid checking the data types and to illustrate the intent of emitting one (single element array) or multiple values (multiple elements array):
   * ```ts
   * publishToQueue('my-queue-name', [{key: 345}])
   * publishToQueue('my-queue-name', [3])
   * publishToQueue('my-queue-name', ['Hello world!'])
   * publishToQueue('my-queue-name', [[1, 4, 5]])
   * ```
   */
  async publishToQueue(queueName, content) {
    return new Promise((resolve) => {
      // if there's no queue with this name create it
      if (!this.__queue[queueName]) {
        this._createQueue(queueName);
      }
      // push the content in the queue
      const contentArray = Array.isArray(content) ? content : [content];
      const outputArray = contentArray.map((data) => {
        return {
          data,
          params: {
            time: +new Date()
          }
        };
      });
      this.__queue[queueName].msgs.push(...outputArray);
      // broadcast the queue content to the subscribers
      console.log('broadcasting...');
      this._broadcastInQueue(queueName);
      resolve(outputArray);
    });
  }
  _createQueue(queueName) {
    this.__queue = Object.assign(Object.assign({}, this.__queue), { [queueName]: {
        msgs: [null],
        subscribers: [],
        broadcasting: false,
        type: undefined
      } });
  }
  _broadcastInQueue(queueName) {
    if (this.__queue[queueName] && !this.__queue[queueName].broadcasting) {
      // if there's no broadcasting going on
      // set boroadcast to true
      this.__queue[queueName].broadcasting = true;
      // ignore the 1st queued element
      let content = this.__queue[queueName].msgs.shift();
      // and while there is content in the queue
      while (this.__queue[queueName].msgs.length > 0) {
        // extract the first queued element
        content = this.__queue[queueName].msgs.shift();
        // broadcast the first queue element
        if (content) {
          this.__queue[queueName].subscribers.forEach(callBackFunction => callBackFunction(content.data));
        }
      }
      // add again the last element to the queue
      this.__queue[queueName].msgs.push(content);
      // broadcast ended
      this.__queue[queueName].broadcasting = false;
    }
  }
  render() {
    // only render the inner content
    return h("slot", null);
  }
};

export { BpMessageBroker as bp_message_broker };
