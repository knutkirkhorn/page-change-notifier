import knex from 'knex';

const databaseConfig = {
	client: 'sqlite3',
	connection: {
		filename: './data.db',
	},
	useNullAsDefault: true,
};
const knexInstance = knex(databaseConfig);
const checkedTableName = 'watching_pages';

export async function checkAndCreateTable() {
	// Check if database table exists, if not create it
	const tableExists = await knexInstance.schema.hasTable(checkedTableName);
	if (tableExists) return;

	await knexInstance.schema.createTable(checkedTableName, table => {
		table.increments();
		table.string('url');
		table.string('content');
		table.string('channel_id'); // `channel_id` number is too big for integer
		table.datetime('last_checked');
	});
	console.log('Created database table!');
}

export async function watchPage(url, channelId) {
	await knexInstance(checkedTableName).insert({url, channel_id: channelId});
}

export async function unwatchPage(url) {
	const deletedRows = await knexInstance(checkedTableName).where({url}).del();
	return deletedRows;
}

export async function getWatchingPages() {
	const rows = await knexInstance(checkedTableName).select();
	return rows.map(row => ({url: row.url, channelId: row.channel_id}));
}

export async function checkIfPageHasChanged(url, content) {
	const currentPageContent = await knexInstance(checkedTableName)
		.where({url})
		.select('content');

	// TODO: fix this
	if (currentPageContent[0].content !== content) {
		await knexInstance(checkedTableName)
			.where({url})
			.update({content, last_checked: new Date()});
		return true;
	}

	await knexInstance(checkedTableName)
		.where({url})
		.update({last_checked: new Date()});
	return false;
}
