const { youtubeUploader } = require("./Youtube/youtube");

class UploaderService {
  videoData = {
    videoPath: "src/vdo.mp4",
    title: "Titre de votre vidéo",
    description: "Description de votre vidéo",
    tags: ["developer", "coding"],
    categoryId: "24",
    privacyStatus: "public",
  };

  youtube() {
    return youtubeUploader(this.videoData);
  }

  tiktok() {}
}

module.exports = { UploaderService };
