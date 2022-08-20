const express = require("express");
const axios = require("axios");

const router = express.Router();

// Doc : https://developers.google.com/maps/documentation/places/web-service/search-text
router.get("/textsearch", async (req, res) => {
  const query = encodeURIComponent(req.query.search);
  const apiKey = "AIzaSyCm_4HQFULzz6v-9SO34BAs2YJI6XmB_64";

  const config = {
    method: "get",
    url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`,
    headers: {},
  };

  try {
    const resp = await axios(config);
    if (resp.data.status != "OK") {
      throw resp.data;
    }
    res.json(resp.data);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
