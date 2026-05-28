const voucherTravelSection = (
  voucher
) => {

  return `

    <div class="travel-section">

      <div class="travel-left">

        <div>

          Arrival On :
          ${new Date(
            voucher.checkIn
          ).toLocaleDateString("en-GB")}

        </div>

        <div>

          Departure On:
          ${new Date(
            voucher.checkOut
          ).toLocaleDateString("en-GB")}

        </div>

      </div>



      <div class="travel-right">

        <div>
          By: Surface EX
        </div>

        <div>
          By: Surface TO :
        </div>

      </div>

    </div>

  `;

};

export default voucherTravelSection;