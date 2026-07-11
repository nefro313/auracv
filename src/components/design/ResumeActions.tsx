"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { UserProfile } from "@/lib/user.types";

/**
 * Download controls for the resume page. PDF uses the browser's native
 * print-to-PDF (crisp selectable text + clean, native page breaks — the page's
 * print CSS hides everything but the resume). Word builds a .docx from the same
 * profile data. The whole bar is hidden when printing (`print:hidden`).
 */
export default function ResumeActions({ profile }: { profile: UserProfile }) {
  const [docxLoading, setDocxLoading] = useState(false);

  const handleDownloadPdf = () => {
    const name = profile.basics.name?.trim() || "Resume";
    const prevTitle = document.title;
    // The print dialog seeds the suggested PDF filename from document.title.
    document.title = `${name} Resume`;
    const restore = () => {
      document.title = prevTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const handleDownloadDocx = async () => {
    try {
      setDocxLoading(true);
      // Code-split: the docx library only loads when Word is actually clicked.
      const { downloadResumeDocx } = await import("@/lib/resume-docx");
      await downloadResumeDocx(profile);
    } catch (err) {
      console.error("DOCX export failed:", err);
    } finally {
      setDocxLoading(false);
    }
  };

  return (
    <div className="mb-5 flex w-full flex-col items-stretch gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
      {/* Back to the portfolio — the subdomain root. */}
      <Link
        href="/"
        className="group inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink-soft transition duration-300 hover:border-ink/25 hover:text-ink"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        Portfolio
      </Link>

      <p className="text-center text-xs font-medium text-ink-mute sm:text-left">
        Download a copy — PDF opens your print dialog, choose{" "}
        <span className="font-semibold text-ink-soft">Save as PDF</span>.
      </p>

      <div className="flex items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={handleDownloadPdf}
          title="Download as PDF (opens print dialog)"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_24px_-6px_rgba(139,92,246,0.75)]"
        >
          <Download className="size-4" />
          PDF
        </button>

        <button
          type="button"
          onClick={handleDownloadDocx}
          disabled={docxLoading}
          title="Download as an editable Word document"
          className="glass-chip inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink transition duration-300 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {docxLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileText className="size-4" />
          )}
          Word
        </button>
      </div>
    </div>
  );
}
