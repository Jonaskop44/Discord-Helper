const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Zeigt dir deinen Ping an"),
  async execute(interaction) {
    const sentTimestamp = Date.now();
    const reply = await interaction.reply("Pinging...");

    const latency = reply.createdTimestamp - sentTimestamp;
    interaction.editReply(` Ping: ${latency}ms`);
  },
};
