const { google } = require("googleapis");
const fs = require("fs");
const readline = require("readline");

const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
const TOKEN_PATH = "token.json"; // Le chemin vers le fichier token.json

function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Veuillez autoriser l'accès en visitant cette URL :", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Code d'autorisation : ", (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Erreur lors de l'obtention du jeton d'accès :",
          err
        );
      oauth2Client.credentials = token;
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err)
          return console.error(
            "Erreur lors de l'enregistrement du jeton d'accès :",
            err
          );
        console.log("Jeton d'accès enregistré avec succès.");
      });
      callback(oauth2Client);
    });
  });
}

function authenticate(callback) {
  const credentials = require("./client_secret_848882013918-vufpg7nvpjcrgluf5n6q147ugdsm08ls.apps.googleusercontent.com"); // Remplacez par le chemin correct de vos identifiants OAuth 2.0

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getNewToken(oAuth2Client, callback);
    }
    oAuth2Client.credentials = JSON.parse(token);
    callback(oAuth2Client);
  });
}

module.exports = { authenticate };
