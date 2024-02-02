import {SlashCommandBuilder} from 'discord.js';
import {getWatchingPages} from '../database.js';

export default {
	data: new SlashCommandBuilder()
		.setName('watching')
		.setDescription('Get a list of watching pages'),
	async execute(interaction) {
		const watchingPages = await getWatchingPages();

		if (watchingPages.length === 0) {
			// TODO: possible to link to clickable slash command here?
			await interaction.reply(
				'No pages are being watched. Use the `/watch` command to start watching a page for changes!',
			);
			return;
		}

		await interaction.reply(
			`Watching pages: \n- ${watchingPages.map(page => page.url).join('\n- ')}`,
		);
	},
};
