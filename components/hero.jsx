"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { ArrowRight, Landmark, MessageSquareText, Target } from "lucide-react";
import { Button } from "./ui/button";

// A small static preview of the app, shown instead of a stock photo.
function AppPreview() {
  return (
    <div className="mx-auto grid max-w-4xl gap-4 rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-2xl shadow-emerald-900/10 md:grid-cols-2 dark:border-emerald-900 dark:bg-zinc-900">
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Target className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> October budget
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          $1,092 <span className="text-base font-normal text-gray-500">of $1,500</span>
        </p>
        <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-zinc-800">
          <div className="h-2 w-[73%] rounded-full bg-emerald-500" />
        </div>
        <p className="mt-2 text-xs text-gray-500">73% used, 12 days left</p>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Landmark className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Car loan
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          $188.71 <span className="text-base font-normal text-gray-500">/ month</span>
        </p>
        <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-zinc-800">
          <div className="h-2 w-[30%] rounded-full bg-teal-600" />
        </div>
        <p className="mt-2 text-xs text-gray-500">18 of 60 payments made, paid off Jan 2030</p>
      </div>

      <div className="rounded-xl bg-emerald-50 p-4 md:col-span-2 dark:bg-emerald-950/50">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-900 dark:text-emerald-200">
          <MessageSquareText className="h-4 w-4" /> AI advisor
        </div>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          &ldquo;Food is 32% of your spending this month. Eating out twice a week instead of four times would save about $120.&rdquo;
        </p>
      </div>
    </div>
  );
}

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const element = imageRef.current;
    const handleScroll = () => {
      if (!element) return;
      if (window.scrollY > 100) element.classList.add("scrolled");
      else element.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="px-4 pb-20 pt-36">
      <div className="container mx-auto text-center">
        <div className="mb-4">
          <p className="inline-block rounded-full bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900">
            Personal finance for students and young professionals
          </p>
        </div>
        <h1 className="gradient-title pb-6 text-5xl md:text-7xl lg:text-8xl">
          Fiscora <br /> Personal Finance
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-400">
          Track what comes in and goes out, scan receipts with AI, plan your loan payments and get advice based on your own spending.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-emerald-700 px-8 hover:bg-emerald-800">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="px-8">
              See what it does
            </Button>
          </Link>
        </div>

        <div className="hero-image-wrapper mt-14">
          <div ref={imageRef} className="hero-image">
            <AppPreview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
