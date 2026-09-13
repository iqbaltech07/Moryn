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
  onActionClick?: (action: ChatAction) => void;
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
      className={`flex items-start gap-3 w-full min-w-0 my-2 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } ${className}`}
    >
      {/* Role Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all ${
          isUser
            ? "bg-linear-to-br from-indigo-500 to-indigo-700 text-white border border-indigo-400/30"
            : "bg-linear-to-br from-purple-900/60 to-indigo-900/60 text-purple-300 border border-purple-500/30"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-purple-300" />}
      </div>

      {/* Bubble Container */}
      <div className={`group relative min-w-0 max-w-[85%] sm:max-w-[82%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all min-w-0 max-w-full overflow-hidden wrap-break-word ${
            isUser
              ? "rounded-tr-xs bg-linear-to-br from-indigo-600/30 via-indigo-700/25 to-indigo-900/30 border border-indigo-500/40 text-slate-100"
              : "rounded-tl-xs bg-[#121318]/80 border border-slate-800/90 text-slate-200"
          }`}
        >
          {/* Top Quick Actions (Copy) */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <CopyButton content={message.content} />
          </div>

          {/* Render Body */}
          {isUser ? (
            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-slate-100">
              {message.content}
            </p>
          ) : (
            <ComponentErrorBoundary fallbackText={message.content}>
              <MarkdownRenderer content={message.content} />
            </ComponentErrorBoundary>
          )}

          {/* Interactive Action Buttons */}
          {!isUser && message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80 w-full">
              {message.actions.map((act) => {
                const isPrimary = act.variant === "primary";
                const isOutline = act.variant === "outline";

                const renderIcon = () => {
                  const iconProps = { className: "w-3.5 h-3.5 shrink-0" };
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
                    onClick={() => onActionClick?.(act)}
                    className={`group/btn relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.98] select-none ${
                      isAiEditing
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:shadow-md"
                    } ${
                      isPrimary
                        ? "bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-xs shadow-orange-500/20 border border-orange-400/40"
                        : isOutline
                        ? "bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 hover:border-cyan-400/60"
                        : "bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80"
                    }`}
                  >
                    {renderIcon()}
                    <span>{act.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all duration-150 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Streaming Dot Indicator */}
          {message.isStreaming && (
            <div className="inline-flex items-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
            </div>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
            {message.timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export const MessageRenderer = memo(MessageRendererComponent);
