import {setTimeout} from 'node:timers/promises';
import {
	Client,
	Collection,
	EmbedBuilder,
	Events,
	GatewayIntentBits,
} from 'discord.js';
import config from './config.js';
import {
	checkAndCreateTable,
	checkIfPageHasChanged,
	getWatchingPages,
	updateLastChecked,
} from './database.js';
import {getPageContent, readCommandModules} from './util.js';

const MILLISECONDS_IN_HOUR = 3_600_000;

const client = new Client({intents: [GatewayIntentBits.Guilds]});

async function checkPagesForChanges() {
	const watchingPages = await getWatchingPages();

	for (const page of watchingPages) {
		console.log('Checking page:', page);

		// Skip the page if it has been checked in the last hour
		if (page.lastChecked > new Date(Date.now() - MILLISECONDS_IN_HOUR)) {
			console.log('Skipping page, checked in last hour');
			continue;
		}

		const {data: pageContent, error} = await getPageContent(page.url);

		if (error) {
			console.error(`Error getting page content for ${page.url}:`, error);

			const embedMessage = new EmbedBuilder()
				.setTitle('Error getting page content')
				.addFields({name: 'URL', value: page.url})
				.addFields({name: 'Error', value: error.message})
				.setColor('Red');

			const channel = await client.channels.fetch(page.channelId);
			if (channel) {
				await channel.send({embeds: [embedMessage]});
			} else {
				console.error(`Channel with ID ${page.channelId} not found.`);
			}

			await updateLastChecked(page.url);

			continue;
		}

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
		await checkPagesForChanges();
		await setTimeout(MILLISECONDS_IN_HOUR);
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
