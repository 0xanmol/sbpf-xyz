import { Language, Offset } from "@/app/types";

export function formatOffsetsText(offsets: Offset[], language: Language): string {
  const lines: string[] = [];
  for (const o of offsets) {
    const commentText = o.comment ? ` // ${o.comment}` : "";
    switch (language) {
      case "Rust":
        lines.push(`const ${o.name}: usize = ${o.offset};${commentText}`);
        break;
      case "C":
        lines.push(`#define ${o.name} ${o.offset}${commentText}`);
        break;
      case "ASM":
      default:
        lines.push(`.equ ${o.name}, ${o.offset}${commentText}`);
        break;
    }
  }
  return lines.join("\n");
}


