import { describe, expect, it } from "vitest";

import { buildUnits, firstLine, splitLines } from "./senderUnits";

describe("Sender units", () => {
  it("sends a multi-line command one line at a time, each with the ending", () => {
    expect(buildUnits("cd /var/log\n\ntail -n 5 syslog\r\n", "text", "lf")).toEqual([
      "cd /var/log\n",
      "tail -n 5 syslog\n",
    ]);
    expect(buildUnits("a\nb", "text", "crlf")).toEqual(["a\r\n", "b\r\n"]);
    expect(buildUnits("a\nb", "text", "none")).toEqual(["a", "b"]);
  });

  it("keeps a line's own leading whitespace and drops only blank lines", () => {
    expect(splitLines("  indented\n   \n\t\nlast")).toEqual(["  indented", "last"]);
    expect(buildUnits("", "text", "lf")).toEqual([]);
    expect(buildUnits("\n\n", "text", "lf")).toEqual([]);
  });

  it("names a command after its first line", () => {
    expect(firstLine("\nuptime\ndf -h")).toBe("uptime");
    expect(firstLine("   ")).toBe("   ");
  });

  it("sends hex as one unit, newlines and prefixes ignored", () => {
    const [unit] = buildUnits("0x48 65\n6c 6C\n", "hex", "lf");
    expect(Array.from(unit as Uint8Array)).toEqual([0x48, 0x65, 0x6c, 0x6c, 0x0a]);
    expect(buildUnits("  ", "hex", "lf")).toEqual([]);
    expect(() => buildUnits("abc", "hex", "none")).toThrow(/even number/);
  });
});
