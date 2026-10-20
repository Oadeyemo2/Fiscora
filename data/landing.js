import {
  LayoutDashboard,
  Target,
  Wallet,
  Landmark,
  MessageSquareText,
  Tags,
  BellRing,
  Trophy,
  SunMoon,
  UserPlus,
  ArrowDownUp,
  Sparkles,
} from "lucide-react";
import { ReceiptScanIcon } from "@/components/feature-icons";

const iconClass = "h-6 w-6 text-emerald-700";

// Stats strip under the hero
export const statsData = [
  { value: "Free", label: "No subscription or card needed" },
  { value: "2 AI tools", label: "Receipt scanner and money advisor" },
  { value: "8", label: "Features you can use today" },
  { value: "1 place", label: "Accounts, budget and loans together" },
];

// Features. Live ones link to their page; planned ones are shown but not clickable.
export const featuresData = [
  {
    icon: <LayoutDashboard className={iconClass} />,
    title: "Money at a glance",
    description: "Income, spending and every account balance on one dashboard, with a chart of where this month went.",
    href: "/dashboard",
    status: "live",
  },
  {
    icon: <ReceiptScanIcon className={iconClass} />,
    title: "Snap-to-log receipts",
    description: "Take a photo of a receipt and the amount, date, store and category fill themselves in.",
    href: "/transaction/create",
    status: "live",
  },
  {
    icon: <Target className={iconClass} />,
    title: "Monthly budget",
    description: "Pick a spending limit and watch the bar fill up. You get an email when you reach 80%.",
    href: "/dashboard",
    status: "live",
  },
  {
    icon: <Wallet className={iconClass} />,
    title: "All your accounts",
    description: "Checking and savings side by side, each with its own balance and history.",
    href: "/dashboard",
    status: "live",
  },
  {
    icon: <Landmark className={iconClass} />,
    title: "Loan planner",
    description: "Log a student, car or personal loan and see the monthly payment, total interest and payoff date.",
    href: "/loans",
    status: "live",
  },
  {
    icon: <MessageSquareText className={iconClass} />,
    title: "Ask the AI advisor",
    description: "Ask about your money in plain words. Answers come from your own last 90 days, not generic tips.",
    href: "/advisor",
    status: "live",
  },
  {
    icon: <Tags className={iconClass} />,
    title: "Your own categories",
    description: "Add categories like Textbooks or Tutoring next to the built-in ones.",
    href: "/categories",
    status: "live",
  },
  {
    icon: <BellRing className={iconClass} />,
    title: "Alerts that matter",
    description: "Budget warnings and loan updates, kept in one inbox inside the app.",
    href: "/notifications",
    status: "live",
  },
  {
    icon: <Trophy className={iconClass} />,
    title: "Rewards for good habits",
    description: "Earn badges for staying on budget and paying loans on time.",
    status: "soon",
  },
  {
    icon: <SunMoon className={iconClass} />,
    title: "Light and dark mode",
    description: "Switch the whole app to a darker look that is easier on the eyes at night.",
    status: "soon",
  },
];

// Getting started steps
export const howItWorksData = [
  {
    icon: <UserPlus className={iconClass} />,
    title: "Create your account",
    description: "Sign up with your email and confirm it with the 6-digit code we send you.",
  },
  {
    icon: <ArrowDownUp className={iconClass} />,
    title: "Add your money",
    description: "Add an account, then log income and expenses by typing them or scanning a receipt.",
  },
  {
    icon: <Sparkles className={iconClass} />,
    title: "Plan ahead",
    description: "Set a budget, map out your loans and ask the AI advisor where you can save.",
  },
];
