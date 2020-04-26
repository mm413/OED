/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const pgp = require('pg-promise')({
	// This sets the style of returned durations so that Moment can parse them
	connect: (client, dc, fresh) => {
		// Only set the style on fresh connections
		if (fresh === true || fresh === undefined) {
			client.query('SET intervalStyle = iso_8601');
		}
	}
});

const path = require('path');
const patchMomentType = require('./patch-moment-type');

patchMomentType(pgp);

/**
 * Create a new connection to the database.
 * @return {pgPromise.IDatabase}
 */
function getDB(connectionParameters) {
	return pgp(connectionParameters);
}

/**
 * Get the name of the database current being worked on.
 * @return {string}
 */
function getCurrentDB() {
	return currentDB;
}

/**
 * Closes the connection pool and stops pg-promise
 * Only call this to avoid the 30 second script timeout before pg-promise closes connections.
 */
function stopDB() {
	pgp.end();
}

const sqlFilesDir = path.join(__dirname, '..', 'sql');
const loadedSqlFiles = {};

/**
 * Load a QueryFile from the sql directory.
 * The QueryFile is loaded once and subsequently cached, so repeated calls to this method will only create a single
 * QueryFile object. See {@link https://github.com/vitaly-t/pg-promise#query-files}
 * @example
 * 	sqlFile('meter/get_all_meters.sql') // Returns an sql file for getting all meters.
 * @param filePath the path to the sql file, relative to the sql directory
 * @returns {pgPromise.QueryFile}
 */
function sqlFile(filePath) {
	const sqlFilePath = path.join(sqlFilesDir, filePath);
	if (loadedSqlFiles[sqlFilePath] === undefined) {
		loadedSqlFiles[sqlFilePath] = new pgp.QueryFile(path.join(sqlFilesDir, filePath), { minify: true });
	}
	return loadedSqlFiles[sqlFilePath];
}

/**
 * Returns a promise to create the database schema.
 * @param conn the connection to be used.
 * @return {Promise<void>}
 */
async function createSchema(conn) {
	// We need to require these here instead of at the top to prevent circular dependency issues.
	/* eslint-disable global-require */
	const Meter = require('./Meter');
	const Reading = require('./Reading');
	const User = require('./User');
	const Group = require('./Group');
	const Preferences = require('./Preferences');
	const Configfile = require('./obvius/Configfile');
	const Migration = require('./Migration');
	const LogEmail = require('./LogEmail');
	const Baseline = require('./Baseline');

	/* eslint-enable global-require */
	await Meter.createMeterTypesEnum();
	await Meter.createTable();
	await Reading.createTable();
	await Reading.createCompressedReadingsFunction();
	await Reading.createCompressedGroupsReadingsFunction();
	await Reading.createBarchartReadingsFunction();
	await Reading.createCompressedGroupsBarchartReadingsFunction();
	await User.createTable();
	await Preferences.createTable();
	await Group.createTables();
	await Migration.createTable();
	await LogEmail.createTable();
	await getDB().none(sqlFile('reading/create_function_get_compressed_readings.sql'));
	await Baseline.createTable();
	await getDB().none(sqlFile('baseline/create_function_get_average_reading.sql'));
	await db.none(sqlFile('reading/create_function_get_compressed_readings.sql'));
	await Configfile.createTable();
}

module.exports = {
	getDB,
	currentDB: getCurrentDB,
	sqlFile,
	createSchema,
	pgp,
	stopDB
};
