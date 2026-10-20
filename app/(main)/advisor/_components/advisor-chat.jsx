"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bot, Loader2, Send, Trash2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAdvisor, clearChatHistory } from "@/actions/advisor";

const STARTERS = [
  "Where can I cut spending this month?",
  "Am I on track with my budget?",
  "How should I prioritize my loan payments?",
  "What is my biggest expense category?",
];

export function AdvisorChat({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text) => {
    const q = (text ?? question).trim();
    if (!q || thinking) return;
    setQuestion("");
    // Show the question right away; the server saves it too
    const temp = { id: `temp-${Date.now()}`, role: "USER", content: q };
    setMessages((m) => [...m, temp]);
    setThinking(true);

    const res = await askAdvisor(q);
    setThinking(false);

    if (res.success) {
      setMessages((m) => [...m.filter((x) => x.id !== temp.id), res.data.question, res.data.reply]);
    } else {
      toast.error(res.error);
    }
  };

  const clear = async () => {
    if (!confirm("Clear the whole chat history?")) return;
    await clearChatHistory();
    setMessages([]);
    toast.success("Chat history cleared");
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="h-[28rem] overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && !thinking && (
            <div className="text-center text-muted-foreground pt-10 space-y-4">
              <Bot className="h-10 w-10 mx-auto" />
              <p>Pick a starter question or type your own.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "USER" ? "justify-end" : ""}`}>
              {m.role === "ASSISTANT" && <Bot className="h-6 w-6 shrink-0 text-purple-600" />}
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap text-sm ${
                  m.role === "USER" ? "bg-blue-600 text-white" : "bg-muted"
                }`}
              >
                {m.content}
              </div>
              {m.role === "USER" && <User className="h-6 w-6 shrink-0 text-blue-600" />}
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3 items-center text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin" /> Looking at your numbers...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your money..."
            maxLength={500}
            disabled={thinking}
          />
          <Button type="submit" disabled={thinking || !question.trim()}>
            <Send className="h-4 w-4" />
          </Button>
          {messages.length > 0 && (
            <Button type="button" variant="ghost" onClick={clear} title="Clear history">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </form>
        <p className="text-xs text-muted-foreground">
          Advice is informational only and is not professional financial advice.
        </p>
      </CardContent>
    </Card>
  );
}
