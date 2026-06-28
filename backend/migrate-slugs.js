require("dotenv").config();

const connectDB = require("./config/db");
const Prompt = require("./Prompt");

function createSlug(text = "") {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 8) // First 8 words only
    .join("-");

  const random = Math.random().toString(36).substring(2, 7);

  return `${words}-${random}`;
}

async function migrateSlugs() {
  try {
    await connectDB();

    const prompts = await Prompt.find();

    console.log(`Found ${prompts.length} prompts`);

    for (const prompt of prompts) {
      let baseSlug = createSlug(prompt.Prompt || "prompt");
      let slug = baseSlug;

      let count = 1;

      while (
        await Prompt.findOne({
          slug,
          _id: { $ne: prompt._id },
        })
      ) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      prompt.slug = slug;

      await prompt.save();

      console.log(`✔ Updated: ${slug}`);
    }

    console.log("🎉 Slug migration completed.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateSlugs();
