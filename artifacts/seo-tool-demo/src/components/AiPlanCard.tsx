import { useState } from "react";
import { useGenerateAuditPlan } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, AlertTriangle } from "lucide-react";

export function AiPlanCard({ auditId }: { auditId: string }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const mut = useGenerateAuditPlan({
    mutation: {
      onSuccess: (res) => {
        setErrMsg(null);
        setMarkdown(res.markdown);
      },
      onError: (e: any) => {
        setMarkdown(null);
        if (e?.status === 503) {
          setErrMsg(
            e?.data?.message ??
              "AI plan isn't configured on this server (ANTHROPIC_API_KEY missing).",
          );
        } else {
          setErrMsg(e?.message ?? "Couldn't generate your plan.");
        }
      },
    },
  });

  return (
    <section className="border rounded-3xl overflow-hidden bg-card">
      <div className="px-6 lg:px-8 py-6 flex items-start gap-5 border-b">
        <span className="h-11 w-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <Wand2 className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">
            AI strategist
          </div>
          <h2 className="font-display text-2xl tracking-tight">
            Your <span className="font-display-italic">14-day</span> plan
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Have Claude read this audit and write a personalized action plan
            for your business — what to do today, this week, and what to hire
            out.
          </p>
        </div>
        <Button
          onClick={() => mut.mutate({ auditId })}
          disabled={mut.isPending}
          className="shrink-0 gap-2"
        >
          {mut.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Writing…
            </>
          ) : markdown ? (
            "Regenerate"
          ) : (
            "Generate plan"
          )}
        </Button>
      </div>

      {errMsg && (
        <div className="px-6 lg:px-8 py-4 bg-amber-500/5 text-amber-700 border-b border-amber-500/20 text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errMsg}</span>
        </div>
      )}

      {markdown && (
        <div className="px-6 lg:px-8 py-6">
          <Markdown md={markdown} />
        </div>
      )}
    </section>
  );
}

// Tiny markdown renderer — enough for what the agent produces (h2/h3, bold, lists, paragraphs).
function Markdown({ md }: { md: string }) {
  const blocks = parseBlocks(md);
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
      {blocks.map((b, i) => {
        if (b.type === "h2")
          return (
            <h3
              key={i}
              className="font-display text-2xl tracking-tight mt-4 first:mt-0"
            >
              {renderInline(b.text)}
            </h3>
          );
        if (b.type === "h3")
          return (
            <h4
              key={i}
              className="font-semibold text-base tracking-tight mt-3 first:mt-0"
            >
              {renderInline(b.text)}
            </h4>
          );
        if (b.type === "ul")
          return (
            <ul key={i} className="space-y-2 ml-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3">
                  <span className="text-accent shrink-0">›</span>
                  <span>{renderInline(it)}</span>
                </li>
              ))}
            </ul>
          );
        if (b.type === "ol")
          return (
            <ol key={i} className="space-y-2 ml-1 list-none">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3">
                  <span className="font-display text-xl tabular-nums text-muted-foreground/70 shrink-0 leading-tight">
                    {String(j + 1).padStart(2, "0")}
                  </span>
                  <span>{renderInline(it)}</span>
                </li>
              ))}
            </ol>
          );
        return (
          <p key={i} className="text-foreground/85">
            {renderInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(md: string): Block[] {
  const lines = md.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^##\s+/.test(line)) {
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
      i++;
      continue;
    }
    if (/^###\s+/.test(line)) {
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") });
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    // paragraph
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s+|[-*]\s+|\d+\.\s+)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  // Split on **bold** and `code`
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={key++}>{m[1]}</strong>);
    else if (m[2])
      parts.push(
        <code
          key={key++}
          className="font-mono text-[13px] bg-muted px-1.5 py-0.5 rounded"
        >
          {m[2]}
        </code>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
