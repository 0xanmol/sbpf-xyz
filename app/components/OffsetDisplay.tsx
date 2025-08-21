import { OffsetDisplayProps } from "../types";
import { calculateOffsets } from "@/lib/offsets/calc";

const OffsetDisplay = ({ accounts, instructionData, language }: OffsetDisplayProps) => {
  // offsets are now computed in a pure util to keep this component presentational
  const offsets = calculateOffsets({ accounts, instructionData });

  const formatOffset = (name: string, offset: string, comment?: string) => {
    const commentText = comment ? ` // ${comment}` : "";
    
    switch (language) {
      case "Rust":
        return (
          <div className="leading-loose">
            <span className="text-purple-400">const</span>
            <span className="text-gray-300"> {name}:</span>
            <span className="text-purple-400"> usize</span>
            <span className="text-gray-300"> = </span>
            <span className="text-amber-300">{offset}</span>
            <span className="text-gray-300">;</span>
            <span className="text-green-400">{commentText}</span>
          </div>
        );
      case "C":
        return (
          <div className="leading-loose">
            <span className="text-purple-400">#define</span>
            <span className="text-gray-300"> {name}</span>
            <span className="text-amber-300"> {offset}</span>
            <span className="text-green-400">{commentText}</span>
          </div>
        );
      case "ASM":
        return (
          <div className="leading-loose">
            <span className="text-purple-400">.equ</span>
            <span className="text-gray-300"> {name}, </span>
            <span className="text-amber-300">{offset}</span>
            <span className="text-green-400">{commentText}</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-700 rounded-b-lg p-4 font-mono text-sm border-t-0 border-x-4 border-b-4 border-black">
      {offsets.map((offset, idx) => (
        <div key={idx}>{formatOffset(offset.name, offset.offset, offset.comment)}</div>
      ))}
    </div>
  );
};

export default OffsetDisplay;
