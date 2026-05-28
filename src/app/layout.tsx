import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import DataDictionShell from "./shell";

export const metadata: Metadata = {
  title: "DataDiction MVP",
  description: "SceneContext Engine MVP workspace",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <DataDictionShell>{children}</DataDictionShell>
      </body>
    </html>
  );
}
