const ENCODINGS = ["brotli", "gzip", "deflate", "deflate-raw", "zstd"];

const BOM = [0xef, 0xbb, 0xbf];

const JSON_STARTS = new Set([
  0x7b, // {
  0x5b, // [
  0x22, // "
  0x2d, // -
  0x74, // t(rue)
  0x66, // f(alse)
  0x6e, // n(ull)
]);

const isWhitespace = (byte: number) =>
  byte === 0x20 || byte === 0x09 || byte === 0x0a || byte === 0x0d;

const isDigit = (byte: number) => byte >= 0x30 && byte <= 0x39;

function looksLikeJson(bytes: Uint8Array): boolean {
  let i = 0;

  if (BOM.every((byte, offset) => bytes[offset] === byte)) i = BOM.length;

  while (i < bytes.length && isWhitespace(bytes[i])) i++;

  if (i >= bytes.length) return false;

  return JSON_STARTS.has(bytes[i]) || isDigit(bytes[i]);
}

async function decompress(
  bytes: Uint8Array,
  encoding: string,
): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream(encoding as CompressionFormat));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function readJson<T = any>(res: Response): Promise<T> {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const bytes = new Uint8Array(await res.arrayBuffer());
  const decoder = new TextDecoder();

  if (looksLikeJson(bytes)) return JSON.parse(decoder.decode(bytes));

  for (const encoding of ENCODINGS) {
    try {
      return JSON.parse(decoder.decode(await decompress(bytes, encoding)));
    } catch {}
  }

  return JSON.parse(decoder.decode(bytes));
}
