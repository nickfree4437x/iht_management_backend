import voucherStyles
from "./voucherStyles.js";

import voucherHeader
from "./voucherHeader.js";

import voucherClientSection
from "./voucherClientSection.js";

import voucherTravelSection
from "./voucherTravelSection.js";

import voucherFooter
from "./voucherFooter.js";

import voucherSignature
from "./voucherSignature.js";



const hotelVoucherTemplate = (
  vouchers
) => {

  return `

    <!DOCTYPE html>

    <html>

      <head>

        <meta charset="UTF-8" />

        <style>

          ${voucherStyles}

        </style>

      </head>

      <body>

        ${vouchers.map((voucher) => `

          <div class="page">

            ${voucherHeader(voucher)}

            ${voucherClientSection(voucher)}

            ${voucherTravelSection(voucher)}

            ${voucherFooter()}

            ${voucherSignature()}

          </div>

        `).join("")}

      </body>

    </html>

  `;

};

export default hotelVoucherTemplate;