import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  actionOnClick?: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  actionLink,
  actionOnClick,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-[#d8e7dc] bg-white px-6 py-12 text-center shadow-[0_14px_34px_rgba(14,42,35,0.08)]">
      <svg
        className="mx-auto h-12 w-12 text-[#e7492f]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-3 font-serif text-2xl font-semibold text-[#07382d]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[#52685f]">{description}</p>
      {actionText && (actionLink || actionOnClick) && (
        <div className="mt-6">
          {actionLink ? (
            <Link href={actionLink} className="btn-primary inline-flex h-11 items-center justify-center px-5 text-sm font-bold">
              {actionText}
            </Link>
          ) : (
            <button type="button" onClick={actionOnClick} className="btn-primary inline-flex h-11 items-center justify-center px-5 text-sm font-bold">
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
