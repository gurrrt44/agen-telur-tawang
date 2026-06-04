"use client";

import { motion } from "motion/react";

function DigitColumn({ digit, delay = 0 }: { digit: string; delay?: number }) {
  const n = parseInt(digit);
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: "1.05em", width: "0.62em", verticalAlign: "bottom" }}
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        animate={{ y: `${-n * 10}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 24, delay }}
        style={{ height: "1000%", lineHeight: "1.05em" }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} style={{ height: "10%", display: "flex", alignItems: "flex-end" }}>{d}</span>
        ))}
      </motion.span>
    </span>
  );
}

export function OdometerPrice({ value }: { value: number }) {
  const str = Math.round(value).toLocaleString("id-ID");
  const chars = str.split("");
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let di = 0;
  return (
    <span className="inline-flex items-baseline whitespace-nowrap">
      <span>Rp&nbsp;</span>
      {chars.map((char, i) => {
        if (!/\d/.test(char)) return <span key={i}>{char}</span>;
        const pos = di++;
        return <DigitColumn key={i} digit={char} delay={(digitCount - 1 - pos) * 0.045} />;
      })}
    </span>
  );
}
