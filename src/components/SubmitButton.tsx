"use client";

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SubmitButton({ onClick, disabled }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform md:h-16 md:w-16 ${
        disabled
          ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
          : "bg-black text-white hover:scale-110 active:scale-95"
      }`}
      aria-label={disabled ? "Daily limit reached" : "Submit a question"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6 md:h-7 md:w-7"
      >
        <path
          fillRule="evenodd"
          d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
