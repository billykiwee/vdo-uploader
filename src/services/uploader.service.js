const { YoutubeService } = require("./Youtube/youtube");

class UploaderService {
  constructor() {
    this.youtubeService = YoutubeService;
    this.videoData = {
      videoPath: "src/vdo.mp4",
      title: "Titre de votre vidéo",
      description: "Description de votre vidéo",
      tags: ["developer", "coding"],
      categoryId: "24",
      privacyStatus: "public",
    };
  }

  youtube() {
    return this.youtubeService.uploader(this.videoData);
  }

  tiktok() {}
}

module.exports = { UploaderService };
