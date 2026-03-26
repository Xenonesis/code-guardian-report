declare module "*.worker" {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}

declare module "*.worker?worker" {
  const workerConstructor: {
    new (): Worker;
    default: new () => Worker;
  };
  export default workerConstructor;
}
