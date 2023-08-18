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
    .setDescription("Erstellt einen Hilfe Button"),
  async execute(interaction) {
    //Check if user is allowed to use this command
    const allowedUsers = "462268557783203840";
    if (interaction.user.id !== allowedUsers) {
      await interaction.reply(
        "Du bist nicht berechtigt diesen Command zu nutzen!"
      );
      return;
    }

    //Discord-Server Button
    const confirm = new ButtonBuilder()
      .setCustomId("help")
      .setLabel("Hilfe!")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(confirm);
    const reply = await interaction.reply({
      content: `Wenn du hilfe brauchst, drücke den Button!`,
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
          userInstructing.send(
            "Die berechtigten Personen wurden benachrichtigt!"
          );
        } catch (error) {
          console.log(error);
        }

        //Get all Helper
        const helper = interaction.guild.roles.cache.find(
          (role) => role.name === "Helfer"
        );
        if (helper) {
          try {
            //Helper Buttons
            const confirm = new ButtonBuilder()
              .setCustomId("can")
              .setLabel("Ich kann helfen!")
              .setStyle(ButtonStyle.Success);

            const deny = new ButtonBuilder()
              .setCustomId("cant")
              .setLabel("Ich kann nicht helfen!")
              .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(confirm, deny);

            //Send message to all helpers that not that person is asking for help
            helper.members.forEach(async (member) => {
              if (member.id !== userInstructing.id) {
                try {
                  const helperMessage = await member.send({
                    content: `Der User ${userInstructing.username} braucht Hilfe!`,
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
                        user.send("Du wurdest als Helfer eingetragen!");
                        userInstructing.send(`✅ ${user.username} hilft dir!`);

                        //Send message to all other helpers
                        helper.members.forEach(async (member) => {
                          if (member.id !== user.id) {
                            if (member.id !== userInstructing.id) {
                              try {
                                member.send(
                                  `Du brauchst nicht mehr helfen! ${user.username} hilft nun ${userInstructing.username}!`
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
                        user.send("Du wurdest als Helfer ausgetragen!");
                        userInstructing.send(
                          `❌ ${user.username} kann nicht helfen!`
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
