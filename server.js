const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const { MONGODB_URI } = process.env;

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

connectToDB();

const playerSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true },
    position: { type: String, required: true },
    goalsScored: { type: Number, required: true },
    assists: { type: Number, required: true },
    yellowCards: { type: Number, required: true },
    redCards: { type: Number, required: true },
    minutesPlayed: { type: Number, required: true },
  },
  { collection: "soccerTeam" }
);

const Player = mongoose.model("Player", playerSchema);

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app
  .route("/players")
  .get(async (req, res) => {
    const players = await Player.find().catch(() =>
      res.status(500).json({ error: "Failed to fetch players" })
    );
    res.json(players);
  })
  .post(async (req, res) => {
    const player = new Player(req.body);
    await player
      .save()
      .catch(() => res.status(500).json({ error: "Failed to create player" }));
    res.status(201).json(player);
  });

app
  .route("/players/:id")
  .get(async (req, res) => {
    const player = await Player.findById(req.params.id).catch(() =>
      res.status(500).json({ error: "Failed to fetch player" })
    );
    player
      ? res.json(player)
      : res.status(404).json({ error: "Player not found" });
  })
  .put(async (req, res) => {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).catch(() => res.status(500).json({ error: "Failed to update player" }));
    player
      ? res.json(player)
      : res.status(404).json({ error: "Player not found" });
  })
  .delete(async (req, res) => {
    const player = await Player.findByIdAndDelete(req.params.id).catch(() =>
      res.status(500).json({ error: "Failed to delete player" })
    );
    player
      ? res.json({ message: "Player deleted successfully" })
      : res.status(404).json({ error: "Player not found" });
  });

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
