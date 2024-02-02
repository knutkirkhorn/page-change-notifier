import fs from 'node:fs';

export async function readCommandModules() {
	const commandDirectorySubPaths = fs.readdirSync('./commands');
	const commandModules = [];

	for (const filePath of commandDirectorySubPaths) {
		const commandsPath = `./commands/${filePath}`;

		if (!filePath.endsWith('.js')) {
			// eslint-disable-next-line no-continue
			continue;
		}

		const commandModule = await import(commandsPath);
		const command = commandModule.default;

		if ('data' in command && 'execute' in command) {
			commandModules.push(command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}

	return commandModules;
}
