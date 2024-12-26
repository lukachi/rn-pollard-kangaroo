import RnPollardKangarooModule from "./RnPollardKangarooModule";
export * from "./RnPollardKangaroo.types";

export const initializeKangaroo = async (tableObjectJson: string) => {
  await RnPollardKangarooModule.initializeKangaroo(tableObjectJson);
};

export const solveDLP = async (pk: Uint8Array) => {
  return RnPollardKangarooModule.solveDlp(pk);
};
