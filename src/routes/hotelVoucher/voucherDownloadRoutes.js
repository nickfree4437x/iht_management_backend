import express from "express";

import {
  downloadAllVouchers
} from "../../controllers/hotelVoucher/downloadAllVouchers.js";

const router =
  express.Router();


// ======================================================
// 📥 DOWNLOAD HOTEL VOUCHERS
// ======================================================

router.get(
  "/all",
  downloadAllVouchers
);


export default router;