import { getChatHistory } from "@/actions/advisor";
import { AdvisorChat } from "./_components/advisor-chat";

export const metadata = { title: "AI Advisor | Fiscora" };

export default async function AdvisorPage() {
  const history = await getChatHistory();
  return (
    <div className="px-5 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-5xl gradient-title">AI Advisor</h1>
        <p className="text-muted-foreground mt-2">
          Ask about your own spending. Answers are based on your last 90 days of
          transactions, your budget, accounts and loans.
        </p>
      </div>
      <AdvisorChat initialMessages={history} />
    </div>
  );
}
