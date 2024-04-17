import "dotenv/config";
import {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import express from "express";
import cors from "cors";
import levelup from "levelup";
import leveldown from "leveldown";
import encode from "encoding-down";
import crypto from "crypto";

const db = levelup(encode(leveldown("./secretsdb")));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const app = express();
const port = 3000;

client.on("ready", (c) => {
  console.log(`${c.user.username} is online`);
});

client.login(process.env.BOT_TOKEN);

app.use(cors(), express.json());

app.post("/card", async (req, res) => {
  // TODO: remove hardcoded IDs used in example
  const channel = (await client.channels.cache.get(
    "1229904974872313946"
  )) as TextChannel;
  const hueId = "214496939226431489";
  const user = await client.users.fetch(hueId).catch(() => null);
  const username: string = user?.username as string;
  const avatarURL: string = user?.avatarURL() as string;
  const exampleEmbed = new EmbedBuilder()
    .setImage(req.body["imgUrl"])
    .setFooter({ text: username, iconURL: avatarURL })
    .setTimestamp();
  await channel.send({ embeds: [exampleEmbed] });
});

app.listen(port, () => {
  console.log(`SparkDouble API listening on port ${port}`);
});

async function main() {
  const secret = crypto.randomBytes(24).toString("hex");
  await db.put("955723237831106560", secret);
  await db.get("955723237831106560");
}

main();
