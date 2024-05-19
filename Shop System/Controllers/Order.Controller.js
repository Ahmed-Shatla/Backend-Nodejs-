import { connection } from "../Database/Database_Connection.js"

const createOrder = (req, res, next) => {
    //inserting in orders table
    //Finding CustomerID usig his email in params
    connection.execute(`select CID from customer where Email='${req.params.email}'`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        //if user found
        if (result.length != 0) {
            //store his ID
            let customerID = result[0].CID;
            //storing names of items that users want to buy.
            let { items } = req.body;
            //converting ['milk','juice'] ==> 'milk','juice' to be usable in sql query
            let itemsStr = items.map(name => `'${name}'`).join(', ');
            //finding unit price for each item to calculate total amount
            connection.execute(`select Unit_Price, Product_Name from products where Product_Name IN (${itemsStr})`, (err, result) => {
                let totalAmount = 0;
                if (err) {
                    return res.status(500).json("Internal server error");
                }
                if (result.length != 0) {
                    //check if items names not found
                    if (result.length != items.length) {
                        return res.status(404).json("Item not found, please check items names");
                    }
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        const matchingProduct = result.find(product => product.Product_Name === item);
                        if (matchingProduct) {
                            totalAmount += parseFloat(matchingProduct.Unit_Price);
                        }
                    }

                    //insert total amound and customerID into orders table
                    connection.execute('INSERT INTO orders (Total_Amount, Customer_ID) VALUES (?, ?)', [totalAmount, customerID]);

                    //inserting into orderitems table
                    //find current order ID
                    connection.execute('select LAST_INSERT_ID()', (err, result) => {
                        if (err) {
                            return res.status(500).json("Internal server error");
                        }
                        let orderID = result[0]['LAST_INSERT_ID()'];

                        //object to store each item as a key and its quantity as a value {"milk":3}
                        let quantity = {};
                        for (let item of items) {
                            if (quantity[item]) {
                                quantity[item] += 1;
                            }
                            else {
                                quantity[item] = 1;
                            }
                        }

                        //getting products IDs and unitprice for each item in quantity with the same order
                        let uniqueItemStr = Object.keys(quantity).map(name => `'${name}'`).join(', ');
                        connection.execute(`select Unit_Price,PID from products where Product_Name IN (${uniqueItemStr})`, (err, result) => {
                            if (err) {
                                return res.status(500).json("Internal server error");
                            }
                            if (result.length != 0) {
                                for (let item of Object.keys(quantity)) {
                                    const i = Object.keys(quantity).indexOf(item);
                                    //insert all into orderitems table
                                    connection.execute(`insert into orderitems (Order_ID,Product_ID,Quantity,Unit_Price) VALUES (?,?,?,?)`, [orderID, result[i]['PID'], quantity[item], result[i]['Unit_Price']]);
                                }
                                return res.status(201).json({ message: "Order created successfully" });
                            }

                        })
                    })
                }

            })
        }
        //if not found
        else {
            return res.status(404).json("User not found");
        }
    });

}

const avgOrder = (req, res, next) => {
    connection.execute(`SELECT AVG(Total_Amount) as AverageOrder from orders;`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}

const didntOrder = (req, res, next) => {
    //all left join customers and not inner 
    connection.execute(`SELECT CID as customerID
    FROM customer
    LEFT JOIN orders ON customer.CID=orders.Customer_ID
    WHERE orders.OID IS NULL`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}

const mostItems = (req, res, next) => {
    connection.execute(`SELECT Customer_ID,SUM(orderitems.Quantity) as total_quantity
    FROM orders
    JOIN orderitems ON orderitems.Order_ID=orders.OID
    ORDER BY total_quantity DESC
    LIMIT 1`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}

const top10 = (req, res, next) => {
    connection.execute(`SELECT Customer_ID,SUM(Total_Amount) as tota_amount
    FROM orders
    GROUP BY Customer_ID
    ORDER BY tota_amount DESC
    LIMIT 10`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}

const atLeast5 = (req, res, next) => {
    connection.execute(`SELECT Customer_ID,
    COUNT(*) AS order_count
    FROM orders
    GROUP BY Customer_ID
    HAVING order_count >= 5
    ORDER BY order_count DESC`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}

const percentageOrders = (req, res, next) => {
    //getting number of customer that ordered more than 5 orders
    connection.execute(`SELECT COUNT(Customer_ID) AS num_customers_with_multiple_orders
    FROM (SELECT Customer_ID FROM orders GROUP BY Customer_ID HAVING COUNT(*) > 1) AS customers_with_multiple_orders`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        if (result.length > 0) {
            let numCustomerMultipleOrders = result[0].num_customers_with_multiple_orders;
            //getting number of all customers
            connection.execute('SELECT COUNT(DISTINCT CID) AS total_customers FROM customer', (err, totalResult) => {
                if (err) {
                    return res.status(500).json({ error: "Internal server error" });
                }
                const totalCustomers = totalResult[0].total_customers;
                const percentage = (numCustomerMultipleOrders / totalCustomers) * 100;
                return res.status(200).json({ percentage });
            });
        } else {
            return res.status(200).json({ percentage: 0 });
        }
    })
}

const earliestOrder = (req, res, next) => {
    connection.execute(`SELECT Customer_ID, DATE(MIN(Order_Date)) AS earliest_order_date
    FROM orders
    GROUP BY Customer_ID
    ORDER BY earliest_order_date
    LIMIT 1`, (err, result) => {
        if (err) {
            return res.status(500).json("Internal server error");
        }
        return res.status(203).json(result);
    })
}

export { createOrder, avgOrder, didntOrder, mostItems, top10, atLeast5, percentageOrders, earliestOrder }