import { ProjectSchema, type ProjectPayload } from "@/lib/schema/project";
import { deflate, inflate } from "pako";

export function encodeProjectToQuery(p: ProjectPayload): string {
  const validated = ProjectSchema.parse(p);
  const json = JSON.stringify(validated);
  // compress and base64 encode
  const compressed = deflate(json);
  const b64 = Buffer.from(compressed).toString("base64");
  return encodeURIComponent(b64);
}

export function decodeProjectFromQuery(raw: string): ProjectPayload | null {
  try {
    // Try compressed first
    const buf = Buffer.from(decodeURIComponent(raw), "base64");
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


