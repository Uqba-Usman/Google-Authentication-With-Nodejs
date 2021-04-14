const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

// Google Auth
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "880987390955-7v838m7r1gj8fna0r06mh57m4r34cv59.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let token = req.body.token;
  console.log("Token", token);

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];

    console.log("Payload: ", payload);
    console.log("User Id: ", userid);
  }
  verify()
    .then(() => {
      res.cookie("session-token", token);
      res.send("success");
    })
    .catch(console.error);
});

app.get("/dashboard", checkAuthenticated, (req, res) => {
  let user = req.user;
  res.render("dashboard", { user });
});

app.get("/protectedRoute", (req, res) => {
  res.send("This route is protected");
});

app.get("/logout", (req, res) => {
  res.clearCookie("session-token");
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  let token = req.cookies["session-token"];

  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
  }
  verify()
    .then(() => {
      req.user = user;
      next();
    })
    .catch((err) => {
      res.redirect("/login");
    });
}

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
