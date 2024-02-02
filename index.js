import {setTimeout} from 'node:timers/promises';
import {
	Client,
	Collection,
	EmbedBuilder,
	Events,
	GatewayIntentBits,
} from 'discord.js';
import got from 'got';
import config from './config.js';
import {
	checkAndCreateTable,
	checkIfPageHasChanged,
	getWatchingPages,
} from './database.js';
import {readCommandModules} from './util.js';

const client = new Client({intents: [GatewayIntentBits.Guilds]});

async function getPageContent(url) {
	const response = await got(url);
	const content = await response.body;
	return content;
}

async function checkPagesForChanges() {
	const watchingPages = await getWatchingPages();

	for (const page of watchingPages) {
		console.log('Checking page:', page);

		const pageContent = await getPageContent(page.url);

		const hasChanged = await checkIfPageHasChanged(page.url, pageContent);
		if (hasChanged) {
			console.log('Page has changed:', page);

			const embedMessage = new EmbedBuilder()
				.setTitle('Page has changed')
				.addFields({name: 'URL', value: page.url});

			const channel = await client.channels.fetch(page.channelId);
			if (channel) {
				await channel.send({embeds: [embedMessage]});
			} else {
				console.error(`Channel with ID ${page.channelId} not found.`);
			}
		}
	}
}

client.once(Events.ClientReady, async readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	while (true) {
		console.log('hello');
		await checkPagesForChanges();
		await setTimeout(10_000); // TODO: wait for 1 hour
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await (interaction.replied || interaction.deferred
			? interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				})
			: interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				}));
	}
});

await checkAndCreateTable();

await client.login(config.discordBotToken);

client.commands = new Collection();

const commandModules = await readCommandModules();

for (const commandModule of commandModules) {
	client.commands.set(commandModule.data.name, commandModule);
}
