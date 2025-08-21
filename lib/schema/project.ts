import { z } from "zod";

export const InstructionDataType = z.union([
  z.literal("u8"), z.literal("u16"), z.literal("u32"), z.literal("u64"),
  z.literal("i8"), z.literal("i16"), z.literal("i32"), z.literal("i64"),
  z.literal("f32"), z.literal("f64"), z.literal("Pubkey"), z.literal("[u8;N]")
]);

export const ProjectSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  id: z.string(),
  name: z.string(),
  language: z.union([z.literal("ASM"), z.literal("Rust"), z.literal("C")]).optional(),
  accounts: z.array(z.object({
    name: z.string(),
    type: z.string(),
    dataLength: z.number().int().nonnegative(),
    extensions: z.array(z.string()).optional(),
    customFields: z.array(z.object({
      name: z.string(),
      type: InstructionDataType,
      size: z.number().int().positive().optional(),
    })).optional(),
  })),
  instructionData: z.array(z.object({
    name: z.string(),
    type: InstructionDataType,
    size: z.number().int().positive().optional(),
  })).optional(),
});

export type ProjectPayload = z.infer<typeof ProjectSchema>;


