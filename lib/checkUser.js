import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

// Emails listed in ADMIN_EMAILS (comma separated, set in Vercel) are made
// admins when they sign in. Admins can also promote other users from /admin.
function isListedAdmin(email) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

// Makes sure the signed-in Clerk user has a row in the users table and
// returns that row.
export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const email = user.emailAddresses[0].emailAddress;
    const listedAdmin = isListedAdmin(email);

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      if (listedAdmin && loggedInUser.role !== "ADMIN") {
        return db.user.update({
          where: { id: loggedInUser.id },
          data: { role: "ADMIN" },
        });
      }
      return loggedInUser;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

    // Same email, new Clerk account (for example the person deleted their
    // Clerk account and signed up again): link the existing row to it.
    const sameEmail = await db.user.findUnique({ where: { email } });
    if (sameEmail) {
      return db.user.update({
        where: { id: sameEmail.id },
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          ...(listedAdmin ? { role: "ADMIN" } : {}),
        },
      });
    }

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
        role: listedAdmin ? "ADMIN" : "CLIENT",
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
