import express from "express";

import {
  downloadAllVouchers
} from "../../controllers/hotel-voucher/downloadAllVouchers.js";

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