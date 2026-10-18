// The Featured post image field, plus a button that fills it with the cover
// image of the TikTok post in «Lenke til innlegget». Plain createElement, no
// JSX, so the schemas still load in Node for test/studio.test.js.
import { createElement as h, useState } from 'react';
import { set, useClient, useFormValue } from 'sanity';
import { Button, Stack, Text } from '@sanity/ui';
import { tiktokThumbnail } from '../tiktok.js';

export function TikTokImageInput(props) {
  const link = useFormValue(['link']);
  const client = useClient({ apiVersion: '2024-01-01' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function fetchImage() {
    setBusy(true);
    setError('');
    try {
      const blob = await tiktokThumbnail(link);
      const asset = await client.assets.upload('image', blob, { filename: 'tiktok.jpg' });
      props.onChange(set({ _type: 'image', asset: { _type: 'reference', _ref: asset._id } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return h(Stack, { space: 3 },
    props.renderDefault(props),
    h(Button, { mode: 'ghost', text: 'Hent bilde fra TikTok', loading: busy, disabled: busy, onClick: fetchImage }),
    error && h(Text, { size: 1, style: { color: 'var(--card-badge-critical-fg-color)' } }, error),
  );
}
