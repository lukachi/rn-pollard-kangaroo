import RnPollardKangarooModule from "./RnPollardKangarooModule";
export * from "./RnPollardKangaroo.types";

export const initializeKangaroo = async (
  tableObjectJson: string,
  n: bigint,
  w: bigint,
  r: bigint,
  bits: number,
) => {
  await RnPollardKangarooModule.initializeKangaroo(
    tableObjectJson,
    +n.toString(),
    +w.toString(),
    +r.toString(),
    bits,
  );
};

export const solveDLP = async (pk: Uint8Array) => {
  const result = await RnPollardKangarooModule.solveDlp(pk);

  console.log("result", result);

  return result;
};
