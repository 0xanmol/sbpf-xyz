import { ProjectSchema, type ProjectPayload } from "@/lib/schema/project";
import { deflate, inflate } from "pako";

function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk) as unknown as number[]);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeProjectToQuery(p: ProjectPayload): string {
  const validated = ProjectSchema.parse(p);
  const json = JSON.stringify(validated);
  // compress and base64 encode
  const compressed = deflate(json);
  const b64 = uint8ToBase64(compressed);
  return encodeURIComponent(b64);
}

export function decodeProjectFromQuery(raw: string): ProjectPayload | null {
  try {
    // Try compressed first
    const buf = base64ToUint8(decodeURIComponent(raw));
    const decompressed = inflate(buf, { to: "string" }) as string;
    return ProjectSchema.parse(JSON.parse(decompressed));
  } catch {
    try {
      // Fallback to legacy uncompressed JSON payload
      const decoded = atob(decodeURIComponent(raw));
      return ProjectSchema.parse(JSON.parse(decoded));
    } catch {
      return null;
    }
  }
}


