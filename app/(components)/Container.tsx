import { ReactNode } from "react";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`container mx-auto w-full max-w-[1400px] px-3 md:px-4 lg:px-5 ${className}`}
    >
      {children}
    </div>
  );
}

