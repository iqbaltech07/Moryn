"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock";
import { InlineCode } from "./InlineCode";
import { MermaidBlock } from "./MermaidBlock";
import { Callout, CalloutType } from "./Callout";
import { TableBlock, TableHeader, TableBody, TableRow, TableCell } from "./TableBlock";
import { ImageBlock } from "./ImageBlock";
import { HeadingBlock } from "./HeadingBlock";
import { ListBlock, ListItemBlock } from "./ListBlock";
import { ExternalLink } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const VALID_HTML_TAGS = new Set([
  "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote",
  "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist",
  "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption",
  "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr",
  "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map",
  "mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p",
  "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section",
  "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody",
  "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul",
  "var", "video", "wbr"
]);

function sanitizeMarkdownHtml(text: string): string {
  if (!text) return "";
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) return part;
    return part.replace(/<\/?([a-zA-Z0-9_-]+)[^>]*>/g, (fullMatch, tagName) => {
      if (VALID_HTML_TAGS.has(tagName.toLowerCase())) {
        return fullMatch;
      }
      return fullMatch.replace("<", "&lt;").replace(">", "&gt;");
    });
  }).join("");
}

const MarkdownRendererComponent: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content) return null;
  const safeContent = sanitizeMarkdownHtml(content);

  return (
    <div className={`ai-markdown-content text-zinc-900 leading-relaxed font-sans text-xs sm:text-sm min-w-0 max-w-full overflow-hidden wrap-break-word ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Heading Overrides
          h1: ({ children }) => <HeadingBlock level={1}>{children}</HeadingBlock>,
          h2: ({ children }) => <HeadingBlock level={2}>{children}</HeadingBlock>,
          h3: ({ children }) => <HeadingBlock level={3}>{children}</HeadingBlock>,
          h4: ({ children }) => <HeadingBlock level={4}>{children}</HeadingBlock>,
          h5: ({ children }) => <HeadingBlock level={5}>{children}</HeadingBlock>,
          h6: ({ children }) => <HeadingBlock level={6}>{children}</HeadingBlock>,

          // Paragraphs
          p: ({ children }) => <p className="mb-3 leading-relaxed text-zinc-800 last:mb-0">{children}</p>,

          // Links
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-0.5 text-[#e15b39] hover:text-[#c44827] underline underline-offset-4 decoration-[#e15b39]/40 hover:decoration-[#e15b39] transition-colors font-medium"
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="w-3 h-3 text-[#e15b39]/80 inline" />}
              </a>
            );
          },

          // Lists
          ul: ({ children }) => <ListBlock ordered={false}>{children}</ListBlock>,
          ol: ({ children }) => <ListBlock ordered={true}>{children}</ListBlock>,
          li: ({ children, checked }: any) => (
            <ListItemBlock checked={checked !== undefined && checked !== null ? checked : null}>
              {children}
            </ListItemBlock>
          ),

          // Blockquotes / GitHub Callouts
          blockquote: ({ children }) => {
            const childrenArray = React.Children.toArray(children);
            const firstChild = childrenArray[0];

            let textContent = "";
            if (typeof firstChild === "string") {
              textContent = firstChild;
            } else if (React.isValidElement(firstChild) && (firstChild.props as any)?.children) {
              const inner = (firstChild.props as any).children;
              textContent = Array.isArray(inner) ? inner.join("") : String(inner || "");
            }

            const alertMatch = textContent.match(/^\[!(NOTE|WARNING|IMPORTANT|TIP|CAUTION)\]/i);

            if (alertMatch) {
              const tag = alertMatch[1].toUpperCase();
              let type: CalloutType = "info";

              if (tag === "WARNING") type = "warning";
              else if (tag === "IMPORTANT") type = "error";
              else if (tag === "TIP") type = "tip";
              else if (tag === "CAUTION") type = "error";
              else type = "info";

              return <Callout type={type}>{children}</Callout>;
            }

            return <Callout type="info">{children}</Callout>;
          },

          // Code blocks & Inline code & Mermaid
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";
            const codeString = String(children).replace(/\n$/, "");

            if (lang === "mermaid") {
              return <MermaidBlock chart={codeString} />;
            }

            if (!inline && match) {
              return <CodeBlock language={lang} code={codeString} />;
            }

            if (!inline && codeString.includes("\n")) {
              return <CodeBlock language="text" code={codeString} />;
            }

            return <InlineCode {...props}>{children}</InlineCode>;
          },

          // Tables
          table: ({ children }) => <TableBlock>{children}</TableBlock>,
          thead: ({ children }) => <TableHeader>{children}</TableHeader>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => <TableCell isHeader={true}>{children}</TableCell>,
          td: ({ children }) => <TableCell isHeader={false}>{children}</TableCell>,

          // Images
          img: ({ src, alt, title }: any) => (
            <ImageBlock src={typeof src === "string" ? src : undefined} alt={alt} title={title} />
          ),

          // Horizontal rule
          hr: () => <hr className="my-4 border-t border-zinc-200" />,

          // Emphasis
          strong: ({ children }) => <strong className="font-bold text-zinc-950">{children}</strong>,
          em: ({ children }) => <em className="italic text-zinc-900 font-medium">{children}</em>,
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};

export const MarkdownRenderer = memo(MarkdownRendererComponent);
