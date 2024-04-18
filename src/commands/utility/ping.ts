import { SlashCommandBuilder } from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(
      "Measures the amount of time from creation of command message to creation of response message."
    ),
  async execute(interaction: any) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    interaction.editReply(
      `Roundtrip latency: \`${sent.createdTimestamp - interaction.createdTimestamp}ms\``
    );
  },
};
