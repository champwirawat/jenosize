const express = require("express");
const placeSearch = require("./google-place-search");
const game24 = require("./game-24");

const router = express.Router();
router.use("/place-search", placeSearch);
router.use("/game24", game24);

module.exports = router;
