// The cover image of a TikTok post, via TikTok's public oEmbed (no login; both
// requests allow cross-origin, so Studio fetches them straight from the
// browser). The image URL is signed and expires, so the caller uploads the
// blob into Sanity rather than linking to it.
const TIKTOK = /^https:\/\/(www\.|m\.|vm\.|vt\.)?tiktok\.com\//i;

export async function tiktokThumbnail(link, fetchImpl = fetch) {
  if (typeof link !== 'string' || !TIKTOK.test(link)) {
    throw new Error('Lim inn en TikTok-lenke i «Lenke til innlegget» først.');
  }
  const res = await fetchImpl('https://www.tiktok.com/oembed?url=' + encodeURIComponent(link));
  const data = res.ok ? await res.json() : {};
  if (!data.thumbnail_url) {
    throw new Error('Fant ikke noe bilde for denne lenken. Sjekk at den går til én video, ikke en profil.');
  }
  const img = await fetchImpl(data.thumbnail_url);
  if (!img.ok) throw new Error('Fant ikke bildet hos TikTok. Prøv igjen, eller last opp et skjermbilde.');
  return img.blob();
}
