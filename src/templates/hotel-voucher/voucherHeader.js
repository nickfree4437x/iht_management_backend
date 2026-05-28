import logoBase64
from "../../utils/logoBase64.js";

const voucherHeader = (
  voucher
) => {

  return `

    <div class="header-wrapper">

      <!-- LEFT -->
      <div class="header-left">

        <div class="status">

          <strong>Status :</strong>

          <span>

            ${voucher.status}

            ${voucher.status === "Confirmed" &&
              voucher.confirmationNo

              ? `# / ${voucher.confirmationNo}`

              : ""}

          </span>

        </div>



        <div class="hotel-name">

          ${voucher.hotelName}

        </div>



        <div class="hotel-address">

          ${voucher.hotelAddress || "-"}

        </div>

      </div>



      <!-- CENTER -->
      <div class="header-center">

        <div class="date">

          <strong>Date :</strong>

          <span>

            ${new Date(
              voucher.date
            ).toLocaleDateString("en-GB")}

          </span>

        </div>

      </div>



      <!-- RIGHT -->
      <div class="header-right">

        <img

          class="logo"

          src="data:image/png;base64,${logoBase64}"

        />



        <div class="gst">

          GST No :08AAMFI1480J1Z3

        </div>

      </div>

    </div>

  `;

};

export default voucherHeader;