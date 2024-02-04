import {SlashCommandBuilder} from 'discord.js';
import config from '../config.js';
import {getWatchingPages} from '../database.js';

export default {
	data: new SlashCommandBuilder()
		.setName('watching')
		.setDescription('Get a list of watching pages'),
	async execute(interaction) {
		const watchingPages = await getWatchingPages();

		if (watchingPages.length === 0) {
			const watchCommand = `</watch:${config.commandWatchId}>`;
			await interaction.reply(
				`No pages are being watched. Use the ${watchCommand} command to start watching a page for changes!`,
			);
			return;
		}

		await interaction.reply(
			`Watching pages: \n- ${watchingPages.map(page => page.url).join('\n- ')}`,
		);
	},
};
