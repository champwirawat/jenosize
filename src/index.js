const express = require("express");
const placeSearch = require("./services/google-place-search");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/place-search", placeSearch);

const port = 4000;
app.listen(port, () => {
  console.log(`Start server at port ${port}`);
});
