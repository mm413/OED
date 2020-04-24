/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const database = require('../../models/database');
const sqlFile = database.sqlFile;

module.exports = {
	fromVersion: '0.3.0',
	toVersion: '0.4.0',
	up: async db => {
		await db.none(sqlFile('../migrations/0.3.0-0.4.0/sql/preferences/create_language_types_enum.sql'));
		await db.none(sqlFile('../migrations/0.3.0-0.4.0/sql/preferences/add_language_column.sql'));
		await db.none(sqlFile('../migrations/0.3.0-0.4.0/sql/logemail/create_log_table.sql'));
		await db.none(sqlFile('../migrations/0.3.0-0.4.0/sql/baseline/create_baseline_table.sql'));
		await db.none(sqlFile('../migrations/0.3.0-0.4.0/sql/baseline/create_function_get_average_reading.sql'));
		await db.none(sqlFile('../migrations/0.3.0-0.4.0/sql/readings/set_reading_type_to_real.sql'));
		await db.none(sqlFile('../migrations/0.3.0-0.4.0/sql/obvius/create_config_table.sql'));
	}
}

