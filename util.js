// eslint-disable-next-line unicorn/prevent-abbreviations
import fs from 'node:fs';
import puppeteer from 'puppeteer';

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
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();
		await page.goto(url, {waitUntil: 'networkidle0'});
		const content = await page.content();
		return {data: content, error: undefined};
	} catch (error) {
		return {data: undefined, error};
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
