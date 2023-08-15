require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const commands = [];
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

commandFiles.forEach((commandFile) => {
  const command = require(`./commands/${commandFile}`);
  commands.push(command.data.toJSON());
});

const restClient = new REST({ version: "10" }).setToken(process.env.TOKEN);
restClient
  .put(
    Routes.applicationGuildCommands(
      process.env.APPLICATION_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
