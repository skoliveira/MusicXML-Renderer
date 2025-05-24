import React from "react";
import { STAFF_LINE_SPACING } from "./StavesRenderer";

interface LedgerLinesProps {
  x: number;
  y: number;
  staff: number;
  staffYOffset: number;
}

export const LedgerLines: React.FC<LedgerLinesProps> = ({
  x,
  y,
  staff,
  staffYOffset,
}) => {
  const staffY = staffYOffset + (staff - 1) * 120; // 120 is STAFF_SPACING
  const topStaffLine = staffY;
  const bottomStaffLine = staffY + 4 * STAFF_LINE_SPACING; // 4 spaces between 5 lines
  const ledgerWidth = 22; // Width of ledger lines (slightly wider than notehead)
  const ledgerXOffset = x - ledgerWidth / 2;

  const ledgerLines: number[] = [];

  // Add ledger lines above the staff
  let currentY = topStaffLine - STAFF_LINE_SPACING;
  while (currentY > y - STAFF_LINE_SPACING / 2) {
    ledgerLines.push(currentY);
    currentY -= STAFF_LINE_SPACING;
  }

  // Add ledger lines below the staff
  currentY = bottomStaffLine + STAFF_LINE_SPACING;
  while (currentY < y + STAFF_LINE_SPACING / 2) {
    ledgerLines.push(currentY);
    currentY += STAFF_LINE_SPACING;
  }

  return (
    <>
      {ledgerLines.map((lineY, index) => (
        <line
          key={`ledger-${index}`}
          x1={ledgerXOffset}
          y1={lineY}
          x2={ledgerXOffset + ledgerWidth}
          y2={lineY}
          stroke="black"
          strokeWidth="1"
        />
      ))}
    </>
  );
};
