import { NativeModule, requireNativeModule } from 'expo';

import { RnPollardKangarooModuleEvents } from './RnPollardKangaroo.types';

declare class RnPollardKangarooModule extends NativeModule<RnPollardKangarooModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RnPollardKangarooModule>('RnPollardKangaroo');
