export function stripMetadata(content: string): string {
  return content.replace(/^---[\s\S]*?---/, '').trim();
}
