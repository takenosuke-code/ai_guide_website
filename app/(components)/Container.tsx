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
      className={`container mx-auto w-full max-w-6xl px-8 md:px-12 lg:px-16 xl:px-20 ${className}`}
    >
      {children}
    </div>
  );
}

