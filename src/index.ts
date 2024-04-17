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
  console.log(`Example app listening on port ${port}`);
});
