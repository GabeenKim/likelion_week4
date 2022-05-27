import express from "express";
import api from "./api";

const app = express();
const port = 3300;
const { sequelize } = require("../models");

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.log(err);
  });


app.use(express.json());
app.use("/api", api);

app.listen(port, () => {
  console.log(`서버실행 => http://localhost:${port}`);
});