import { NativeModule, requireNativeModule } from "expo";

import { RnPollardKangarooModuleEvents } from "./RnPollardKangaroo.types";

declare class RnPollardKangarooModule extends NativeModule<RnPollardKangarooModuleEvents> {
  initializeKangaroo: (
    tableObjectJson: string,
    n: number,
    w: number,
    r: number,
    bits: number,
  ) => Promise<void>;
  solveDlp: (pk: Uint8Array) => Promise<bigint>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RnPollardKangarooModule>(
  "RnPollardKangaroo",
);
