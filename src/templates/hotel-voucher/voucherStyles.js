const voucherStyles = `

  body {

    margin: 0;
    padding: 0;

    font-family: Arial, sans-serif;

    color: #111;

    background: #fff;

  }



  .page {

    width: 100%;

    min-height: 100vh;

    box-sizing: border-box;

    position: relative;

    page-break-after: always;

    padding-top: 100px;

    padding-bottom: 80px;

    padding-left: 90px;

    padding-right: 90px;

  }



  /* ======================================================
     🔥 HEADER
  ====================================================== */

  .header-wrapper {

    width: 100%;

    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    margin-bottom: 38px;

  }



  /* LEFT */
  .header-left {

    width: 46%;

  }



  .status {

    font-size: 14px;

    margin-bottom: 14px;

    line-height: 1.3;

  }



  .status strong {

    font-weight: 700;
    font-size: 13px;

  }



  .status span {

    font-weight: 400;

  }



  .hotel-name {

    font-size: 16px;

    font-weight: 700;

    margin-bottom: 6px;

    line-height: 1.2;

  }



  .hotel-address {

    font-size: 15px;

    line-height: 1.2;

  }



  /* CENTER */
  .header-center {

    width: 20%;

    text-align: center;

    padding-top: 2px;

  }



  .date {

    font-size: 14px;

    line-height: 1.3;

  }



  .date strong {

    font-weight: 700;

  }



  .date span {

    font-weight: 400;
    font-size: 13px;

  }



  /* RIGHT */
  .header-right {

    width: 26%;

    text-align: right;

  }



  .logo {

    width: 180px;

    display: block;

    margin-left: 80px;

    margin-top: -60px;

    margin-bottom: 18px;

  }



  .gst {

    font-size: 13px;
    margin-left: -20px;

    font-weight: 700;

    line-height: 1.3;

  }



  /* ======================================================
     🔥 CLIENT SECTION
  ====================================================== */

  .client-section {

    margin-top: -10px;

  }



  .client-name {

    font-size: 15px;

    font-weight: 600;

    margin-bottom: 12px;

  }

  .voucher-line {

    font-size: 12.5px;

    line-height: 1.45;

    margin-bottom: 14px;

  }


  .date-lines {

    margin-top: 6px;

    margin-bottom: 24px;

  }

  .date-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .date-value {
    white-space: nowrap;
    font-size: 13px;
  }

  .colon {
    font-size: 13px;
  }

  .date-text {
    font-size: 13px;
  }



  /* ======================================================
     🔥 TRAVEL SECTION
  ====================================================== */

  .travel-section {

    display: flex;

    justify-content: space-between;

    margin-top: 20px;

    margin-bottom: 55px;

  }



  .travel-left,
  .travel-right {

    width: 48%;

    font-size: 15px;

    line-height: 1.4;

  }



  /* ======================================================
     🔥 FOOTER
  ====================================================== */

  .footer-text {

    font-size: 15px;

    line-height: 1.5;

    margin-top: 12px;

  }

  .footer-text-base{
   -mt-5
  }



  .bold-line {

    font-weight: 700;

    text-decoration: underline;

    text-underline-offset: 3px;

    text-decoration-thickness: 0.7px;

  }


  /* ======================================================
     🔥 SIGNATURE
  ====================================================== */

  .signature {

    position: absolute;

    right: 72px;

    bottom: 225px;

    text-align: center;

    font-size: 15px;

  }



  .signature-name {

    text-decoration: underline;

    margin-bottom: 4px;

  }

`;

export default voucherStyles;