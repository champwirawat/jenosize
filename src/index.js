const express = require("express");
const placeSearch = require("./services/google-place-search");
const game24 = require("./services/game-24");

const app = express();

const middleware = (req, res, next) => {
  const reqData = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
  };
  console.log(`${new Date()} : ${JSON.stringify(reqData)}`);
  if (req.headers.authorization == "Boy") {
    next();
  } else {
    res.status(403).send();
  }
};
app.use(middleware);
app.use("/place-search", placeSearch);
app.use("/game24", game24);

const port = 4000;
app.listen(port, () => {
  console.log(`Start server at port ${port}`);
});
