/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const md5 = require('md5');
const moment = require('moment');

const recreateDB = require('./common').recreateDB;
const Configfile = require('../../models/obvius/Configfile');
const listConfigfiles = require('../../services/obvius/listConfigfiles');

const mocha = require('mocha');

function expectConfigfilesToBeEquivalent(expected, actual) {
	expect(actual).to.have.property('id', expected.id);
	expect(actual).to.have.property('serialId', expected.serialId);
	expect(actual).to.have.property('modbusId', expected.modbusId);
	expect(actual).to.have.property('created');
	expect(actual.created.toISOString()).to.equal(expected.created.toISOString());
	expect(actual).to.have.property('hash', expected.hash);
	expect(actual).to.have.property('contents', expected.contents);
	expect(actual).to.have.property('processed', expected.processed);
}

mocha.describe('Configfiles', () => {
	mocha.beforeEach(recreateDB);
	mocha.it('can be saved and retrieved', async () => {
		const contents = 'Some test contents for the log file.';
		const chash = md5(contents);
		const configfilePreInsert = new Configfile(undefined, '0', 'md1', moment(), chash, contents, false);
		await configfilePreInsert.insert();
		const configfilePostInsertByID = await Configfile.getByID(1);
		expectConfigfilesToBeEquivalent(configfilePreInsert, configfilePostInsertByID);
	});
	mocha.it('can be retrieved by serial ID', async () => {
		const configfile1 = new Configfile(undefined, '0', 'md1', moment().subtract(1, 'd'), md5('contents'), 'contents', true);
		const configfile2 = new Configfile(undefined, '0', 'md1', moment(), md5('contents'), 'contents', true);
		const configfile3 = new Configfile(undefined, '1', 'md2', moment(), md5('contents'), 'contents', true);
		await configfile1.insert();
		await configfile2.insert();
		await configfile3.insert();

		// Test correct length.
		const configfilesForAllZeroes = await Configfile.getBySerial('0');
		expect(configfilesForAllZeroes).to.have.length(2);
		const configfilesForOneOne = await Configfile.getBySerial('1');
		expect(configfilesForOneOne).to.have.length(1);

		// Test correct ordering.
		expectConfigfilesToBeEquivalent(configfilesForAllZeroes[0], configfile1);
		expectConfigfilesToBeEquivalent(configfilesForAllZeroes[1], configfile2);
	});
	mocha.it('can generate an Obvius config manifest', async () => {
		const configfile1 = new Configfile(undefined, '0', 'md1', moment('1970-01-01'), md5('contents1'), 'contents1', true);
		const configfile2 = new Configfile(undefined, '0', 'md1', moment('1970-01-02'), md5('contents2'), 'contents2', true);
		const configfile3 = new Configfile(undefined, '0', 'md1', moment('1970-01-03'), md5('contents3'), 'contents3', true);

		await configfile1.insert();
		await configfile2.insert();
		await configfile3.insert();

		//tslint:disable-next-line max-line-length
		const expectation = 'CONFIGFILE,0-mb-md1.ini,4891e2a24026da4dea5b4119e1dc1863,1970-01-01 12:00:00\nCONFIGFILE,0-mb-md1.ini,b2d0efbdc48f4b7bf42f8ab76d71f84e,1970-01-02 12:00:00\nCONFIGFILE,0-mb-md1.ini,2635f317ed53a4fc4014650181fa7ccd,1970-01-03 12:00:00\n';

		expect(await listConfigfiles()).to.equal(expectation);
	});
});
