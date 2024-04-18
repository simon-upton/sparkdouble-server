import "dotenv/config";
import { REST, Routes } from "discord.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const clientId = process.env.CLIENT_ID as string;
const guildId = process.env.GUILD_ID as string;
const token = process.env.BOT_TOKEN as string;

const commands = [];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // Refresh all commands
    // TODO: create interface for rest API response instead of 'any'
    const data: any = await rest.put(
      // TODO: replace with Routes.applicationCommands(clientId) on release
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
