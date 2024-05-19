import { connection } from "../Database/Database_Connection.js"

const signUp = (req, res, next) => {
    let { email } = req.body;
    connection.execute(`SELECT Email FROM customer WHERE Email='${email}'`, (err, data) => {
        if (err) {
            return res.send(500).json("Internal server error");
        }
        if (data.length != 0) {
            return res.status(208).json({ message: "email already exist" });
        }
        connection.query('INSERT INTO customer set ?', req.body);
        return res.status(201).json({ message: "Added successfully" });
    })
}

const logIn = (req, res, next) => {
    let { email, phone } = req.body;
    connection.execute(`SELECT Email,phone FROM customer WHERE Email='${email}' AND phone='${phone}'`, (err, data) => {
        if (err) {
            return res.send(500).json("Internal server error");
        }
        if (data.length != 0) {
            return res.status(202).json({ message: "Logged in successfully" });
        }
        return res.status(404).json({ message: "Wrong email or phone number" });
    })
}
export { signUp, logIn };

