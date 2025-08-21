import { 
  Offset, 
  Account, 
  InstructionDataField, 
  INSTRUCTION_DATA_TYPES, 
  SPL_MINT_FIELDS, 
  SPL_TOKEN_FIELDS, 
  TOKEN2022_MINT_FIELDS, 
  SYSVAR_CLOCK_FIELDS, 
  SYSVAR_RENT_FIELDS,
} from "@/app/types";

export interface CalculateOffsetsParams {
  accounts: Account[];
  instructionData: InstructionDataField[];
  paddingBytes?: number;
  alignmentBytes?: number;
}

export function calculateOffsets({
  accounts,
  instructionData,
  paddingBytes = 10240,
  alignmentBytes = 8,
}: CalculateOffsetsParams): Offset[] {
  let currentOffset = 0x0008;
  const offsets: Offset[] = [];

  const addOffset = (
    accountName: string,
    fieldName: string,
    size?: number,
    comment?: string
  ) => {
    offsets.push({
      name: `${accountName}_${fieldName}`,
      offset: "0x" + currentOffset.toString(16).padStart(4, "0"),
      comment,
    });
    currentOffset += size || 0;
  };

  const align = () => {
    if (currentOffset % alignmentBytes !== 0) {
      const alignmentPadding = alignmentBytes - (currentOffset % alignmentBytes);
      currentOffset += alignmentPadding;
    }
  };

  offsets.push({ name: "NUM_ACCOUNTS", offset: "0x0000" });

  accounts.forEach((account) => {
    const name = account.name.toUpperCase();
    addOffset(name, "HEADER", 8);
    addOffset(name, "KEY", 32);
    addOffset(name, "OWNER", 32);
    addOffset(name, "LAMPORTS", 8);
    addOffset(name, "DATA_LEN", 8);

    const dataStartOffset = currentOffset;

    const shouldShowDataOffset = !(
      account.type === "SPL Mint" ||
      account.type === "SPL Token" ||
      account.type === "Sysvar Clock" ||
      account.type === "Sysvar Rent" ||
      (account.type === "TypedAccount" && account.customFields && account.customFields.length > 0)
    );

    if (shouldShowDataOffset) {
      addOffset(name, "DATA", 0);
    }

    if (account.type === "SPL Mint") {
      SPL_MINT_FIELDS.forEach((field) => {
        const fieldSize = INSTRUCTION_DATA_TYPES[field.type];
        offsets.push({
          name: `${name}_${field.name.toUpperCase()}`,
          offset: "0x" + (dataStartOffset + field.offset).toString(16).padStart(4, "0"),
          comment: `${field.type} (${fieldSize} bytes)`,
        });
      });
      currentOffset += account.dataLength;
    } else if (account.type === "SPL Token") {
      SPL_TOKEN_FIELDS.forEach((field) => {
        const fieldSize = INSTRUCTION_DATA_TYPES[field.type];
        offsets.push({
          name: `${name}_${field.name.toUpperCase()}`,
          offset: "0x" + (dataStartOffset + field.offset).toString(16).padStart(4, "0"),
          comment: `${field.type} (${fieldSize} bytes)`,
        });
      });
      currentOffset += account.dataLength;
    } else if (account.type === "Sysvar Clock") {
      SYSVAR_CLOCK_FIELDS.forEach((field) => {
        const fieldSize = INSTRUCTION_DATA_TYPES[field.type];
        offsets.push({
          name: `${name}_${field.name.toUpperCase()}`,
          offset: "0x" + (dataStartOffset + field.offset).toString(16).padStart(4, "0"),
          comment: `${field.type} (${fieldSize} bytes)`,
        });
      });
      currentOffset += account.dataLength;
    } else if (account.type === "Sysvar Rent") {
      SYSVAR_RENT_FIELDS.forEach((field) => {
        const fieldSize = INSTRUCTION_DATA_TYPES[field.type];
        offsets.push({
          name: `${name}_${field.name.toUpperCase()}`,
          offset: "0x" + (dataStartOffset + field.offset).toString(16).padStart(4, "0"),
          comment: `${field.type} (${fieldSize} bytes)`,
        });
      });
      currentOffset += account.dataLength;
    } else if (account.type === "Token2022 Mint") {
      TOKEN2022_MINT_FIELDS.forEach((field) => {
        const fieldSize = INSTRUCTION_DATA_TYPES[field.type];
        offsets.push({
          name: `${name}_${field.name.toUpperCase()}`,
          offset: "0x" + (dataStartOffset + field.offset).toString(16).padStart(4, "0"),
          comment: `${field.type} (${fieldSize} bytes)`,
        });
      });
      currentOffset += account.dataLength;
    } else if (account.type === "TypedAccount" && account.customFields) {
      let fieldOffset = 0;
      account.customFields.forEach((field) => {
        let fieldSize = INSTRUCTION_DATA_TYPES[field.type];
        if (field.type === "[u8;N]") {
          fieldSize = field.size || 1;
        }
        offsets.push({
          name: `${name}_${field.name.toUpperCase()}`,
          offset: "0x" + (dataStartOffset + fieldOffset).toString(16).padStart(4, "0"),
          comment: `${field.type}${field.type === "[u8;N]" ? `[${field.size}]` : ""} (${fieldSize} bytes)`,
        });
        fieldOffset += fieldSize;
      });
      currentOffset += account.dataLength;
    } else {
      currentOffset += account.dataLength;
    }

    currentOffset += paddingBytes;
    currentOffset += 8;
    align();
  });

  offsets.push({ name: "INSTRUCTION_DATA_LEN", offset: "0x" + currentOffset.toString(16).padStart(4, "0") });
  currentOffset += 8;

  const instructionDataStart = currentOffset;
  offsets.push({ name: "INSTRUCTION_DATA", offset: "0x" + instructionDataStart.toString(16).padStart(4, "0") });

  instructionData.forEach((field) => {
    let fieldSize = INSTRUCTION_DATA_TYPES[field.type];
    if (field.type === "[u8;N]") {
      fieldSize = field.size || 1;
    }
    offsets.push({
      name: `INSTRUCTION_${field.name.toUpperCase()}`,
      offset: "0x" + currentOffset.toString(16).padStart(4, "0"),
      comment: `${field.type}${field.type === "[u8;N]" ? `[${field.size}]` : ""} (${fieldSize} bytes)`,
    });
    currentOffset += fieldSize;
  });

  offsets.push({ name: "PROGRAM_ID", offset: "0x" + currentOffset.toString(16).padStart(4, "0") });
  return offsets;
}


