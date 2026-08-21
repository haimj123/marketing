import * as React from "react";

/**
 * A deliberately tiny markdown renderer for organization-supplied text.
 *
 * Every field an organization can edit is rendered through this. It supports
 * paragraphs, line breaks, **bold**, *italic* and `code`, and nothing else —
 * no raw HTML, no images, no links with an href we did not construct. That is
 * the sanitisation story: rather than accept HTML and try to clean it, we
 * never parse HTML at all, so there is no sanitiser to get wrong.
 */

type Token = { text: string; bold?: boolean; italic?: boolean; code?: boolean };

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function tokenise(line: string): Token[] {
  const parts = line.split(INLINE).filter((p) => p !== "");
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return { text: part.slice(2, -2), bold: true };
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return { text: part.slice(1, -1), italic: true };
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return { text: part.slice(1, -1), code: true };
    }
    return { text: part };
  });
}

function renderTokens(line: string, keyPrefix: string): React.ReactNode[] {
  return tokenise(line).map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    if (token.bold) return <strong key={key}>{token.text}</strong>;
    if (token.italic) return <em key={key}>{token.text}</em>;
    if (token.code) {
      return (
        <code key={key} className="rounded bg-ink-050 px-1 py-0.5 font-mono text-[0.9em]">
          {token.text}
        </code>
      );
    }
    return <React.Fragment key={key}>{token.text}</React.Fragment>;
  });
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.split(/\n{2,}/).filter((b) => b.trim() !== "");

  return (
    <div className={className}>
      {blocks.map((block, b) => {
        const lines = block.split("\n");

        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={b} className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
              {lines.map((line, i) => (
                <li key={i}>{renderTokens(line.replace(/^\s*[-*]\s+/, ""), `${b}-${i}`)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={b} className="mb-3 last:mb-0">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {renderTokens(line, `${b}-${i}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
