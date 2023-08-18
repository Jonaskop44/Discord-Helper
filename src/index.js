require("dotenv").config();
const fs = require("fs");
const {
  Client,
  Collection,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});
client.commands = new Collection();

const commandFile = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

commandFile.forEach((commandFile) => {
  const command = require(`./commands/${commandFile}`);
  client.commands.set(command.data.name, command);
});

client.on("ready", () => {
  console.log("Online:");
  console.log(client.user.tag);
  console.log("Servers:" + client.guilds.cache.size);
  client.user.setStatus("online");
  client.user.setPresence({
    activities: [
      {
        name: "deiner Mutter zu",
        type: ActivityType.Watching,
      },
    ],
  });
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.log(error);

        if (interaction.deferred || interaction.replied) {
          interaction.editReply("Es ist ein Fehler aufgetreten.");
        }
      }
    }
  } else {
    return;
  }
});

client.login(process.env.TOKEN);
