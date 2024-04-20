import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageComponentInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { resetSecret } from "../../utils/dbutils.js";
import { getByServerId } from "../../utils/dbutils.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("token")
    .setDescription(
      "Show or reset your server's secret token used in the SparkDouble browser extension."
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("show")
        .setDescription("Privately displays your server's secret token.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription(
          "Resets your server's secret token. Use only when your token has been leaked or corrupted."
        )
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageGuild
    )
    .setDMPermission(false),
  async execute(interaction: any) {
    if (interaction.options.getSubcommand() === "show") {
      try {
        const secret = (await getByServerId(interaction.guild.id)).secret;

        const showTokenEmbed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(":coin: Your server's secret token:")
          .setDescription(`\`${secret}\``);
        await interaction.reply({ embeds: [showTokenEmbed], ephemeral: true });
      } catch (err) {
        console.error("Error fetching secret:", err);
        const failEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle(":warning: Something has gone wrong")
          .setDescription(
            "Your server's secret appears to be inaccessible. Please use `/token reset` to reset it."
          );
        await interaction.reply({ embeds: [failEmbed], ephemeral: true });
      }
    } else if (interaction.options.getSubcommand() === "reset") {
      const confirm = new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm Reset")
        .setStyle(ButtonStyle.Danger);

      const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(cancel, confirm);

      const warningEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(":warning: Are you sure you want to reset your secret token?")
        .setDescription(
          "This action will require all browser extension users to re-enter the new token. \n*This should only be done when the secret token has been leaked or is corrupted/non-functional*."
        );

      const response = await interaction.reply({
        embeds: [warningEmbed],
        components: [row],
      });

      const collectorFilter = (i: MessageComponentInteraction) =>
        i.user.id === interaction.user.id;

      try {
        const confirmation = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 60_000,
        });

        if (confirmation.customId === "confirm") {
          const guildId = interaction.guild.id;
          try {
            await resetSecret(guildId);
            const successEmbed = new EmbedBuilder()
              .setColor("Green")
              .setTitle(":recycle: Secret token reset.")
              .setDescription("Use `/token show` to view your new token.");

            await confirmation.update({
              embeds: [successEmbed],
              components: [],
            });
          } catch (err) {
            console.error("Error:", err);
            const failEmbed = new EmbedBuilder()
              .setColor("Red")
              .setTitle(":warning: Something has gone wrong")
              .setDescription(
                "Your token has been reset, but you must use `/setchannel` to target a channel once again (it can be the same channel)."
              );
            await resetSecret(guildId, true);
            await confirmation.update({
              embeds: [failEmbed],
              components: [],
            });
          }
        } else if (confirmation.customId === "cancel") {
          const cancelEmbed = new EmbedBuilder()
            .setColor("LightGrey")
            .setTitle(":wastebasket: Action cancelled.");

          await confirmation.update({
            embeds: [cancelEmbed],
            components: [],
          });
        }
      } catch (e) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor("LightGrey")
          .setTitle(
            ":wastebasket: Confirmation not received within 1 minute, cancelling."
          );

        await interaction.editReply({
          embeds: [timeoutEmbed],
          components: [],
        });
      }
    }
  },
};
