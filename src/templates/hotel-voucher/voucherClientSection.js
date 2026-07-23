const voucherClientSection = (
  voucher
) => {

  // ======================================================
  // 🔥 CLIENT TITLE (Backward Compatible)
  // ======================================================

  const clientTitle =
    voucher.title ||
    (voucher.gender === "Male"
      ? "Mr."
      : "Ms.");

  return `

    <div class="client-section">

      <div class="client-name">

        Client Name :

        ${clientTitle}

        ${voucher.clientName}

        ${voucher.pax
          ? `X ${voucher.pax} Pax`
          : ""}

      </div>

      <div class="voucher-line">

        Please provide

        ${voucher.roomCategory || "Room"}

        from

        ${new Date(
          voucher.checkIn
        ).toLocaleDateString("en-GB", {

          day: "numeric",
          month: "long",
          year: "numeric",

        })}

        to

        ${new Date(
          voucher.checkOut
        ).toLocaleDateString("en-GB", {

          day: "numeric",
          month: "long",
          year: "numeric",

        })}

        as per following.

      </div>

      <div class="date-lines">

        ${voucher.dateLines.map((item) => {

          const parts =
            item.date.split("/");

          const formattedDate =
            new Date(

              parts[2],
              parts[1] - 1,
              parts[0]

            ).toLocaleDateString(

              "en-GB",

              {

                day: "numeric",

                month: "long",

                year: "numeric",

              }

            );

          return `

            <div class="date-row">

              <span class="date-value">
                ${formattedDate}
              </span>

              <span class="colon">
                :
              </span>

              <span class="date-text">
                ${item.text}
              </span>

            </div>

          `;

        }).join("")}

      </div>

    </div>

  `;

};

export default voucherClientSection;