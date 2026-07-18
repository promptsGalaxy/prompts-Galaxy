const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN);

const CHANNEL = "@mvrprompts";

async function sendTelegramPost(post) {
  if (post.mediaType !== "image") return;

  const url = `https://www.mvrprompts.com/prompt/${post.slug}`;

  await bot.sendPhoto(CHANNEL, post.mediaUrl, {
    caption: `🔥 View This AI Prompt

👇 Unlock the Full Prompt
${url}


🚀 Explore 1000+ AI Image & Video Prompts
🌐 https://www.mvrprompts.com`,
  });

  console.log("Telegram Uploaded:", post.slug);
}

module.exports = sendTelegramPost;
