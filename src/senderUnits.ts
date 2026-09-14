import type { LineEnding, SenderFormat } from "./types";

// What the Sender writes for one command. Text goes line by line, each line
// with the chosen ending, so a multi-line script runs one line per prompt
// (`senderSend.ts` waits for each prompt); hex goes as one unit holding
// every byte in the box.

export type SendUnit = string | Uint8Array;

/**
 * The lines of the command box. Blank lines are skipped: they would only
 * send bare Enters, and a script pasted with a trailing newline should not
 * end with one either.
 */
export function splitLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

/** The first line of the command box, as a name for the whole of it. */
export function firstLine(text: string): string {
  return splitLines(text)[0] ?? text;
}

export function buildUnits(
  text: string,
  format: SenderFormat,
  ending: LineEnding,
): SendUnit[] {
  if (format === "hex") {
    const cleaned = text.replace(/0x/gi, "").replace(/[^0-9a-f]/gi, "");
    if (cleaned.length === 0) return [];
    if (cleaned.length % 2 !== 0) {
      throw new Error("hex input needs an even number of digits");
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
    }
    const suffix = endingBytes(ending);
    return [concatBytes(bytes, suffix)];
  }

  return splitLines(text).map((line) => `${line}${endingText(ending)}`);
}

export function endingText(ending: LineEnding): string {
  if (ending === "lf") return "\n";
  if (ending === "crlf") return "\r\n";
  return "";
}

function endingBytes(ending: LineEnding): Uint8Array {
  if (ending === "lf") return Uint8Array.of(0x0a);
  if (ending === "crlf") return Uint8Array.of(0x0d, 0x0a);
  return new Uint8Array();
}

function concatBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  const result = new Uint8Array(left.length + right.length);
  result.set(left);
  result.set(right, left.length);
  return result;
}

export function endingLabel(ending: LineEnding): string {
  if (ending === "lf") return "append \\n";
  if (ending === "crlf") return "append \\r\\n";
  return "no line ending";
}
