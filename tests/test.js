const client = require('./client');

client.NewProvider('tests/test.json').then(async (provider) => {
	console.log('success init');
	const created = await client.test.createModel(provider, 13, 37);
	const cr = await client.test.getModels(provider, ['a', 'b']);
	console.log(cr);
	await (created.a = 14);
	const got = await client.test.getModels(provider, ['a']);
	console.log(got);
	await created.delete();
	const empty = await client.test.getModels(provider, ['a', 'b']);
	console.log(empty);
	await provider.disconnect();
});