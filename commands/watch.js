import {SlashCommandBuilder} from 'discord.js';
import {insertInitialPageContent, watchPage} from '../database.js';
import {getPageContent} from '../util.js';

export default {
	data: new SlashCommandBuilder()
		.setName('watch')
		.setDescription('Watch a page for changes')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('The URL to watch')
				.setRequired(true),
		),
	async execute(interaction) {
		const urlToWatch = interaction.options.getString('url');
		const pageId = await watchPage(urlToWatch, interaction.channelId);
		const pageContent = await getPageContent(urlToWatch);
		await insertInitialPageContent(pageId, pageContent);
		// TODO: check if already watching
		// TODO: check for errors
		// TODO: validate if input is a valid URL
		await interaction.reply(`✅ Started watching \`${urlToWatch}\`!`);
	},
};
