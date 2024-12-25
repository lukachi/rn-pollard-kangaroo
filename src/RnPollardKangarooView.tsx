import { requireNativeView } from 'expo';
import * as React from 'react';

import { RnPollardKangarooViewProps } from './RnPollardKangaroo.types';

const NativeView: React.ComponentType<RnPollardKangarooViewProps> =
  requireNativeView('RnPollardKangaroo');

export default function RnPollardKangarooView(props: RnPollardKangarooViewProps) {
  return <NativeView {...props} />;
}
