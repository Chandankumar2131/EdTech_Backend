const cloudinary = require("cloudinary");

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    const options = { folder };

    if (height) options.height = height;
    if (quality) options.quality = quality;

    if (file.mimetype && file.mimetype.startsWith("video")) {
        options.resource_type = "video";

        // ✅ Wrap upload_large inside a Promise
        return new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_large(
                file.tempFilePath,
                options,
                (error, result) => {
                    if (error) {
                        console.error("❌ Cloudinary upload_large error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    } else {
        options.resource_type = "auto";
        return await cloudinary.v2.uploader.upload(file.tempFilePath, options);
    }
};
