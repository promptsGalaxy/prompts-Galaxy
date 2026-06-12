require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const Prompt = require("./Prompt");
const Ad = require("./Ad");

const app = express();

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://prompts-galaxy.vercel.app/"],
  }),
);
app.use(express.json());

/* =========================
   GET PROMPTS
========================= */
app.get("/api/prompts", async (req, res) => {
  try {
    const { mediaType, category, search } = req.query;

    const query = {};

    if (mediaType) {
      query.mediaType = mediaType;
    }

    if (category && category !== "all") {
      query.Category = category;
    }

    if (search) {
      query.Prompt = {
        $regex: search,
        $options: "i",
      };
    }

    const data = await Prompt.aggregate([
      { $match: query },
      { $sample: { size: 100 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   GET CATEGORIES
========================= */
app.get("/api/categories", async (req, res) => {
  try {
    res.json(["men", "women", "couple", "kid"]);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const data = await Prompt.find({
      Prompt: {
        $regex: q,
        $options: "i",
      },
    }).limit(50);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   INCREASE PROMPT VIEW
========================= */
app.post("/api/prompts/:id/view", async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      },
    );

    res.json(prompt);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   TRENDING PROMPTS
========================= */
app.get("/api/trending", async (req, res) => {
  try {
    const data = await Prompt.aggregate([
      {
        $sort: {
          views: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $sample: {
          size: 20,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   GET ADS WITH PRIORITY
========================= */
app.get("/api/ads", async (req, res) => {
  try {
    const ads = await Ad.find({
      active: true,
    });

    if (!ads.length) {
      return res.status(404).json({
        message: "No active ads found",
      });
    }

    const weightedAds = [];

    ads.forEach((ad) => {
      const priority = Math.max(1, Math.min(10, ad.priority || 1));

      for (let i = 0; i < priority; i++) {
        weightedAds.push(ad);
      }
    });

    for (let i = weightedAds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [weightedAds[i], weightedAds[j]] = [weightedAds[j], weightedAds[i]];
    }

    res.json(weightedAds);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   AD VIEW COUNT
========================= */
app.post("/api/ads/:id/view", async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, {
      $inc: {
        views: 1,
      },
    });

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   AD CLICK COUNT
========================= */
app.post("/api/ads/:id/click", async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, {
      $inc: {
        clicks: 1,
      },
    });

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   SERVER
========================= */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
