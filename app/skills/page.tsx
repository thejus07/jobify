"use client";

import React, { useState, useEffect } from "react";
import { Code2, ArrowRight } from "lucide-react";

export default function SkillsPage() {
  const commonSkills = [
    { name: "Python", category: "Language", description: "Data science, AI/ML backend, automation & scripting" },
    { name: "TypeScript", category: "Language", description: "Type-safe modern web applications and backend APIs" },
    { name: "React", category: "Frontend", description: "Interactive user interfaces and responsive web apps" },
    { name: "Next.js", category: "Full Stack", description: "Server-side rendering, routing, and modern web frameworks" },
    { name: "Node.js", category: "Backend", description: "High-throughput asynchronous servers and event-driven architecture" },
    { name: "Go", category: "Backend & Systems", description: "Concurrent systems, microservices, and distributed cloud tools" },
    { name: "SQL", category: "Database", description: "Relational query optimization, data modeling, and PostgreSQL" },
    { name: "Docker", category: "DevOps & Cloud", description: "Containerization, reproducible deployment, and microservices" },
    { name: "AWS", category: "Cloud", description: "Amazon Web Services: S3, Lambda, EC2, DynamoDB" },
    { name: "Machine Learning", category: "AI", description: "Deep learning, NLP, computer vision, and predictive models" },
    { name: "Figma", category: "Design", description: "Product design, prototyping, design systems, and UX research" },
    { name: "Kubernetes", category: "DevOps", description: "Container orchestration, cluster scaling, and reliability" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Code2 className="h-4 w-4" />
          <span>Skills & Disciplines</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">In-Demand Tech Skills</h1>
        <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
          Browse opportunities classified by core programming languages, frameworks, cloud tools, and engineering specializations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commonSkills.map((skill) => (
          <a
            key={skill.name}
            href={`/jobs?skill=${encodeURIComponent(skill.name)}`}
            className="card-hover group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                  {skill.category}
                </span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                  Verified Roles
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mt-2">
                {skill.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{skill.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Explore Roles</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
