const { uploadVideo } = require("./Youtube/youtube");

class UploaderService {
  video = {
    videoPath: "src/vdo.mp4",
    title: "Titre de votre vidéo",
    description: "Description de votre vidéo",
    tags: ["tag1", "tag2", "tag3"],
    categoryId: "24",
    privacyStatus: "public",
  };

  youtube() {
    return uploadVideo;
  }

  tiktok() {}
}

module.exports = { UploaderService };
