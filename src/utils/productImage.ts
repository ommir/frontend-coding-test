export const FALLBACK_IMAGE = 'https://placehold.co/600x400?text=Product'


export function resolveImageUrl(images?: string[]): string {
  const raw = images?.[0]

  if (!raw) {
    return FALLBACK_IMAGE
  }

  const match = raw.match(/https?:\/\/[^\s"'\\\]]+/)
  return match ? match[0] : FALLBACK_IMAGE
}
