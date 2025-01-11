import { NativeModule, requireNativeModule } from "expo";

import { RnPollardKangarooModuleEvents } from "./RnPollardKangaroo.types";

declare class RnPollardKangarooModule extends NativeModule<RnPollardKangarooModuleEvents> {
  initializeKangaroo: (secretSizes: number[]) => Promise<void>;
  solveDlp: (pk: Uint8Array, timeLimits: number[]) => Promise<number>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RnPollardKangarooModule>(
  "RnPollardKangaroo",
);
