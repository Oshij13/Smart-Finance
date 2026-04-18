import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`w-full px-6 lg:px-10 py-12 space-y-12 ${className}`}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-left">
          {title}
        </h1>
      </div>
      {description && (
        <p className="text-sm text-gray-500 max-w-xl font-medium text-left">
          {description}
        </p>
      )}
    </header>
  );
}

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  className?: string;
}

export function Section({ children, title, eyebrow, className = "" }: SectionProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      {(title || eyebrow) && (
        <div className="space-y-1">
          {eyebrow && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">
              {title}
            </h2>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
