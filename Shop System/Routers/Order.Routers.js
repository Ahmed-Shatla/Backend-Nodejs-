import express from "express";
import { createOrder, avgOrder, didntOrder, mostItems, top10, atLeast5, percentageOrders, earliestOrder } from '../Controllers/Order.Controller.js';


let router = express.Router();

router.post("/create/:email", createOrder);
router.get("/avgOrder", avgOrder);
router.get("/didntOrder", didntOrder);
router.get("/mostItems", mostItems);
router.get('/top-10', top10);
router.get('/at-Least-5', atLeast5);
router.get('/percentage-customer-multiple-orders', percentageOrders);
router.get('/earliest-order', earliestOrder);

export default router;