/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { log } = require('../log');
const Migration = require('../models/Migration');
const { ask, terminateReadline } = require('./utils');
const { findMaxSemanticVersion } = require('../util');
const { showPossibleMigrations, migrateAll, getUniqueVersions } = require('../migrations/migrateDatabase');
const migrationList = require('../migrations/registerMigration');
const { getConnection, dropConnection } = require('../db');

function findMaxVersion(list) {
	return findMaxSemanticVersion(getUniqueVersions(list));
}

(async () => {
	let toVersion;

	// If there aren't enough args, go interactive.
	const cmdArgs = process.argv;
	if (cmdArgs.length !== 3) {
		try {
			const updateMax = await ask('Do you want to update to the max version? [yes/no]: ');
			if (updateMax.toLowerCase() === 'yes' || updateMax.toLowerCase() === 'y') {
				toVersion = await findMaxVersion(migrationList);
			} else if (updateMax.toLowerCase() === 'no' || updateMax.toLowerCase() === 'n') {
				toVersion = await ask('To Version: ');
			} else {
				terminateReadline('Invalid arguments, please enter [yes/no]');
			}
		} catch (err) {
			terminateReadline('Could not find the max version from the registered migration list');
		}
	} else {
		const response = cmdArgs[2];

		if (response.toLowerCase() === 'highest') {
			toVersion = await findMaxVersion(migrationList);
		} else {
			toVersion = response;
		}
	}

	const conn = getConnection();
	try {
		await Migration.createTable(conn, insertDefault = false);
		const currentVersion = await Migration.getCurrentVersion(conn);
		if (currentVersion === toVersion) {
			terminateReadline(`Cannot migrate. You already have the highest version ${currentVersion}`);
		} else {
<<<<<<< HEAD
			const result = await migrateAll(toVersion, migrationList, conn);
			if (result !== undefined) {
=======
			try {
				await migrateAll(toVersion, migrationList);
>>>>>>> noraObv/obvius
				terminateReadline('Migration successful');
			} catch (err) {
				terminateReadline(`Migration failed: ${err}`);
			}
		}
	} catch (err) {
		log.error('Error while migrating database: ', err);
		log.info(`Possible migrations: \n ${showPossibleMigrations(migrationList)}`);
		terminateReadline('Migration failed');
	}
})();

