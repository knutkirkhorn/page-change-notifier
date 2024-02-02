import dotenv from 'dotenv';
import {z} from 'zod';

// Load the stored variables from `.env` file into process.env
dotenv.config();

const environmentSchema = z.object({
	DISCORD_BOT_TOKEN: z.string().min(1),
	DISCORD_CLIENT_ID: z.string().min(1),
	DISCORD_GUILD_ID: z.string().min(1),
});
const parsedEnvironment = environmentSchema.parse(process.env);

export default {
	discordBotToken: parsedEnvironment.DISCORD_BOT_TOKEN,
	discordClientId: parsedEnvironment.DISCORD_CLIENT_ID,
	discordGuildId: parsedEnvironment.DISCORD_GUILD_ID,
};
