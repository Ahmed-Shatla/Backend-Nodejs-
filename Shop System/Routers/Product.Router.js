import express from "express";
import { addProduct, totalRevenue, totalSold } from '../Controllers/Product.Controller.js';


let router = express.Router();

router.post("/add", addProduct);
router.get("/total-revenue", totalRevenue);
router.get("/total-sold", totalSold);

export default router;