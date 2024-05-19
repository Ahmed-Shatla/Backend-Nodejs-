import express from "express";
import { signUp, logIn } from '../Controllers/Customer.Controller.js';


let router = express.Router();

router.post("/sign-up", signUp);
router.get("/log-in", logIn);

export default router;