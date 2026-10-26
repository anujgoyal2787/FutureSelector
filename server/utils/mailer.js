const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer Transporter
 * Supports Gmail SMTP using App Password or generic SMTP server
 */
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  // If host is custom (e.g. Zoho, Hostinger, AWS SES)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
      auth: { user, pass }
    });
  }

  // Default: Gmail SMTP service
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
}

/**
 * Send Email Notification on ₹11 Counseling Booking Confirmation
 * Dispatches:
 * 1. Admin Alert Email (To Platform Coordinator / Admin)
 * 2. Student Confirmation Pass (To Student if email is provided)
 */
async function sendCounsellingBookingNotification(booking) {
  const transporter = getTransporter();
  const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USER || "advisory@futureselector.in";
  const adminRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || "admin@futureselector.in";

  if (!transporter) {
    console.warn("ℹ️ [MAILER NOTICE]: SMTP_USER and SMTP_PASS are not configured in environment variables. Email dispatch skipped.");
    console.log(`📋 [COUNSELLING NOTIFICATION SUMMARY]:
    Booking: ${booking.bookingId}
    Student: ${booking.studentName} (${booking.phone}, ${booking.email || "No email"})
    Exam: ${booking.targetExam} | City: ${booking.city || "Kota"}
    Slot: ${booking.date} (${booking.slotTime})
    Mentor: ${booking.counsellorName}
    Mode: ${booking.callMode || "Direct Phone Call"}
    Razorpay Payment: ${booking.razorpayPaymentId || "Verified ₹11"}`);
    return { success: false, reason: "SMTP credentials not configured" };
  }

  const results = { adminSent: false, studentSent: false };

  // =========================================================================
  // 1. ADMIN ALERT EMAIL
  // =========================================================================
  try {
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #124B38 0%, #0d3527 100%); padding: 24px; color: #ffffff; }
          .badge { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
          .title { font-size: 20px; font-weight: 800; margin: 10px 0 4px 0; }
          .body { padding: 24px; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .info-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .info-table td.label { font-weight: 700; color: #64748b; width: 38%; }
          .info-table td.value { font-weight: 600; color: #0f172a; }
          .paid-tag { background: #dcfce7; color: #15803d; font-weight: 800; padding: 4px 8px; border-radius: 6px; font-size: 12px; display: inline-block; }
          .notes-box { background: #f8fafc; border-left: 4px solid #124B38; padding: 12px 16px; margin-top: 16px; border-radius: 0 8px 8px 0; font-size: 13px; font-style: italic; color: #334155; }
          .footer { background: #f8fafc; padding: 16px 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">🔔 New Counseling Booking</span>
            <div class="title">1-on-1 Academic Advisory Booked</div>
            <div style="font-size: 13px; opacity: 0.9;">Booking Ref: <strong>#${booking.bookingId}</strong> • ₹11 Token Verified</div>
          </div>
          <div class="body">
            <p style="font-size: 14px; margin-top: 0;">A student has booked a counseling session. Please review their details and prepare the counselor:</p>
            
            <table class="info-table">
              <tr>
                <td class="label">Student Name:</td>
                <td class="value"><strong>${booking.studentName}</strong></td>
              </tr>
              <tr>
                <td class="label">Mobile Number:</td>
                <td class="value"><a href="tel:${booking.phone}" style="color: #124B38; text-decoration: none; font-weight: 700;">${booking.phone}</a> (<a href="https://wa.me/${booking.phone.replace(/\\D/g, '')}" target="_blank" style="color: #15803d; font-weight: 700;">WhatsApp</a>)</td>
              </tr>
              <tr>
                <td class="label">Student Email:</td>
                <td class="value">${booking.email ? `<a href="mailto:${booking.email}">${booking.email}</a>` : '<em style="color:#94a3b8">Not provided</em>'}</td>
              </tr>
              <tr>
                <td class="label">Target Exam:</td>
                <td class="value"><strong>${booking.targetExam}</strong></td>
              </tr>
              <tr>
                <td class="label">Coaching City:</td>
                <td class="value">${booking.city || "Kota"}</td>
              </tr>
              <tr>
                <td class="label">Assigned Mentor:</td>
                <td class="value">${booking.counsellorName}</td>
              </tr>
              <tr>
                <td class="label">Scheduled Slot:</td>
                <td class="value"><strong>${booking.date}</strong> at <strong>${booking.slotTime}</strong></td>
              </tr>
              <tr>
                <td class="label">Consultation Mode:</td>
                <td class="value">${booking.callMode || "Direct Phone Call"}</td>
              </tr>
              <tr>
                <td class="label">Advisory Track:</td>
                <td class="value">${booking.trackTitle || "Coaching & Batch Cap Reality Check"}</td>
              </tr>
              <tr>
                <td class="label">Payment Status:</td>
                <td class="value"><span class="paid-tag">✓ ₹11 PAID (Razorpay: ${booking.razorpayPaymentId || "pay_verified"})</span></td>
              </tr>
            </table>

            ${booking.notes ? `
              <div style="margin-top: 16px;">
                <strong style="font-size: 12px; text-transform: uppercase; color: #64748b;">Student Queries / Notes:</strong>
                <div class="notes-box">"${booking.notes}"</div>
              </div>
            ` : ""}
          </div>
          <div class="footer">
            FutureSelector Academic Advisory Platform • Automated Dispatch System
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"FutureSelector Advisory" <${senderEmail}>`,
      to: adminRecipient,
      subject: `🚨 [New Booking] ${booking.studentName} (${booking.targetExam}) - #${booking.bookingId}`,
      html: adminHtml
    });
    console.log(`📧 [ADMIN EMAIL SENT]: Alert dispatched to ${adminRecipient}`);
    results.adminSent = true;
  } catch (adminErr) {
    console.error("❌ [ADMIN EMAIL FAILED]:", adminErr.message);
  }

  // =========================================================================
  // 2. STUDENT CONFIRMATION EMAIL (If student provided an email)
  // =========================================================================
  if (booking.email && booking.email.includes("@")) {
    try {
      const studentHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #124B38 0%, #0d3527 100%); padding: 30px 24px; color: #ffffff; text-align: center; }
            .badge { background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
            .title { font-size: 22px; font-weight: 800; margin: 12px 0 6px 0; }
            .body { padding: 28px 24px; }
            .pass-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 18px; margin: 20px 0; }
            .pass-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .pass-row:last-child { border-bottom: none; }
            .cta-btn { display: block; text-align: center; background: #124B38; color: #ffffff !important; font-weight: 800; font-size: 14px; padding: 14px 20px; border-radius: 12px; text-decoration: none; margin: 24px 0 16px 0; }
            .footer { background: #f8fafc; padding: 20px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">✓ Consultation Confirmed</span>
              <div class="title">1-on-1 Senior Advisory Confirmed!</div>
              <div style="font-size: 13px; opacity: 0.9;">Booking Ref: <strong>#${booking.bookingId}</strong></div>
            </div>
            <div class="body">
              <p style="font-size: 15px; margin-top: 0;">Dear <strong>${booking.studentName}</strong>,</p>
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                Your 1-on-1 academic counseling session has been successfully locked. Your ₹11 token commitment fee has been verified via Razorpay (${booking.razorpayPaymentId || "pay_verified"}).
              </p>

              <div class="pass-card">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #124B38; margin-bottom: 10px;">
                  🎓 Appointment Pass Details
                </div>
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Assigned Senior Mentor:</strong></td>
                    <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 700;">${booking.counsellorName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Scheduled Day:</strong></td>
                    <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 700;">${booking.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Time Slot:</strong></td>
                    <td style="padding: 6px 0; text-align: right; color: #124B38; font-weight: 800;">${booking.slotTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Target Exam:</strong></td>
                    <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 700;">${booking.targetExam}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Consultation Mode:</strong></td>
                    <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 700;">${booking.callMode || "Direct Phone Call"}</td>
                  </tr>
                </table>
              </div>

              ${booking.meetingLink ? `
                <a href="${booking.meetingLink}" target="_blank" class="cta-btn">
                  Join Google Meet Advisory Room →
                </a>
              ` : ""}

              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; margin-top: 16px; font-size: 12px; color: #065f46; line-height: 1.5;">
                <strong>💡 Preparation Tip:</strong> Please keep your recent mock test percentiles/scores, preferred coaching list, and any scholarship offer letters handy so your senior mentor can perform a 100% unbiased audit.
              </div>
            </div>

            <div class="footer">
              Need urgent help? Reply directly to this email or WhatsApp our student support desk at <strong>+91 90709 01847</strong>.<br />
              © 2026 FutureSelector • 100% Non-Commissioned Academic Mentorship
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"FutureSelector Mentorship" <${senderEmail}>`,
        to: booking.email,
        subject: `🎉 Confirmed: 1-on-1 Advisory with ${booking.counsellorName} [#${booking.bookingId}]`,
        html: studentHtml
      });
      console.log(`📧 [STUDENT EMAIL SENT]: Confirmation pass dispatched to ${booking.email}`);
      results.studentSent = true;
    } catch (studentErr) {
      console.error("❌ [STUDENT EMAIL FAILED]:", studentErr.message);
    }
  }

  return results;
}

module.exports = {
  getTransporter,
  sendCounsellingBookingNotification
};
