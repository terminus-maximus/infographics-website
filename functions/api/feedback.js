const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const cleanString = (value) => (typeof value === "string" ? value.trim() : "");

const formatOptionalValue = (value) => value || "Not provided";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Feedback can only be submitted with POST." }, 405);
  }

  if (!env.RESEND_API_KEY || !env.FEEDBACK_TO_EMAIL || !env.FEEDBACK_FROM_EMAIL || !env.TURNSTILE_SECRET_KEY) {
    return jsonResponse({ success: false, error: "Feedback is not configured yet." }, 500);
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Please submit valid feedback data." }, 400);
  }

  const subject = cleanString(payload.subject);
  const feedback = cleanString(payload.feedback);
  const discordName = cleanString(payload.discordName);
  const replyEmail = cleanString(payload.replyEmail);
  const pageUrl = cleanString(payload.pageUrl);
  const turnstileToken = cleanString(payload.turnstileToken);

  if (!subject || !feedback) {
    return jsonResponse({ success: false, error: "Subject and feedback are required." }, 400);
  }

  if (replyEmail && !isValidEmail(replyEmail)) {
    return jsonResponse({ success: false, error: "Please enter a valid reply email, or leave it blank." }, 400);
  }

  if (!turnstileToken) {
    return jsonResponse({ success: false, error: "Please complete the verification challenge." }, 400);
  }

  const turnstileBody = new FormData();
  turnstileBody.append("secret", env.TURNSTILE_SECRET_KEY);
  turnstileBody.append("response", turnstileToken);

  const connectingIp = request.headers.get("CF-Connecting-IP");
  if (connectingIp) {
    turnstileBody.append("remoteip", connectingIp);
  }

  let turnstileResult;

  try {
    const turnstileResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: turnstileBody,
    });

    turnstileResult = await turnstileResponse.json();
  } catch {
    return jsonResponse({ success: false, error: "Verification failed. Please try again." }, 502);
  }

  if (!turnstileResult.success) {
    return jsonResponse({ success: false, error: "Verification failed. Please try again." }, 400);
  }

  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const emailSubject = `[Terminus Maximus Feedback] ${subject}`;
  const emailText = [
    `Subject: ${subject}`,
    "",
    "Feedback:",
    feedback,
    "",
    `Discord name: ${formatOptionalValue(discordName)}`,
    `Reply email: ${formatOptionalValue(replyEmail)}`,
    `Submitted page URL: ${formatOptionalValue(pageUrl)}`,
    `Timestamp: ${timestamp}`,
    `User agent: ${userAgent}`,
  ].join("\n");

  const emailPayload = {
    from: env.FEEDBACK_FROM_EMAIL,
    to: [env.FEEDBACK_TO_EMAIL],
    subject: emailSubject,
    text: emailText,
  };

  if (replyEmail) {
    emailPayload.reply_to = replyEmail;
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      return jsonResponse({ success: false, error: "Feedback could not be sent. Please try again later." }, 502);
    }
  } catch {
    return jsonResponse({ success: false, error: "Feedback could not be sent. Please try again later." }, 502);
  }

  return jsonResponse({ success: true, message: "Feedback sent. Thank you!" });
}
