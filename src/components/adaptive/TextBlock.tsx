// File: ./src/components/adaptive/TextBlock.tsx

"use client";

import { useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface TocEntry { id: string; text: string; level: 2 | 3; }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function extractHeadings(content: string): TocEntry[] {
  return content.split("\n").reduce<TocEntry[]>((acc, line) => {
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    if (h2) acc.push({ id: slugify(h2[1]), text: h2[1], level: 2 });
    else if (h3) acc.push({ id: slugify(h3[1]), text: h3[1], level: 3 });
    return acc;
  }, []);
}

function TableOfContents({ entries }: { entries: TocEntry[] }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (obs) => {
        for (const entry of obs) {
          if (entry.isIntersecting) {
            document.querySelectorAll("[data-toc-link]").forEach((el) => {
              const isActive = el.getAttribute("data-toc-link") === entry.target.id;
              (el as HTMLElement).style.color = isActive ? "var(--theme-400)" : "";
            });
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    entries.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav className="sticky top-4 w-44 shrink-0 hidden lg:block self-start">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Contents</p>
      <ul className="space-y-0.5">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              data-toc-link={e.id}
              className={`block text-xs py-1 px-2 rounded transition-colors hover:bg-slate-800/60 text-slate-500 ${e.level === 3 ? "pl-4" : ""}`}
              onClick={(ev) => { ev.preventDefault(); document.getElementById(e.id)?.scrollIntoView({ behavior: "smooth" }); }}
            >{e.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface TextBlockProps { content: string; }

export default function TextBlock({ content }: TextBlockProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const showToc = headings.length >= 3;

  const markdownEl = (
    <div className="prose prose-invert max-w-none text-slate-200 flex-1 min-w-0">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4 mt-2">{children}</h1>,
          h2: ({ children }) => { const id = slugify(String(children)); return <h2 id={id} className="text-xl font-semibold text-white mb-3 mt-5 scroll-mt-6">{children}</h2>; },
          h3: ({ children }) => { const id = slugify(String(children)); return <h3 id={id} className="text-lg font-semibold text-slate-100 mb-2 mt-4 scroll-mt-6">{children}</h3>; },
          p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="text-slate-300 pl-2">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 pl-4 my-3 text-slate-400 italic" style={{ borderColor: "var(--theme-500)" }}>{children}</blockquote>
          ),
          code: ({ children, className }) => !className
            ? <code className="bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono" style={{ color: "var(--theme-400)" }}>{children}</code>
            : <code className="block bg-slate-800 text-slate-200 p-4 rounded-lg text-sm font-mono overflow-x-auto">{children}</code>,
          hr: () => <hr className="border-slate-700 my-4" />,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80" style={{ color: "var(--theme-400)" }}>{children}</a>,
          table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm text-slate-300 border-collapse">{children}</table></div>,
          th: ({ children }) => <th className="border border-slate-600 bg-slate-700 px-4 py-2 text-left font-semibold text-white">{children}</th>,
          td: ({ children }) => <td className="border border-slate-700 px-4 py-2">{children}</td>,
        }}
      >{content}</ReactMarkdown>
    </div>
  );

  if (showToc) return <div className="flex gap-6 items-start"><TableOfContents entries={headings} />{markdownEl}</div>;
  return markdownEl;
}
