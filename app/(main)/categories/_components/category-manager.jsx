"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createCategory, deleteCategory } from "@/actions/category";

export function CategoryManager({ categories }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [color, setColor] = useState("#0ea5e9");
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await createCategory({ name, type, color });
    setBusy(false);
    if (res.success) {
      toast.success(`Added "${res.data.name}"`);
      setName("");
      router.refresh();
    } else toast.error(res.error);
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const res = await deleteCategory(c.dbId);
    if (res.success) {
      toast.success("Category deleted");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="flex flex-wrap gap-3 items-center">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Textbooks"
              className="w-56"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 rounded-md border px-3 text-sm bg-transparent"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 rounded border"
              aria-label="Colour"
            />
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {["INCOME", "EXPENSE"].map((t) => (
        <Card key={t}>
          <CardHeader>
            <CardTitle>{t === "INCOME" ? "Income" : "Expense"} categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.type === t)
              .map((c) => (
                <span
                  key={c.dbId || c.id}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                  {c.isDefault ? (
                    <Badge variant="secondary" className="text-[10px]">default</Badge>
                  ) : (
                    <button onClick={() => remove(c)} aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  )}
                </span>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
