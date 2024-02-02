import {SlashCommandBuilder} from 'discord.js';
import {unwatchPage} from '../database.js';

export default {
	data: new SlashCommandBuilder()
		.setName('unwatch')
		.setDescription('Unwatch a page for changes')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('The URL to unwatch')
				.setRequired(true),
		),
	async execute(interaction) {
		const urlToUnwatch = interaction.options.getString('url');
		const deletedRows = await unwatchPage(urlToUnwatch);

		if (deletedRows === 0) {
			await interaction.reply(`❌ \`${urlToUnwatch}\` is not being watched!`);
			return;
		}

		// TODO: check for errors
		// TODO: validate if input is a valid URL
		await interaction.reply(`✅ Stopped watching \`${urlToUnwatch}\`!`);
	},
};
