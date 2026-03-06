'use client';

interface DonateButtonProps {
  onClick: () => void;
}

export default function DonateButton({ onClick }: DonateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gfm-green hover:bg-gfm-green-dark text-white font-semibold rounded-full py-3.5 px-6 text-lg transition-colors duration-200 shadow-sm hover:shadow-md"
    >
      Donate now
    </button>
  );
}
