"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  AlertCircle,
  PenLine,
  Lightbulb,
  RefreshCw,
  Database,
  Sparkles,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { CopyButton } from "./CopyButton";
import type { ChatAction } from "@/stores/useChatStore";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  actions?: ChatAction[];
}

interface MessageRendererProps {
  message: Message;
  onCopy?: (content: string) => void;
  onActionClick?: (action: ChatAction, messageId?: string) => void;
  isAiEditing?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackText: string },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("MessageRenderer error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
          <div className="flex items-center gap-1.5 font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to render formatted message</span>
          </div>
          <p className="font-mono text-[11px] text-rose-200/80 whitespace-pre-wrap">
            {this.props.fallbackText}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const MessageRendererComponent: React.FC<MessageRendererProps> = ({
  message,
  onActionClick,
  isAiEditing = false,
  className = "",
}) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2.5 w-full min-w-0 my-2 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } ${className}`}
    >
      {/* Role Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isUser
            ? "bg-white border border-zinc-200 text-zinc-700 shadow-xs"
            : "bg-[#e15b39]/12 text-[#e15b39]"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble Container */}
      <div className={`group relative min-w-0 max-w-[88%] sm:max-w-[85%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-3.5 py-3 rounded-xl transition-all min-w-0 max-w-full overflow-hidden wrap-break-word ${
            isUser
              ? "bg-[#e15b39]/10 border border-[#e15b39]/25 text-zinc-900 shadow-xs"
              : "bg-[#f7f6f2] border border-zinc-200/90 text-zinc-900 shadow-xs"
          }`}
        >
          {/* Top Quick Actions (Copy) */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <CopyButton content={message.content} />
          </div>

          {/* Render Body */}
          {isUser ? (
            <p className="text-xs sm:text-[13px] whitespace-pre-wrap leading-relaxed text-zinc-900 font-sans">
              {message.content}
            </p>
          ) : (
            <ComponentErrorBoundary fallbackText={message.content}>
              <div className="text-xs sm:text-[13px] leading-relaxed text-zinc-900 font-sans">
                <MarkdownRenderer content={message.content} />
              </div>
            </ComponentErrorBoundary>
          )}

          {/* Interactive Action Buttons */}
          {!isUser && message.actions && message.actions.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-3 pt-2.5 border-t border-zinc-200/80 w-full">
              {message.actions.map((act) => {
                const isPrimary = act.variant === "primary" || !act.variant;

                const renderIcon = () => {
                  const iconProps = { className: "w-3 h-3 shrink-0" };
                  switch (act.icon) {
                    case "edit":
                      return <PenLine {...iconProps} />;
                    case "brainstorm":
                      return <Lightbulb {...iconProps} />;
                    case "sync":
                      return <RefreshCw {...iconProps} />;
                    case "database":
                      return <Database {...iconProps} />;
                    case "diagram":
                      return <GitBranch {...iconProps} />;
                    case "sparkles":
                    default:
                      return <Sparkles {...iconProps} />;
                  }
                };

                return (
                  <button
                    key={act.id}
                    type="button"
                    disabled={isAiEditing}
                    onClick={() => onActionClick?.(act, message.id)}
                    className={`group/btn relative w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-md text-[11px] font-semibold transition-all duration-150 active:scale-[0.98] select-none ${
                      isAiEditing
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:shadow-xs"
                    } ${
                      isPrimary
                        ? "bg-[#e15b39]/12 hover:bg-[#e15b39]/20 text-[#e15b39] border border-[#e15b39]/25"
                        : "bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {renderIcon()}
                      <span>{act.label}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all duration-150 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Streaming Dot Indicator */}
          {message.isStreaming && (
            <div className="inline-flex items-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e15b39] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#e15b39]/80 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#e15b39]/50 animate-bounce [animation-delay:300ms]" />
            </div>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[10px] text-zinc-400 mt-1 px-1 font-sans">
            {message.timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export const MessageRenderer = memo(MessageRendererComponent);
