"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  /** Label used in the fallback and in the console log. */
  label: string;
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Isolates each generated component: if one throws while rendering, only
 * that block is replaced by a small notice — the rest of the page survives.
 */
export default class ComponentErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[adaptive] "${this.props.label}" failed to render:`, error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-300"
        >
          <AlertTriangle size={14} className="shrink-0" />
          This “{this.props.label}” block couldn’t be displayed.
        </div>
      );
    }
    return this.props.children;
  }
}
