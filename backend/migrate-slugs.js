require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Prompt = require("./Prompt");

function createSlug(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function migrateSlugs() {
  try {
    await connectDB();

    const prompts = await Prompt.find();

    console.log(`Found ${prompts.length} prompts`);

    for (const prompt of prompts) {
      // ఇప్పటికే slug ఉంటే skip చేయి
      if (prompt.slug) continue;

      let baseSlug = createSlug(prompt.Prompt || "prompt");
      let slug = baseSlug;

      // Duplicate slug ఉంటే unique చేయి
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

      console.log(`✔ ${prompt.Prompt} -> ${slug}`);
    }

    console.log("🎉 Slug migration completed.");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateSlugs();
