import { registerWebModule, NativeModule } from 'expo';

import { RnPollardKangarooModuleEvents } from './RnPollardKangaroo.types';

class RnPollardKangarooModule extends NativeModule<RnPollardKangarooModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(RnPollardKangarooModule);
