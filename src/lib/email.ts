import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM || "Rederij Cascade <noreply@varenbijcascade.com>";
const dashboardUrl = process.env.AUTH_URL || "https://dashboard.varenbijcascade.com";

function getResend() {
  if (!resend) throw new Error("RESEND_API_KEY is niet geconfigureerd");
  return resend;
}

export async function sendInviteEmail(email: string, name: string, token: string) {
  const link = `${dashboardUrl}/invite?token=${token}`;

  await getResend().emails.send({
    from,
    to: email,
    subject: "Welkom bij Cascade — Stel je wachtwoord in",
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #092D61; font-size: 24px; margin: 0;">Rederij Cascade</h1>
        </div>
        <p style="color: #092D61; font-size: 16px;">Hoi ${name || "daar"},</p>
        <p style="color: #49648A; font-size: 14px; line-height: 1.6;">
          Je bent uitgenodigd voor de Cascade beheeromgeving. Klik op de knop hieronder om je wachtwoord in te stellen.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="background: #B49253; color: white; padding: 14px 32px; border-radius: 2em; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Wachtwoord instellen
          </a>
        </div>
        <p style="color: #9A8F79; font-size: 12px;">Deze link is 48 uur geldig.</p>
        <hr style="border: none; border-top: 1px solid #EDECEA; margin: 24px 0;" />
        <p style="color: #9A8F79; font-size: 12px; text-align: center;">Rederij Cascade</p>
      </div>
    `,
  });
}
