const oAuth_credentials = require("../../../client_secret.json");
const { google } = require("googleapis");
const fs = require("fs");

const OAuth2 = google.auth.OAuth2;

const { client_id, client_secret, redirect_uris } = oAuth_credentials.web;

const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

const TOKEN_PATH = "token.json";

function youtubeUploader(options) {
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getAccessToken(oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      authenticateAndUpload(oauth2Client, options);
    }
  });
}

function getAccessToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
  });

  console.log(
    "Veuillez autoriser l'accès à cette application en visitant cette URL:",
    authUrl
  );

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Code d'autorisation : ", (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error(
          "Erreur lors de l'obtention du jeton d'accès :",
          err
        );
      }
      oauth2Client.credentials = token;
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(
            "Erreur lors de l'enregistrement du jeton d'accès :",
            err
          );
        } else {
          console.log("Jeton d'accès enregistré avec succès.");
          authenticateAndUpload(oauth2Client);
        }
      });
    });
  });
}

function authenticateAndUpload(auth, options) {
  const youtube = google.youtube({
    version: "v3",
    auth: auth,
  });

  uploadVideo(youtube, options);
}

function uploadVideo(youtube, options) {
  const { videoPath, title, description, tags, categoryId, privacyStatus } =
    options;

  const requestBody = {
    snippet: {
      title,
      description,
      tags,
      categoryId,
    },
    status: {
      privacyStatus,
    },
  };

  youtube.videos.insert(
    {
      part: Object.keys(requestBody).join(","),
      requestBody,
      media: {
        body: require("fs").createReadStream(videoPath),
      },
    },
    (err, response) => {
      if (err) {
        console.error("Erreur lors de la publication de la vidéo:", err);
        console.error("Réponse complète de l'API YouTube:", err.response.data);
        return;
      }

      const videoId = response.data.id;
      console.log(
        "La vidéo a été publiée avec succès. ID de la vidéo : " + videoId
      );
    }
  );
}

module.exports = { youtubeUploader };
