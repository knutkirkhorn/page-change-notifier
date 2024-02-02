import {REST, Routes} from 'discord.js';
import config from './config.js';
import {readCommandModules} from './util.js';

const commands = [];
const commandModules = await readCommandModules();

for (const commandModule of commandModules) {
	commands.push(commandModule.data.toJSON());
}

const rest = new REST().setToken(config.discordBotToken);

try {
	console.log(
		`Started refreshing ${commands.length} application (/) commands.`,
	);

	const data = await rest.put(
		Routes.applicationGuildCommands(
			config.discordClientId,
			config.discordGuildId,
		),
		{body: commands},
	);

	console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
	console.error(error);
}
