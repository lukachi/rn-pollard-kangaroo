// Reexport the native module. On web, it will be resolved to RnPollardKangarooModule.web.ts
// and on native platforms to RnPollardKangarooModule.ts
export { default } from './RnPollardKangarooModule';
export { default as RnPollardKangarooView } from './RnPollardKangarooView';
export * from  './RnPollardKangaroo.types';
