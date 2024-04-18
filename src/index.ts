import "dotenv/config";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  ActivityType,
  Client,
  Collection,
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

// TODO: reorganize/refactor file contents for clarity

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = levelup(encode(leveldown("./secretsdb")));

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: {
    activities: [
      { name: "🌐 Sharing your cards :)", type: ActivityType.Custom },
    ],
    status: "online",
  },
});

client.commands = new Collection();

// dynamically load all commands from ./commands
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(filePath)).command;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on("ready", (c) => {
  console.log(`${c.user.username} is online`);
});

client.login(process.env.BOT_TOKEN);

const app = express();
const port = 3000;

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
