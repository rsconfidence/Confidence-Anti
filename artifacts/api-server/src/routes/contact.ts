import { Router, type IRouter } from "express";
import { db, contactSubmissionsTable, newsletterSubscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitContactBody, SubscribeBody } from "@workspace/api-zod";
import nodemailer from "nodemailer";

const router: IRouter = Router();

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendContactEmail(name: string, email: string, message: string, budget?: string | null, timeline?: string | null) {
  const transporter = createTransport();

  const html = `
    <div style="font-family: monospace; background: #0d1117; color: #e6edf3; padding: 32px; border-radius: 8px; max-width: 600px;">
      <div style="border-bottom: 1px solid #30363d; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #2dba6a; margin: 0; font-size: 18px;">📩 New Project Request</h2>
        <p style="color: #7d8590; margin: 4px 0 0; font-size: 13px;">Someone reached out via your portfolio</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #7d8590; font-size: 13px; width: 100px;">Name</td>
          <td style="padding: 8px 0; color: #e6edf3; font-size: 14px; font-weight: bold;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #7d8590; font-size: 13px;">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2dba6a; font-size: 14px;">${email}</a></td>
        </tr>
        ${budget ? `<tr>
          <td style="padding: 8px 0; color: #7d8590; font-size: 13px;">Budget</td>
          <td style="padding: 8px 0; color: #e6edf3; font-size: 14px;">${budget}</td>
        </tr>` : ""}
        ${timeline ? `<tr>
          <td style="padding: 8px 0; color: #7d8590; font-size: 13px;">Timeline</td>
          <td style="padding: 8px 0; color: #e6edf3; font-size: 14px;">${timeline}</td>
        </tr>` : ""}
      </table>

      <div style="margin-top: 24px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;">
        <p style="color: #7d8590; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
        <p style="color: #e6edf3; font-size: 14px; line-height: 1.6; margin: 0;">${message.replace(/\n/g, "<br>")}</p>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${email}?subject=Re: Your project inquiry" style="background: #2dba6a; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: bold;">Reply to ${name}</a>
      </div>

      <p style="color: #7d8590; font-size: 12px; text-align: center; margin-top: 24px;">
        &lt; confidence.anti /&gt; · Portfolio Admin
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `🚀 New Project Request from ${name}`,
    html,
    text: `New project request from ${name} (${email})\n\n${budget ? `Budget: ${budget}\n` : ""}${timeline ? `Timeline: ${timeline}\n` : ""}\nMessage:\n${message}`,
  });
}

router.post("/contact", async (req, res) => {
  const body = SubmitContactBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body", details: body.error.issues });
    return;
  }

  const { name, email, message, budget, timeline } = body.data;

  await db.insert(contactSubmissionsTable).values({
    name,
    email,
    message,
    budget: budget ?? null,
    timeline: timeline ?? null,
  });

  // Send email notification — non-blocking so DB save always succeeds
  sendContactEmail(name, email, message, budget, timeline).catch((err) => {
    console.error("[contact] Failed to send email notification:", err.message);
  });

  res.status(201).json({ success: true, message: "Your message has been received. I'll get back to you soon!" });
});

router.get("/contact/submissions", async (_req, res) => {
  const rows = await db.select().from(contactSubmissionsTable);
  const result = rows.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    message: s.message,
    budget: s.budget,
    timeline: s.timeline,
    readStatus: s.readStatus,
    respondedAt: s.respondedAt ? s.respondedAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/newsletter/subscribe", async (req, res) => {
  const body = SubscribeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { email, name } = body.data;

  const [existing] = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, email))
    .limit(1);

  if (existing && !existing.unsubscribedAt) {
    res.status(409).json({ success: false, message: "You're already subscribed!" });
    return;
  }

  if (existing && existing.unsubscribedAt) {
    await db
      .update(newsletterSubscribersTable)
      .set({ unsubscribedAt: null, name: name ?? existing.name })
      .where(eq(newsletterSubscribersTable.id, existing.id));
  } else {
    await db.insert(newsletterSubscribersTable).values({ email, name: name ?? null });
  }

  res.status(201).json({ success: true, message: "Welcome aboard! You're now subscribed." });
});

export default router;
