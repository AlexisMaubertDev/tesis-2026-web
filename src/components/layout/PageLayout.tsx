import { type JSX } from "react";

export default function PageLayout({ children }: { children: JSX.Element }) {
  return (
    <main
      className="font-sans flex flex-col min-h-screen
    justify-center items-center bg-san-marino-200 text-zinc-100"
    >
      {children}
    </main>
  );
}
