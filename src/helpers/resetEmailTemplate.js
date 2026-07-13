export function resetPasswordTemplate(url) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Reset Your Password</title>
</head>

<body
  style="margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"
>
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background:#0F172A;padding:40px 20px;"
  >
    <tr>
      <td align="center">
        <table
          role="presentation"
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="max-width:600px;width:100%;"
        >
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td
                    style="
                      background:#7A8F3A;
                      padding:10px 16px;
                      border-radius:10px;
                      font-size:24px;
                      font-weight:700;
                      color:#101010;
                      letter-spacing:1px;
                      font-family:Arial,sans-serif;
                    "
                  >
                    DX
                  </td>

                  <td
                    style="
                      padding-left:10px;
                      font-size:24px;
                      font-weight:700;
                      color:#F8FAFC;
                      font-family:Arial,sans-serif;
                    "
                  >
                    App
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td
              style="
                background:#1E293B;
                border:1px solid #334155;
                border-radius:18px;
                padding:48px 40px;
              "
            >
              <!-- Lock -->
              <div
                style="text-align:center;font-size:42px;margin-bottom:20px;"
              >
                🔐
              </div>

              <h1
                style="
                  margin:0;
                  text-align:center;
                  font-size:30px;
                  font-weight:700;
                  color:#F8FAFC;
                  line-height:1.3;
                "
              >
                Reset Your Password
              </h1>

              <p
                style="
                  margin:20px 0 34px;
                  font-size:16px;
                  line-height:28px;
                  color:#CBD5E1;
                  text-align:center;
                "
              >
                We received a request to reset the password for your
                <strong style="color:#FFFFFF;">DX App</strong>
                account.
                <br /><br />
                Click the button below to create a new password. For security
                reasons, this link expires in
                <strong style="color:#FFFFFF;">1 hour</strong>.
              </p>

              <!-- CTA -->
              <table
                role="presentation"
                align="center"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td
                    style="
                      background:#7A8F3A;
                      border-radius:10px;
                    "
                  >
                    <a
                      href="${url}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:16px 34px;
                        font-size:16px;
                        font-weight:700;
                        color:#111827;
                        text-decoration:none;
                        font-family:Arial,sans-serif;
                      "
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr
                style="border:none;border-top:1px solid #334155;margin:40px 0;"
              />

              <!-- Security -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td
                    style="
                      background:#0F172A;
                      border:1px solid #334155;
                      border-radius:10px;
                      padding:18px;
                    "
                  >
                    <p
                      style="
                        margin:0;
                        font-size:14px;
                        line-height:24px;
                        color:#CBD5E1;
                      "
                    >
                      <strong style="color:#FFFFFF;">
                        Didn't request this?
                      </strong>
                      <br /><br />
                      No worries. If you didn't ask to reset your password, you
                      can safely ignore this email. Your account remains secure
                      and your password hasn't changed.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback -->
              <p
                style="
                  margin:36px 0 12px;
                  font-size:13px;
                  font-weight:600;
                  color:#F8FAFC;
                "
              >
                Having trouble with the button?
              </p>

              <p
                style="
                  margin:0;
                  font-size:13px;
                  line-height:22px;
                  color:#94A3B8;
                  word-break:break-word;
                "
              >
                Copy and paste this link into your browser:
              </p>

              <p
                style="
                  margin:12px 0 0;
                  word-break:break-all;
                "
              >
                <a
                  href="${url}"
                  style="
                    color:#7A8F3A;
                    text-decoration:none;
                  "
                >
                  ${url}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding:28px 20px;
                font-size:13px;
                line-height:24px;
                color:#64748B;
              "
            >
              DX App © 2026
              <br /><br />
              This email was sent automatically. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
