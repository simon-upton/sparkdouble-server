import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { getServerChannel } from "../../utils/dbutils.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Display basic info about your SparkDouble bot.")
    .setDMPermission(false),
  async execute(interaction: CommandInteraction) {
    // safe assertion because DM command invocation is disabled
    const activeChannel = await getServerChannel(interaction.commandGuildId!);
    let description = `Version: \`${process.env.npm_package_version}\`\nActive Channel: <#${activeChannel}>\nPing: \`pinging...\``;
    const infoEmbed = new EmbedBuilder()
      .setTitle(":information_source: Bot Information:")
      .setDescription(description)
      .setColor("Blurple");
    const sent = await interaction.reply({
      embeds: [infoEmbed],
      fetchReply: true,
    });
    const ping = (
      sent.createdTimestamp - interaction.createdTimestamp
    ).toString();
    description = description.replace("pinging...", `${ping}ms`);
    infoEmbed.setDescription(description);
    interaction.editReply({ embeds: [infoEmbed] });
  },
};
