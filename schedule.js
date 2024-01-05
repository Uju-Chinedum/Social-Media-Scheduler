const schedule = require("node-schedule");
const IgApiClient = require("instagram-private-api");
const Post = require("./models/Post");
const User = require("./models/User");
const fs = require("fs");
const util = require("util");

const MAX_RETRIES = 3;
const unlinkAsync = util.promisify(fs.unlink);

const createScheduler = async () => {
  const ig = new IgApiClient();
  await ig.state.generateDevice({});

  const job = schedule.scheduleJob("* * * * *", async () => {
    // Check every minute
    const now = new Date();
    const posts = await Post.find({
      scheduledDate: { $lte: now },
      scheduledTime: { $lte: now.toLocaleTimeString() },
      isPosted: false,
    }).populate("user");

    for (const post of posts) {
      let user;
      let retries = 0;

      while (retries < MAX_RETRIES) {
        try {
          user = await User.findById(post.user);
          await ig.state.restore(user.igUsername);

          if (
            post.media.length > 1 &&
            post.media.every((item) => item.type === "image")
          ) {
            const mediaPaths = post.media.map((item) => item.filePath);
            await ig.publish.carousel(mediaPaths, post.content);
          } else {
            const mediaPromises = post.media.map(async (mediaItem) => {
              if (mediaItem.type === "image") {
                const stream = fs.createReadStream(mediaItem.filePath); // Use stream for images
                return await ig.publish.uploadPhoto({
                  stream,
                  caption: post.content,
                });
              } else if (mediaItem.type === "video") {
                const stream = fs.createReadStream(mediaItem.filePath);
                return await ig.publish.uploadVideo({
                  stream,
                  caption: post.content,
                });
              }
            });

            await Promise.all(mediaPromises);
          }

          await cleanupMediaFiles(post.media);

          post.isPosted = true;
          await post.save();
          user.numOfPosts--;
          await user.save();

          console.log(
            `Posted a scheduled post for ${user.firstName} ${user.lastName}`
          );

          break;
        } catch (error) {
          console.error(
            `Error posting for ${
              user ? `${user.firstName} ${user.lastName}` : "Unknown User"
            }: ${error.message}`
          );

          retries++;
          console.log(`Retrying... (Attempt ${retries}/${MAX_RETRIES})`);

          // Add delay before retrying (e.g., exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, retries))
          );
        }
      }
    }
  });

  console.log("Scheduler started");
};

const cleanupMediaFiles = async (media) => {
  try {
    const unlinkPromises = media.map(async (mediaItem) => {
      await unlinkAsync(mediaItem.filePath);
      console.log(`Deleted file: ${mediaItem.filePath}`);
    });

    await Promise.all(unlinkPromises);
  } catch (error) {
    console.error(`Error cleaning up media files: ${error.message}`);
  }
};

createScheduler();
