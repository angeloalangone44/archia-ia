"use client";

import { ReactNode } from "react";

type Props = {
  onSubmit: () => void;
  isLoading: boolean;
  buttonLabel: string;
  children: ReactNode;
  warning?: ReactNode;
};

export function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">{children}</div>
  );
}

export function FormGroup({
  label,
  required,
  full,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5${full ? " col-span-2" : ""}`}>
      <label
        className="text-xs font-medium"
        style={{ color: "var(--ink2)" }}
      >
        {label}{" "}
        {required && (
          <span style={{ color: "var(--gold)" }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

export function SectionDivider({ children }: { children: ReactNode }) {
  return (
    <div
      className="col-span-2 text-[11px] font-medium uppercase tracking-wider pt-5 pb-3 mt-2"
      style={{
        color: "var(--ink3)",
        borderTop: "0.5px solid var(--border)",
      }}
    >
      {children}
    </div>
  );
}

const inputClass =
  "w-full text-[13px] rounded-[10px] px-3 py-2.5 outline-none transition-colors resize-y";
const inputStyle = {
  background: "var(--surface)",
  border: "0.5px solid var(--border-strong)",
  color: "var(--ink)",
  fontFamily: "'DM Sans', sans-serif",
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={inputClass}
      style={{ ...inputStyle, ...props.style }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = (props.style as React.CSSProperties | undefined)?.borderColor ?? "rgba(26,24,20,0.18)";
        props.onBlur?.(e);
      }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={inputClass + " cursor-pointer appearance-none"}
      style={{ ...inputStyle, ...props.style }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = (props.style as React.CSSProperties | undefined)?.borderColor ?? "rgba(26,24,20,0.18)";
        props.onBlur?.(e);
      }}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={inputClass}
      style={{ ...inputStyle, minHeight: 80, ...props.style }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = (props.style as React.CSSProperties | undefined)?.borderColor ?? "rgba(26,24,20,0.18)";
        props.onBlur?.(e);
      }}
    />
  );
}

export default function DocumentForm({
  onSubmit,
  isLoading,
  buttonLabel,
  children,
  warning,
}: Props) {
  return (
    <div>
      {children}
      {warning && <div className="mb-4">{warning}</div>}
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="flex items-center gap-2 text-white rounded-[10px] px-6 py-3 text-sm font-medium transition-opacity mt-2"
        style={{
          background: "var(--accent)",
          opacity: isLoading ? 0.5 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {isLoading ? (
          <>
            <span
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
              style={{ flexShrink: 0 }}
            />
            Gerando...
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {buttonLabel}
          </>
        )}
      </button>
    </div>
  );
}
