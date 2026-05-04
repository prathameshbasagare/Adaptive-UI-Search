// File: ./src/contexts/ModalContext.tsx

"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ModalState {
  title: string;
  body: ReactNode;
}

interface ModalContextValue {
  openModal: (title: string, body: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modal, setModal] = useState<ModalState | null>(null);

  const openModal = useCallback((title: string, body: ReactNode) => {
    setModal({ title, body });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modal && <ModalOverlay title={modal.title} body={modal.body} onClose={closeModal} />}
    </ModalContext.Provider>
  );
}

function ModalOverlay({ title, body, onClose }: { title: string; body: ReactNode; onClose: () => void }) {
  // Close on Escape key
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onKeyDown={handleKey}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col animate-fadeIn"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="font-semibold text-slate-950 dark:text-white text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 scrollbar-thin">
          {body}
        </div>
      </div>
    </div>
  );
}
