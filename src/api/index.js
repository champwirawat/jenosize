const express = require("express");
const placeSearch = require("./google-place-search");
const game24 = require("./game-24");
const xoBot = require("./xo-bot");

const router = express.Router();
router.use("/place-search", placeSearch);
router.use("/game24", game24);
router.use("/xo-bot", xoBot);

module.exports = router;
