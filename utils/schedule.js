const schedule = require("node-schedule");
const IgApiClient = require("instagram-private-api");
const User = require("./models/user"); // Assuming your MongoDB model is in this path

const createScheduler = async () => {
  const ig = new IgApiClient();
  await ig.state.generateDevice({});

  const job = schedule.scheduleJob("* * * * *", async () => {
    // Check for scheduled posts every minute
    const users = await User.find({ numOfPosts: { $gt: 0 } });

    for (const user of users) {
      try {
        await ig.state.restore(user.igUsername); // Restore session for each user
        const feed = await ig.feed.timeline();
        const lastPost = feed.items[0];

        if (lastPost.taken_at > user.updatedAt) {
          // Post has been published since last update
          user.numOfPosts--;
          await user.save();

          console.log(
            `Posted a scheduled post for ${user.firstName} ${user.lastName}`
          );
        }
      } catch (error) {
        console.error(
          `Error posting for ${user.firstName} ${user.lastName}: ${error.message}`
        );
        // You might want to implement error handling or retry logic here
      }
    }
  });

  console.log("Scheduler started");
};

createScheduler();
