import {
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { setServerChannel } from "../../utils/dbutils.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription(
      "Set a channel for SparkDouble to send cards shared from the browser extension into."
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator |
        PermissionFlagsBits.ManageGuild |
        PermissionFlagsBits.ManageChannels
    )
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel for SparkDouble to share into.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const channelOption = interaction.options.get("channel");
    if (
      !channelOption ||
      !channelOption.channel ||
      !(channelOption.channel instanceof TextChannel)
    ) {
      console.error("Interaction channel is missing or is not a TextChannel");
      return;
    }
    const targetChannel = channelOption.channel;

    const setChannelFailEmbed = new EmbedBuilder().setTitle(
      ":x: Could not set channel"
    );

    // if interaction is created from an odd circumstance other than slash command
    if (!targetChannel) {
      setChannelFailEmbed.setDescription(
        "The channel could not be set, this could be due to lack of permissions of removal of the channel."
      );
      return await interaction.reply({ embeds: [setChannelFailEmbed] });
    }

    const targetChannelPermissions =
      interaction.guild?.members.me?.permissionsIn(targetChannel);

    // fail if bot is lacking necessary permissions or has no permissions at all
    if (
      !targetChannelPermissions ||
      !targetChannelPermissions.has([
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
      ])
    ) {
      setChannelFailEmbed.setDescription(
        `SparkDouble has insufficient permissions to operate in channel <#${targetChannel.id}>. Please ensure SparkDouble has both \`ViewChannel\` and \`SendMessages\` permissions.`
      );
      return await interaction.reply({ embeds: [setChannelFailEmbed] });
    }

    // success! set channel in database and send happy message
    try {
      await setServerChannel(interaction.commandGuildId!, targetChannel.id);
    } catch (error) {
      setChannelFailEmbed.setDescription(
        `Could not save new channel. Please try again.`
      );
      return await interaction.reply({ embeds: [setChannelFailEmbed] });
    }

    const successEmbed = new EmbedBuilder()
      .setTitle(":sparkles: Success!")
      .setDescription(
        `Set SparkDouble's target channel to <#${targetChannel.id}>`
      )
      .setColor("Green");
    await interaction.reply({ embeds: [successEmbed] });
  },
};
