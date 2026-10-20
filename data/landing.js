
import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Landmark,
  Zap,
} from "lucide-react";

// Stats Data
export const statsData = [
  { value: "15", label: "Planned features" },
  { value: "2", label: "AI features: receipt scanner and advisor" },
  { value: "8", label: "Database tables" },
  { value: "$0", label: "Cost to use" },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Spending Overview",
    description: "See this month's income, expenses and budget on one dashboard, with a chart of where the money went.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "AI Receipt Scanner",
    description: "Snap a receipt and the amount, date, store and category are filled in for you.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Set a monthly budget, watch your progress and get an alert when you reach 80%.",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Keep checking and savings accounts side by side, each with its own balance and history.",
  },
  {
    icon: <Landmark className="h-8 w-8 text-blue-600" />,
    title: "Loan Tracking",
    description: "Log student, auto or personal loans and see the monthly payment, total interest and payoff date.",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "AI Financial Advisor",
    description: "Ask questions about your money and get answers based on your own recent spending.",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Get Insights",
    description:
      "Receive AI-powered insights and recommendations to optimize your finances",
  },
];


