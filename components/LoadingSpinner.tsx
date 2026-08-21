// components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#cfe2d5] border-b-[#e7492f]"></div>
    </div>
  );
}
