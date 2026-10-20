import React, { Suspense } from "react";
import JobsContent from "./JobsContent";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading jobs directory...</div>}>
      <JobsContent />
    </Suspense>
  );
}
