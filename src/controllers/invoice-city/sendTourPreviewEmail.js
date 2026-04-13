import puppeteer from "puppeteer";
import { transporter } from "../../services/emailService.js";

export const sendTourPreviewEmail = async (req, res) => {
  try {
    const { email, tourData, download } = req.body;

    if (!tourData) {
      return res.status(400).json({ message: "Missing data" });
    }

    const itinerary = tourData.itinerary || [];
    const transport = tourData.transport || tourData.transports || [];
    const other = tourData.otherDetails || {};

    // 🔥 FIXED IMAGE LOGIC
    const advisorImage = tourData.advisor?.photo
      ? tourData.advisor.photo.startsWith("http")
        ? tourData.advisor.photo
        : `http://localhost:5000${tourData.advisor.photo}`
      : "https://via.placeholder.com/48";

    const html = `
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: white;
      padding: 20px;
    }

    .container {
      max-width: 800px;
      margin: auto;
      border-radius: 12px;
      padding: 20px;
    }

    .section {
      background: #f9fafb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 14px;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      background: #ddd;
    }

    h3 { font-size: 14px; margin-bottom: 8px; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 8px;
    }

    th, td {
      padding: 6px;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }

    th {
      color: #6b7280;
      font-weight: 500;
    }

    .badge {
      font-size: 10px;
      color: #92400e;
      padding: 2px 6px;
      margin-left: 2px;
    }

    .status-confirmed { color: #059669; }
    .status-pending { color: #d97706; }
  </style>
</head>

<body>

<div class="container">

<!-- 🔥 ADVISOR -->
<div class="section">
  <h3>Tour Advisor</h3>

  <div class="row">
    <img src="${advisorImage}" class="avatar" />

    <div>
      <div style="font-size:11px; color:#1F2937">${tourData.advisor?.name || "-"}</div>
      <div style="font-size:11px;color:#6b7280;">${tourData.advisor?.phone || "-"}</div>
    </div>
  </div>
</div>

<!-- 🔥 GUEST (EXACT TABLE STYLE) -->
<div class="section">
  <h3>Guests – ${tourData.pax || 0} Pax</h3>

  <table>
    <tr>
      <th>Guest Name</th>
      <th>Country</th>
      <th>Arrival</th>
    </tr>

    <tr>
      <td>
        <span style="text-decoration:underline; color:#1F2937">
          ${tourData.guestName || "-"}
        </span>
        <span class="badge">Primary</span>
      </td>
      <td style="color:#1F2937">${tourData.country || "-"}</td>
      <td style="color:#1F2937">${tourData.arrivalCity || "-"}</td>
    </tr>
  </table>
</div>

<!-- 🔥 ITINERARY -->
<div class="section">
  <h3>Tour Itinerary</h3>

  ${
    itinerary.length === 0
      ? "<p>No itinerary</p>"
      : `
      <table>
        <tr>
          <th>Date</th>
          <th>Destination</th>
          <th>Hotel</th>
          <th>Room Type</th>
          <th>Status</th>
        </tr>

        ${itinerary.map(row => `
          <tr>
            <td style="text-decoration:underline; color:#1F2937;">
             ${new Date(row.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
            </td>
            <td style="color:#1F2937">${row.destination || row.city || "-"}</td>
            <td style="color:#1F2937">${row.hotel || "-"}</td>
            <td style="color:#1F2937">${row.room || row.roomType || "-"}</td>
            <td class="${
              row.status === "Confirmed"
                ? "status-confirmed"
                : "status-pending"
            }">${row.status || "-"}</td>
          </tr>
        `).join("")}
      </table>
    `
  }
</div>

<!-- 🔥 TRANSPORT (FIXED TABLE) -->
<div class="section">
  <h3>Transport Details</h3>

  ${
    transport.length === 0
      ? "<p>No transport</p>"
      : `
      <table>
        <tr>
          <th>Date</th>
          <th>From</th>
          <th>To</th>
          <th>Vehicle</th>
          <th>Driver</th>
          <th>Phone</th>
        </tr>

        ${transport.map(t => `
          <tr>
            <td style="text-decoration:underline; color:#1F2937;">
             ${new Date(t.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
            </td>
            <td style="color:#1F2937">${t.from || "-"}</td>
            <td style="color:#1F2937">${t.to || "-"}</td>
            <td style="color:#1F2937">${t.driver?.vehicle || "-"}</td>
            <td style="color:#1F2937">${t.driver?.name || "-"}</td>
            <td style="color:#1F2937">${t.driver?.phone || "-"}</td>
          </tr>
        `).join("")}
      </table>
    `
  }
</div>

<!-- 🔥 OTHER DETAILS -->
<div class="section">
  <h3>Other Details</h3>

  <p style="font-size: 10px; color:#1F2937">Room: ${other.room || "-"}</p>
  <p style="font-size: 10px; color:#1F2937">Plan: ${other.plan || "-"}</p>
  <p style="font-size: 10px; color:#1F2937">Safari: ${other.safari || "-"}</p>
  <p style="font-size: 10px; color:#1F2937">Boating: ${other.boating || "-"}</p>
  <p style="font-size: 10px; color:#1F2937">Special Activity: ${other.specialActivity || "-"}</p>
</div>

</div>

</body>
</html>
`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    if (download) {
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=tour-preview.pdf",
      });
      return res.send(pdfBuffer);
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Tour Preview - India Heritage Travel",

      html: `
      <div style="
        font-family: Arial, sans-serif;
        color: #1f2937;
        line-height: 1.5;
      ">

        <p>Dear ${tourData.guestName || "Guest"},</p>

        <p>
          Greetings from <strong>India Heritage Travel</strong> 🇮🇳
        </p>

        <p>
          We are delighted to share your personalized tour preview with you.
          Please find the attached PDF containing the complete details of your upcoming journey.
        </p>

        <p>
          This document includes your itinerary, transport arrangements, and other important details to help you plan your trip smoothly.
        </p>

        <p>
          If you have any questions, need modifications, or require further assistance,
          please feel free to reach out to us anytime.
        </p>

        <p>
          We look forward to providing you with an unforgettable travel experience ✨
        </p>

        <br/>

        <p>
          Warm Regards,<br/>
          <strong>India Heritage Travel Team</strong>
        </p>

      </div>
      `,

      attachments: [
        {
          filename: "tour-preview.pdf",
          content: pdfBuffer,
        },
      ],
    });

    res.json({ message: "Success" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
};