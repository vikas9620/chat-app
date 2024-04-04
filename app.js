const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/");
});

app.get("/", (req, res) => {
  const username = req.cookies.username;

  if (!username) {
    return res.sendFile(path.join(__dirname, "public", "login.html"));
  }

  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/message", (req, res) => {
  const { message } = req.body;
  const username = req.cookies.username;

  if (!username) {
    return res.status(400).send("Please log in first.");
  }

  const data = `${username}: ${message}\n`;

  fs.appendFile("messages.txt", data, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).send("Error writing message.");
    }
    
    res.status(200).end();
  });
});

app.get("/messages", (req, res) => {
  fs.readFile("messages.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Error reading messages.");
    }
    const messages = data.split("\n").filter(Boolean);
    res.send(messages);
  });
});

app.listen(3000);
