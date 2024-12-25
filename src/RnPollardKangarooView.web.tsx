import * as React from 'react';

import { RnPollardKangarooViewProps } from './RnPollardKangaroo.types';

export default function RnPollardKangarooView(props: RnPollardKangarooViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
