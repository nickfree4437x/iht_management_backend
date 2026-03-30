import express from "express";
import { searchCities } from "../../controllers/invoice-city/cityController.js";

const router = express.Router();

router.get("/cities", searchCities);

export default router;