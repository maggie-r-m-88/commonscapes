// Lightweight HTML cleaner to avoid pulling in JSDOM at build time

export type WikimediaImageInfo = {
  url: string;
  width: number;
  height: number;
  mime: string;
  extmetadata?: Record<string, { value?: string }>;
};

export async function fetchImageInfo(filename: string): Promise<WikimediaImageInfo | null> {
  const API_ENDPOINT = "https://commons.wikimedia.org/w/api.php";
  const title = `File:${filename}`;
  const encoded = encodeURIComponent(title);

  const url =
    `${API_ENDPOINT}?action=query&titles=${encoded}` +
    `&prop=imageinfo&iiprop=url|size|dimensions|mime|extmetadata&format=json`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const page = Object.values(data?.query?.pages ?? {})[0] as any;
  if (!page?.imageinfo?.[0]) return null;

  return page.imageinfo[0];
}

export function cleanHtml(html?: string) {
  if (!html) return '';
  // Remove tags
  const withoutTags = html.replace(/<[^>]*>/g, '');
  // Decode a few common HTML entities
  const decoded = withoutTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return decoded.trim();
}

export function parseCategories(raw?: string) {
  if (!raw) return [];
  return raw.split('|').map(c => c.trim()).filter(Boolean);
}

export function extractMetadata(filename: string, imageinfo: WikimediaImageInfo) {
  const meta = imageinfo.extmetadata ?? {};
  const user =
    meta.Artist?.value ||
    meta.Author?.value ||
    meta.Credit?.value ||
    "Unknown";

  return {
    title: filename,
    url: imageinfo.url,
    width: imageinfo.width,
    height: imageinfo.height,
    mime: imageinfo.mime,
    added_at: new Date().toISOString(),
    taken_at: meta.DateTime?.value ?? null,
    source: "Wikimedia Commons",
    attribution: cleanHtml(user),
    license_name: meta.LicenseShortName?.value ?? '',
    license_url: meta.LicenseUrl?.value ?? '',
    description: cleanHtml(meta.ImageDescription?.value),
    categories: parseCategories(meta.Categories?.value),
    owner: cleanHtml(user),
    info_url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,
  };
}
