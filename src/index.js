const fs = require("fs");
const express = require("express");
const https = require("https");
const admin = require("firebase-admin");
const api = require("./api");
const firebaseSdk = require("../config/firebase-adminsdk.json");
const privateKey = fs.readFileSync("config/selfsigned.key", "utf8");
const certificate = fs.readFileSync("config/selfsigned.crt", "utf8");

admin.initializeApp({
  credential: admin.credential.cert(firebaseSdk),
});

// --- Function ---
const authValidation = async (req) => {
  const authPaths = ["/api"];
  for (const path of authPaths) {
    if (req.path.startsWith(path)) {
      try {
        await admin.auth().verifyIdToken(req.headers.authorization);
        return true;
      } catch (err) {
        throw err;
      }
    }
  }
  return true;
};
const middleware = async (req, res, next) => {
  try {
    const reqData = {
      method: req.method,
      url: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query,
    };
    console.log(`${new Date()} : Request > ${JSON.stringify(reqData)}`);
    if (await authValidation(req)) {
      next();
    } else {
      throw "invalid authorization";
    }
  } catch (err) {
    console.error("authorization error : ", err);
    res.status(401).json(err).send();
  }
};

// --- App Rount ---
const app = express();
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(middleware);
// # API
app.use("/api", api);
// # Login System
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/savetoken", async (req, res) => {
  const idToken = req.query.idToken;
  try {
    const resp = await admin.auth().verifyIdToken(idToken);
    console.log(resp);
    res.render("success", { name: resp.name, email: resp.email });
  } catch (err) {
    console.log(err);
    res.status(401).send("UnAuthorised Request");
  }
});

// --- Start Server ---
const port = 4000;
const httpsServer = https.createServer(
  { key: privateKey, cert: certificate },
  app
);
httpsServer.listen(port, () => {
  console.log(`Start server at port ${port}`);
});
