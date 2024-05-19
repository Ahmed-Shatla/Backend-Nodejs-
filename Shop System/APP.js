import express from "express";
import customerRouters from "./Routers/Customer.Router.js";
import ProductRouters from "./Routers/Product.Router.js";
import OrderRouters from "./Routers/Order.Routers.js";

let app = express();

app.use(express.json());

app.use("/api/customer", customerRouters);
app.use("/api/product", ProductRouters);
app.use("/api/order", OrderRouters);


app.listen(4040, () => {
    console.log("Server is running.")
})