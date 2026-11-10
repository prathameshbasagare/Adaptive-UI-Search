// File: ./src/lib/json-stream.ts
//
// Incremental scanner for the model's JSON output. As text chunks arrive it
// emits each element of the top-level "components" array the moment that
// element's closing brace is seen, plus top-level string fields (tabTitle,
// summary, layoutStyle). It never parses the whole document — the final,
// authoritative parse happens once the stream ends (see extractJSON).

export interface ScanResult {
  /** Raw JSON text of each newly completed component. */
  components: string[];
  /** Top-level string fields completed during this chunk. */
  meta: Record<string, string>;
}

const META_KEYS = new Set(["tabTitle", "summary", "layoutStyle"]);

export class ComponentStreamScanner {
  private buf = "";
  private pos = 0;
  private started = false;
  private depth = 0;
  private inString = false;
  private escape = false;
  private strStart = -1;
  private pendingKey: string | null = null;
  private expectingValue = false;
  private componentsDepth = -1;
  private compStart = -1;

  feed(chunk: string): ScanResult {
    this.buf += chunk;
    const out: ScanResult = { components: [], meta: {} };

    if (!this.started) {
      // Skip reasoning blocks and prose; start at the first '{' after them.
      const openThink = this.buf.lastIndexOf("<think>");
      const closeThink = this.buf.lastIndexOf("</think>");
      if (openThink !== -1 && closeThink < openThink) return out;
      const from = closeThink === -1 ? 0 : closeThink + 8;
      const brace = this.buf.indexOf("{", from);
      if (brace === -1) return out;
      this.started = true;
      this.pos = brace;
    }

    const b = this.buf;
    for (; this.pos < b.length; this.pos++) {
      const ch = b[this.pos];

      if (this.inString) {
        if (this.escape) this.escape = false;
        else if (ch === "\\") this.escape = true;
        else if (ch === '"') {
          this.inString = false;
          if (this.depth === 1) this.onTopLevelString(b.slice(this.strStart, this.pos + 1), out);
        }
        continue;
      }

      switch (ch) {
        case '"':
          this.inString = true;
          this.strStart = this.pos;
          break;
        case ":":
          if (this.depth === 1) this.expectingValue = true;
          break;
        case ",":
          if (this.depth === 1) {
            this.expectingValue = false;
            this.pendingKey = null;
          }
          break;
        case "{":
        case "[":
          if (ch === "[" && this.depth === 1 && this.expectingValue && this.pendingKey === "components") {
            this.componentsDepth = this.depth + 1;
          } else if (ch === "{" && this.componentsDepth !== -1 && this.depth === this.componentsDepth) {
            this.compStart = this.pos;
          }
          this.depth++;
          break;
        case "}":
        case "]":
          this.depth--;
          if (ch === "}" && this.compStart !== -1 && this.depth === this.componentsDepth) {
            out.components.push(b.slice(this.compStart, this.pos + 1));
            this.compStart = -1;
          } else if (ch === "]" && this.depth === this.componentsDepth - 1) {
            this.componentsDepth = -1;
          }
          break;
      }
    }
    return out;
  }

  private onTopLevelString(literal: string, out: ScanResult) {
    let value: string;
    try {
      value = JSON.parse(literal);
    } catch {
      return;
    }
    if (!this.expectingValue) {
      this.pendingKey = value;
    } else if (this.pendingKey && META_KEYS.has(this.pendingKey)) {
      out.meta[this.pendingKey] = value;
    }
  }
}

/**
 * Extracts the JSON object from complete model output. Tries, in order:
 * the whole (think-stripped) text, a fenced block that wraps the *entire*
 * answer, then the outermost brace span. Fences that appear inside JSON
 * string values (e.g. a code component containing ```) are never matched.
 */
export function extractJSON(raw: string): string {
  const text = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  if (isParsable(text)) return text;

  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced && isParsable(fenced[1])) return fenced[1];

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1);

  return text;
}

function isParsable(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}
