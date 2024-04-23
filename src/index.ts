import "dotenv/config";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  ActivityType,
  ChannelType,
  Client,
  Collection,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import { cleanupReverseIndex, putWithReverse } from "./utils/dbutils.js";
import { genSecret } from "./utils/secret.js";
import express from "express";
import cors from "cors";

// TODO: reorganize/refactor file contents for clarity

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// TODO: reorganize events into separate file structure/dir
client.on("ready", (c) => {
  console.log(`${c.user.username} is online`);
});

client.on("guildCreate", (g) => {
  const guildId = g.id;
  cleanupReverseIndex(guildId);
  putWithReverse(guildId, { secret: genSecret(), channelId: "" });

  // TODO: replace "https://example.com", "https://discord.com", and "https://github.com/simon-upton" placeholders with actual links
  const serverJoinEmbed = new EmbedBuilder()
    .setTitle(":wave: Hi There!")
    .setDescription(
      "Thank you for adding me to your server. There's three quick steps before I'm good to go:"
    )
    .setFields(
      {
        name: ":one: Set my channel:",
        value:
          "Before I can start relaying your Magic cards, you must point me at a channel using `/setchannel`",
      },
      {
        name: ":two: Get your secret token:",
        value:
          "A secret token has been generated for your server. Users must input this token to the [SparkDouble browser extension](https://example.com) in order to securely share cards to your Discord server.",
      },
      {
        name: ":three: Share your token:",
        value:
          "Members with `Administrator` or `Manage Server` permissions can use `/token show` to secretly view the token, then share it with trusted server members.",
      },
      {
        name: "\u200B",
        value:
          "~~------------------------------------------------------------------------------------~~",
      },
      {
        name: ":loudspeaker: Official Discord Server:",
        value: "[SparkDouble Discord Server](https://discord.com)",
        inline: true,
      },
      {
        name: ":computer: GitHub Repository:",
        value: "[SparkDouble Repository](https://github.com/simon-upton)",
        inline: true,
      }
    )
    .setColor("Green");

  try {
    const channel = g.channels.cache.find((channel) => {
      if (!client.user) {
        console.error("client is undefined");
        return false;
      }

      const bot = g.members.cache.get(client.user.id);

      if (!bot) {
        console.error("bot is undefined");
        return false;
      }

      const channelPermissions = channel.permissionsFor(bot);
      return (
        channel.type === ChannelType.GuildText &&
        channelPermissions.has("SendMessages") &&
        channelPermissions.has("ViewChannel")
      );
    }) as TextChannel | undefined;

    // if there is no channel to send a message within, DM admins of the server with setup instructions
    if (channel) {
      channel.send({ embeds: [serverJoinEmbed] });
    } else {
      const failedIntroductionEmbed = new EmbedBuilder()
        .setTitle(":warning: Couldn't send introduction message")
        .setDescription(
          `Hi! I couldn't find a channel to send my introduction message in, so I'm messaging all admins from the ${g.name} server to avoid setup confusion :)`
        )
        .setColor("Yellow");

      const admins = g.members.cache.filter((member) => {
        return (
          member.permissions.has("Administrator") ||
          member.permissions.has("ManageGuild")
        );
      });

      for (const admin in admins) {
        client.users.send(admin, { embeds: [failedIntroductionEmbed] });
        client.users.send(admin, { embeds: [serverJoinEmbed] });
      }
    }
  } catch (err) {
    console.error("Error while sending message on guild join:", err);
  }
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
