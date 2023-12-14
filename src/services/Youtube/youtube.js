const oAuth_credentials = require("../../../client_secret.json");
const { google } = require("googleapis");
const fs = require("fs");

const OAuth2 = google.auth.OAuth2;

// Remplacez les valeurs par vos propres informations d'identification OAuth 2.0
const { client_id, client_secret, redirect_uris } = oAuth_credentials.web;

const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

// Chargez les informations d'authentification depuis un fichier (si déjà autorisé)
const TOKEN_PATH = "token.json";

fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    // Si le fichier de jeton n'existe pas, effectuez le processus d'autorisation OAuth 2.0
    getAccessToken(oauth2Client);
  } else {
    // Utilisez le jeton existant
    oauth2Client.credentials = JSON.parse(token);
    authenticateAndUpload(oauth2Client);
  }
});

function getAccessToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"],
  });

  console.log(
    "Veuillez autoriser l'accès à cette application en visitant cette URL:",
    authUrl
  );

  // Attendre que l'utilisateur autorise l'accès et entre le code d'authentification
  // puis exécutez getToken pour obtenir le jeton d'accès
  // et enregistrez-le dans le fichier token.json pour une utilisation future
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

function authenticateAndUpload(auth) {
  // Charger l'API client google avec l'objet d'authentification OAuth2Client
  const youtube = google.youtube({
    version: "v3",
    auth: auth,
  });

  // Appeler la fonction pour publier la vidéo
  uploadVideo(youtube);
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

  // Créer la demande pour la publication de la vidéo
  youtube.videos.insert(
    {
      part: Object.keys(requestBody).join(","),
      requestBody,
      media: {
        body: require("fs").createReadStream(videoPath),
      },
    },
    function (err, response) {
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
