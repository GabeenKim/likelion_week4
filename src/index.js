import express from "express";
import api from "./api";

const app = express();
const port = 3300;

app.use(express.json());
app.use("/api", api);


app.listen(port, () => {
  console.log(`서버실행 => http://localhost:${port}`);
});
