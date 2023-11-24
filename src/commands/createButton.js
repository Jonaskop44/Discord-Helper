const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  Component,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a help button"),
  async execute(interaction) {
    //Discord-Server Button
    const confirm = new ButtonBuilder()
      .setCustomId("help")
      .setLabel("Help!")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(confirm);
    const reply = await interaction.reply({
      content: `If you need help, click the button!`,
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.BUTTON,
    });

    //When Button is klicked
    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      if (interaction.customId === "help") {
        const userInstructing = interaction.user;
        try {
          userInstructing.send("The authorized persons have been notified!");
        } catch (error) {
          console.log(error);
        }

        //Get all Helper
        const helper = interaction.guild.roles.cache.find(
          (role) => role.name === "Helper"
        );
        if (helper) {
          try {
            //Helper Buttons
            const confirm = new ButtonBuilder()
              .setCustomId("can")
              .setLabel("I can help!")
              .setStyle(ButtonStyle.Success);

            const deny = new ButtonBuilder()
              .setCustomId("cant")
              .setLabel("I cant help!")
              .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(confirm, deny);

            //Send message to all helpers that not that person is asking for help
            helper.members.forEach(async (member) => {
              if (member.id !== userInstructing.id) {
                try {
                  const helperMessage = await member.send({
                    content: `The user ${userInstructing.username} needs help!`,
                    components: [row],
                  });
                  console.log("Message sent");

                  const helperCollector =
                    helperMessage.createMessageComponentCollector({
                      componentType: ComponentType.BUTTON,
                    });

                  helperCollector.on("collect", async (interaction) => {
                    await interaction.deferUpdate();

                    //Helper can help
                    if (interaction.customId === "can") {
                      const user = interaction.user;
                      try {
                        user.send("You have been registered as a helper!");
                        userInstructing.send(`✅ ${user.username} helps you!`);

                        //Send message to all other helpers
                        helper.members.forEach(async (member) => {
                          if (member.id !== user.id) {
                            if (member.id !== userInstructing.id) {
                              try {
                                member.send(
                                  `You no longer need to help! ${user.username} helps ${userInstructing.username}!`
                                );
                              } catch (error) {
                                console.log(error);
                              }
                            }
                          }
                        });
                        confirm.setDisabled(true);
                        deny.setDisabled(true);
                        row.components = [confirm, deny];
                        await helperMessage.edit({ components: [row] });
                      } catch (error) {
                        console.log(error);
                      }
                      return;
                    }

                    //Helper can't help
                    if (interaction.customId === "cant") {
                      const user = interaction.user;
                      try {
                        user.send("You were signed out as a helper!");
                        userInstructing.send(
                          `❌ ${user.username} can't help you!`
                        );
                        confirm.setDisabled(true);
                        deny.setDisabled(true);
                        row.components = [confirm, deny];
                        await helperMessage.edit({ components: [row] });
                      } catch (error) {
                        console.log(error);
                      }
                      return;
                    }
                  });
                } catch (error) {
                  console.log(error);
                }
              }
            });
          } catch (error) {
            console.log(error);
          }
        }
        return;
      }
    });
  },
};
