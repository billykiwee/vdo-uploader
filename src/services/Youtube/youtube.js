const oAuth_credentials = require("../../../client_secret.json");
const { google } = require("googleapis");
const fs = require("fs");

class YoutubeService {
  constructor() {
    const { client_id, client_secret, redirect_uris } = oAuth_credentials.web;

    this.#oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    this.#TOKEN_PATH = "token.json";
  }

  uploader(options) {
    fs.readFile(this.TOKEN_PATH, (err, token) => {
      if (err) {
        this.getNewToken(oauth2Client, options);
      } else {
        this.oauth2Client.credentials = JSON.parse(token);

        this.authenticateAndUpload(this.oauth2Client, options);
      }
    });
  }

  getNewToken(oauth2Client, options) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/youtube.upload"],
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
            this.authenticateAndUpload(oauth2Client, options);
          }
        });
      });
    });
  }

  authenticateAndUpload(auth, options) {
    const youtube = google.youtube({
      version: "v3",
      auth: auth,
    });

    this.initializeUpload(youtube, options);
  }

  initializeUpload(youtube, options) {
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
          console.error(
            "Réponse complète de l'API YouTube:",
            err.response.data
          );
          return;
        }

        const videoUrl = `https://www.youtube.com/watch?v=${response.data.id}`;

        console.log("La vidéo a été publiée sur YouTube - " + videoUrl);
      }
    );
  }
}

module.exports = { YoutubeService };
