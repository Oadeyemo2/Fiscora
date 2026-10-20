"use server";

// UC-7 Manage Categories
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/get-db-user";
import { defaultCategories } from "@/data/categories";

// Default categories (from data/categories.js) plus the user's own,
// in the same shape so the transaction form can use either.
export async function getCategories() {
  const user = await getDbUser();
  const custom = await db.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return [
    ...defaultCategories.map((c) => ({ ...c, isDefault: true })),
    // Transactions store the category as text. For custom categories that
    // text is the name, so existing tables and charts show it readably.
    ...custom.map((c) => ({
      id: c.name,
      dbId: c.id,
      name: c.name,
      type: c.type,
      color: c.color,
      isDefault: false,
    })),
  ];
}

export async function createCategory(data) {
  try {
    const user = await getDbUser();
    const name = String(data.name || "").trim();
    const type = data.type;

    if (!name) throw new Error("Category name is required.");
    if (name.length > 40) throw new Error("Keep the name under 40 characters.");
    if (!["INCOME", "EXPENSE"].includes(type)) throw new Error("Choose income or expense.");

    const clashesWithDefault = defaultCategories.some(
      (c) => c.type === type && c.name.toLowerCase() === name.toLowerCase()
    );
    if (clashesWithDefault) throw new Error(`"${name}" is already a default category.`);

    const existing = await db.category.findFirst({
      where: { userId: user.id, type, name: { equals: name, mode: "insensitive" } },
    });
    if (existing) throw new Error(`You already have a category called "${name}".`);

    const category = await db.category.create({
      data: { name, type, color: data.color || "#64748b", userId: user.id },
    });

    revalidatePath("/categories");
    revalidatePath("/transaction/create");
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id) {
  try {
    const user = await getDbUser();
    const category = await db.category.findFirst({ where: { id, userId: user.id } });
    if (!category) throw new Error("Category not found (default categories can't be deleted).");

    // Transactions reference custom categories by name, so check before deleting
    const inUse = await db.transaction.count({
      where: { userId: user.id, category: category.name },
    });
    if (inUse > 0)
      throw new Error(`${inUse} transaction(s) still use "${category.name}". Reassign them first.`);

    await db.category.delete({ where: { id: category.id } });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
