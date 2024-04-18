import { SlashCommandBuilder } from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(
      "Measures roundtrip latency. Used for speed/latency testing."
    ),
  async execute(interaction: any) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    // Measures the amount of time from creation of command message to creation of response message
    interaction.editReply(
      `Roundtrip latency: \`${sent.createdTimestamp - interaction.createdTimestamp}ms\``
    );
  },
};
