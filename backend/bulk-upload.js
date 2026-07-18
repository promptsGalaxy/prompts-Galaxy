require("dotenv").config();

const connectDB = require("./config/db");
const Prompt = require("./Prompt");
const sendTelegramPost = require("./telegram");

async function bulkUpload() {
  try {
    await connectDB();

    const posts = await Prompt.find({ mediaType: "image" }).sort({
      createdAt: 1,
    });

    console.log(`Found ${posts.length} posts`);

    for (const post of posts) {
      try {
        await sendTelegramPost(post);

        console.log(`Uploaded: ${post.slug}`);

        // Telegram rate limit avoid cheyyadaniki 10 seconds delay
        await new Promise((resolve) => setTimeout(resolve, 20000));
      } catch (err) {
        console.log(`Failed: ${post.slug}`);
        console.log(err.message);
      }
    }

    console.log("Bulk upload completed.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

bulkUpload();
