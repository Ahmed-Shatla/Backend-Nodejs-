import { connection } from "../Database/Database_Connection.js"


const addProduct = (req, res, next) => {
    let data = req.body;
    connection.query('insert into products set ?', data, (err, result) => {
        if (err) {
            return res.send(500).json("Internal server error");
        }
        return res.status(201).json({ message: "Added successfully" });
    })
}

const totalRevenue = (req, res, next) => {
    connection.execute(`SELECT Category,SUM(orderitems.Unit_Price*orderitems.Quantity) as Revenue
    FROM products
    JOIN orderitems ON products.PID=orderitems.Product_ID
    GROUP BY Category`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}


const totalSold = (req, res, next) => {
    connection.execute(`SELECT Product_Name,SUM(orderitems.Quantity) as TotalSold
    FROM products
    JOIN orderitems ON products.PID=orderitems.Product_ID
    GROUP BY Product_Name`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}




export { addProduct, totalRevenue, totalSold }