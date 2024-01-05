const schedule = require("node-schedule");
const IgApiClient = require("instagram-private-api");
const Post = require("./models/post");
const User = require("./models/user");

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
    });

    for (const post of posts) {
      try {
        const user = await User.findById(post.user);
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
              return await ig.publish.uploadPhoto({
                filePath: mediaItem.filePath,
                caption: post.content,
              });
            } else if (mediaItem.type === "video") {
              return await ig.publish.uploadVideo({
                filePath: mediaItem.filePath,
                caption: post.content,
              });
            }
          });

          await Promise.all(mediaPromises);
        }

        post.isPosted = true;
        await post.save();
        user.numOfPosts--;
        await user.save();

        console.log(
          `Posted a scheduled post for ${user.firstName} ${user.lastName}`
        );
      } catch (error) {
        console.error(
          `Error posting for ${user.firstName} ${user.lastName}: ${error.message}`
        );
        // Implement error handling and retry logic
      }
    }
  });

  console.log("Scheduler started");
};

createScheduler();
