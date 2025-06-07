// eslint-disable-next-line unicorn/prevent-abbreviations
import fs from 'node:fs';
import got from 'got';

export async function readCommandModules() {
	const commandDirectorySubPaths = fs.readdirSync('./commands');
	const commandModules = [];

	for (const filePath of commandDirectorySubPaths) {
		const commandsPath = `./commands/${filePath}`;

		if (!filePath.endsWith('.js')) {
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

export async function getPageContent(url) {
	try {
		const response = await got(url);
		return {data: response.body, error: undefined};
	} catch (error) {
		return {data: undefined, error};
	}
}
