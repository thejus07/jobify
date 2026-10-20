import React, { Suspense } from "react";
import ResumeStudioContent from "./ResumeStudioContent";

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading AI Resume Studio...</div>}>
      <ResumeStudioContent />
    </Suspense>
  );
}
