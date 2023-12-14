const url =
  "https://kiwee.site/?code=4%2F0AfJohXkIXbbUBmxogCTAsHbh-eLsl7pV6FIF6Kt51RRdN5qPnpi1BS9fDvH64j0Z6vUwyQ&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload";

// Fonction pour extraire le code de l'URL
function extractCodeFromURL(url) {
  const urlObject = new URL(url);
  const searchParams = urlObject.searchParams;
  const code = searchParams.get("code");
  return code;
}

const code = extractCodeFromURL(url);
