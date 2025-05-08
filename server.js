const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const http = require("http");
const RED = require("node-red");

const app = express();
const server = http.createServer(app);

// Middleware pour parser les formulaires
app.use(bodyParser.urlencoded({ extended: false }));

// Session
app.use(session({
  secret: "superSecretLinaPassword",
  resave: false,
  saveUninitialized: false
}));

// Page login statique
app.use(express.static("public"));

// Middleware d’authentification
function authMiddleware(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect("/login.html");
}

// Route POST pour le login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "lina123") {
    req.session.authenticated = true;
    return res.redirect("/api/ui");
  } else {
    return res.send("Identifiants incorrects");
  }
});

// Configuration Node-RED
const settings = {
  httpAdminRoot: "/red",
  httpNodeRoot: "/api",
  userDir: "./nodered",
  functionGlobalContext: {},
  ui: { path: "ui" }
};

RED.init(server, settings);

// Protéger /red et /api
app.use("/red", authMiddleware, RED.httpAdmin);
app.use("/api", authMiddleware, RED.httpNode);

// Lancer le serveur
const PORT = process.env.PORT || 1880;
server.listen(PORT, () => {
  console.log("Serveur sur http://localhost:" + PORT);
});

RED.start();