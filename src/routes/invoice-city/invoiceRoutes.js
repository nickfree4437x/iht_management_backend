import express from "express"
import { sendInvoice } from "../../controllers/invoice-city/invoiceController.js"

const router = express.Router()

router.post("/send", sendInvoice)

export default router