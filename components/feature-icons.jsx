// Custom icons drawn in the same style as lucide-react (24x24, 2px stroke).

// A receipt with a magnifying glass over it, for the AI receipt scanner.
export function ReceiptScanIcon({ className = "", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* receipt with a torn bottom edge */}
      <path d="M5 2h11v9" />
      <path d="M5 2v19l2-1.5 2 1.5 2-1.5" />
      <path d="M8 6.5h5" />
      <path d="M8 10h3" />
      {/* magnifying glass */}
      <circle cx="16.5" cy="15.5" r="3.5" />
      <path d="m19 18 3 3" />
    </svg>
  );
}
