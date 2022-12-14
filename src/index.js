const fs = require("fs");
const https = require("https");
const express = require("express");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");
const api = require("./api");
const firebaseSdk = require("../config/firebase-adminsdk.json");
const privateKey = fs.readFileSync("config/selfsigned.key", "utf8");
const certificate = fs.readFileSync("config/selfsigned.crt", "utf8");

admin.initializeApp({
  credential: admin.credential.cert(firebaseSdk),
});

// --- Function ---
const verifyToken = (token) => {
  return admin.auth().verifyIdToken(token, true);
};
const revokeToken = (uid) => {
  return admin.auth().revokeRefreshTokens(uid);
};
const authValidation = async (req) => {
  const authApiPaths = ["/api", "/xo"];
  for (const path of authApiPaths) {
    if (req.path.startsWith(path)) {
      try {
        await verifyToken(req.cookies.__session);
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
    console.log(`
    ${new Date()}
    ==================== DUMP REQUEST ====================    
    ${JSON.stringify(reqData)}
    ======================================================`);
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
app.use(cookieParser());
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
    const resp = await verifyToken(idToken);
    res.cookie("__session", idToken);
    res.render("success", {
      name: resp.name,
      email: resp.email,
      idToken: idToken,
    });
  } catch (err) {
    console.log(err);
    res.status(401).send("UnAuthorised Request");
  }
});
app.get("/logout", async (req, res) => {
  const idToken = req.cookies.__session;
  const resp = await verifyToken(idToken);
  await revokeToken(resp.uid);
  res.clearCookie("__session");
  res.redirect("/");
});
// # Game XO
app.get("/xo", (req, res) => {
  res.sendFile(__dirname + "/views/xo-page.html");
});

// --- Start Server ---
const port = process.env.PORT || 5000;
// const httpsServer = https.createServer(
//   { key: privateKey, cert: certificate },
//   app
// );
app.listen(port, () => {
  console.log(`Start server at port ${port}`);
});
