const express = require("express");
const mysql = require("mysql");
const multer = require("multer");
const cors = require("cors");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

app.use(cors("*"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PSW,
  database: process.env.DB_SQL,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.post("/add", upload.single("file"), async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const createdAt = new Date();
    const imgsrc = process.env.SERVER_URL + req.file.path;
    connection.getConnection((error, tempConnection) => {
      if (!!error) {
        tempConnection.release();
        console.log(error);
      } else {
        console.log("connection succesful");
        let sql = `SELECT * FROM new_user WHERE mobile=${mobile}`;
        tempConnection.query(sql, (error, row, fields) => {
          if (!!error) {
            tempConnection.release();
            console.log(error);
          } else {
            if (row.length > 0) {
              tempConnection.release();
              res.json({ message: "User Already Exists", code: 2 });
            } else {
              sql = "INSERT INTO new_user SET ?";
              tempConnection.query(
                sql,
                { name, mobile, url: imgsrc, createdAt },
                (error, result) => {
                  if (!!error) {
                    tempConnection.release();
                    console.log(error);
                  } else {
                    res.json({
                      message: "Record Added Successfuly",
                      code: 1,
                    });
                  }
                }
              );
            }
          }
        });
      }
    });
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

app.get("/users", async (req, res) => {
  try {
    connection.getConnection((error, tempConnection) => {
      if (!!error) {
        tempConnection.release();
        console.log(error);
      } else {
        console.log("connection succesful");
        let sql = "SELECT * FROM new_user";
        tempConnection.query(sql, (error, row) => {
          if (!!error) {
            tempConnection.release();
            console.log(error);
          } else {
            res.json(row);
          }
        });
      }
    });
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

app.get("/get-user/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    connection.getConnection((error, tempConnection) => {
      if (!!error) {
        tempConnection.release();
        console.log(error);
      } else {
        console.log("connection succesful");
        let sql = `SELECT * FROM new_user WHERE mobile=${mobile}`;
        tempConnection.query(sql, (error, row) => {
          if (!!error) {
            tempConnection.release();
            console.log(error);
          } else {
            if (row.length < 1) {
              res.json({
                message: "No User Available with this data",
                code: 2,
              });
            } else {
              res.json(row);
            }
          }
        });
      }
    });
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

app.get("/count", async (req, res) => {
  try {
    console.log("hi");
    connection.getConnection((error, tempConnection) => {
      if (!!error) {
        tempConnection.release();
        console.log(error);
      } else {
        console.log("connection succesful");
        let sql = "SELECT COUNT(*) FROM new_user";
        tempConnection.query(sql, (error, result) => {
          if (!!error) {
            tempConnection.release();
            console.log(error);
          } else {
            res.json({ count: result[0]["COUNT(*)"] });
          }
        });
      }
    });
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

let port = process.env.PORT || 3020;
app.listen(port, () => {
  console.log(`app started in port ${port}`);
});
