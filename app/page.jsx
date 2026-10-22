import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { featuresData, howItWorksData, statsData } from "@/data/landing";
import HeroSection from "@/components/hero";

function FeatureRow({ feature }) {
  const live = feature.status === "live";
  const body = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:ring-emerald-900">
        {feature.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
          {!live && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
              Coming soon
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
      </div>
      {live && (
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );

  if (!live) {
    return <li className="flex gap-4 rounded-xl p-4 opacity-75">{body}</li>;
  }
  return (
    <li>
      <Link
        href={feature.href}
        className="group flex gap-4 rounded-xl p-4 transition-colors hover:bg-emerald-50/70 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:hover:bg-emerald-950/40"
      >
        {body}
      </Link>
    </li>
  );
}

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <HeroSection />

      {/* Stats strip */}
      <section className="border-y border-emerald-100 bg-emerald-50/60 py-12 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {statsData.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-1 text-3xl font-bold text-emerald-800 dark:text-emerald-300">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features and getting started, side by side */}
      <section id="features" className="py-20">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Features</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">What you can do with Fiscora</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Click any live feature to open it. You&apos;ll be asked to sign in first if you haven&apos;t yet.</p>
            <ul className="mt-6 space-y-1">
              {featuresData.map((feature) => (
                <FeatureRow key={feature.title} feature={feature} />
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Getting started</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Up and running in three steps</h2>
            <ol className="mt-8 space-y-8">
              {howItWorksData.map((step, index) => (
                <li key={step.title} className="relative flex gap-4">
                  {index < howItWorksData.length - 1 && (
                    <span className="absolute left-[21px] top-12 h-[calc(100%-1rem)] w-px bg-emerald-200" aria-hidden="true" />
                  )}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {step.icon}
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/dashboard" className="mt-10 inline-block">
              <Button size="lg" className="bg-emerald-700 px-6 hover:bg-emerald-800">
                Start now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">See where your money really goes</h2>
          <p className="mx-auto mb-8 max-w-2xl text-emerald-50">
            Bring your income, spending, budget and loans into one place, and let Fiscora point out where you can save.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white px-8 text-emerald-800 hover:bg-emerald-50">
              Create your free account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
