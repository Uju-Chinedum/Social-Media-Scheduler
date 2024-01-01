const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: [true, "Please provide a content for your post."],
  },
  media: [
    {
      type: {
        type: String,
        required: [true, "Please enter a correct media type"],
        enum: {
          values: ["image", "video"],
          message: "{VALUE} is not supported",
        },
      },
      filePath: {
        type: String, // URL or file path to the media
        required: [true, "Please provide a media file"],
      },
    },
  ],
  scheduledDate: {
    type: Date,
    required: [true, "Please enter a date for the post to be scheduled"],
  },
  scheduledTime: {
    type: String,
    required: [true, "Please enter a time for the post to be scheduled"],
  },
  isPosted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Post", PostSchema);
