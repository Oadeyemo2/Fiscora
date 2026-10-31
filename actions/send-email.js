// UC-10 Email Notifications: sends one email through Resend.
// Deliberately NOT a "use server" file: only other server code may send
// emails, never the browser.
import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  if (!process.env.RESEND_API_KEY) {
    console.error("Failed to send email: RESEND_API_KEY is not set");
    return { success: false, error: "RESEND_API_KEY is not set" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Resend reports problems in `error` instead of throwing
    const { data, error } = await resend.emails.send({
      from: "Fiscora <onboarding@resend.dev>",
      to,
      subject,
      react,
    });
    if (error) {
      console.error("Failed to send email:", error.message || error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
