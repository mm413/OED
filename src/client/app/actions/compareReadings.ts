/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as moment from 'moment';
import { TimeInterval } from '../../../common/TimeInterval';
import { Dispatch, Thunk, ActionType } from '../types/redux/actions';
import { State } from '../types/redux/state';
import { CompareReadings } from '../types/readings';
import * as t from '../types/redux/compareReadings';
import { metersApi, groupsApi } from '../utils/api';

/**
 * @param {State} state the Redux state
 * @param {number} meterID the ID of the meter to check
 * @param {TimeInterval} timeInterval the interval over which to check
 * @returns {boolean} True if the readings for the given meter, and time are missing; false otherwise.
 */
function shouldFetchMeterCompareReadings(state: State, meterID: number, timeInterval: TimeInterval, compareShift: moment.Duration): boolean {
	const readingsForID = state.readings.compare.byMeterID[meterID];
	if (readingsForID === undefined) {
		return true;
	}
	const readingsForTimeInterval = readingsForID[timeInterval.toString()];
	if (readingsForTimeInterval === undefined) {
		return true;
	}
	const readingsForCompareShift = readingsForTimeInterval[compareShift.toISOString()];
	if (readingsForCompareShift === undefined) {
		return true;
	}
	return !readingsForCompareShift.isFetching;
}

/**
 * @param {State} state the Redux state
 * @param {number} groupID the ID of the group to check
 * @param {TimeInterval} timeInterval the interval over which to check
 * @returns {boolean} True if the readings for the given group, and time are missing; false otherwise.
 */
function shouldFetchGroupCompareReadings(state: State, groupID: number, timeInterval: TimeInterval, compareShift: moment.Duration): boolean {
	const readingsForID = state.readings.compare.byMeterID[groupID];
	if (readingsForID === undefined) {
		return true;
	}
	const readingsForTimeInterval = readingsForID[timeInterval.toString()];
	if (readingsForTimeInterval === undefined) {
		return true;
	}
	const readingsForCompareShift = readingsForTimeInterval[compareShift.toISOString()];
	if (readingsForCompareShift === undefined) {
		return true;
	}
	return !readingsForCompareShift.isFetching;
}

function requestMeterCompareReadings(meterIDs: number[], timeInterval: TimeInterval, compareShift: moment.Duration):
	t.RequestMeterCompareReadingAction {
	return { type: ActionType.RequestMeterCompareReading, meterIDs, timeInterval, compareShift };
}

function receiveMeterCompareReadings(meterIDs: number[], timeInterval: TimeInterval, compareShift: moment.Duration, readings: CompareReadings):
	t.ReceiveMeterCompareReadingAction {
	return { type: ActionType.ReceiveMeterCompareReading, meterIDs, timeInterval, compareShift, readings };
}

function requestGroupCompareReadings(groupIDs: number[], timeInterval: TimeInterval, compareShift: moment.Duration):
	t.RequestGroupCompareReadingAction {
	return { type: ActionType.RequestGroupCompareReading, groupIDs, timeInterval, compareShift };
}

function receiveGroupCompareReadings(groupIDs: number[], timeInterval: TimeInterval, compareShift: moment.Duration, readings: CompareReadings):
	t.ReceiveGroupCompareReadingAction {
	return { type: ActionType.ReceiveGroupCompareReading, groupIDs, timeInterval, compareShift, readings };
}

/**
 * Fetch the data for the given meters over the given interval. Fully manages the Redux lifecycle.
 * @param {[number]} meterIDs The IDs of the meters whose data should be fetched
 * @param {TimeInterval} timeInterval The time interval over which data should be fetched
 */
function fetchMeterCompareReadings(meterIDs: number[], timeInterval: TimeInterval, compareShift: moment.Duration): Thunk {
	return async (dispatch: Dispatch) => {
		dispatch(requestMeterCompareReadings(meterIDs, timeInterval, compareShift));
		const readings = await metersApi.compareReadings(meterIDs, timeInterval, compareShift);
		dispatch(receiveMeterCompareReadings(meterIDs, timeInterval, compareShift, readings));
	};
}

/**
 * Fetch the data for the given groups over the given interval. Fully manages the Redux lifecycle.
 * @param {[number]} groupIDs The IDs of the groups whose data should be fetched
 * @param {TimeInterval} timeInterval The time interval over which data should be fetched
 */
function fetchGroupCompareReadings(groupIDs: number[], timeInterval: TimeInterval, compareShift: moment.Duration): Thunk {
	return async (dispatch: Dispatch) => {
		dispatch(requestGroupCompareReadings(groupIDs, timeInterval, compareShift));
		const readings = await groupsApi.compareReadings(groupIDs, timeInterval, compareShift);
		dispatch(receiveGroupCompareReadings(groupIDs, timeInterval, compareShift, readings));
	};
}


/**
 * Fetches readings for the compare chart of all selected meterIDs if they are not already fetched or being fetched
 * @param {TimeInterval} timeInterval The time interval to fetch readings for on the compare chart
 * @return {*} An action to fetch the needed readings
 */
export function fetchNeededCompareReadings(timeInterval: TimeInterval, compareShift: moment.Duration): Thunk {
	return (dispatch, getState) => {
		const state = getState();
		const promises: Array<Promise<any>> = [];

		// Determine which meters are missing data for this time interval
		const meterIDsToFetchForCompare = state.graph.selectedMeters.filter(
			id => shouldFetchMeterCompareReadings(state, id, timeInterval, compareShift)
		);
		// Fetch data for any missing meters
		if (meterIDsToFetchForCompare.length > 0) {
			promises.push(dispatch(fetchMeterCompareReadings(meterIDsToFetchForCompare, timeInterval, compareShift)));
		}

		// Determine which groups are missing data for this time interval
		const groupIDsToFetchForCompare = state.graph.selectedGroups.filter(
			id => shouldFetchGroupCompareReadings(state, id, timeInterval, compareShift)
		);
		// Fetch data for any missing groups
		if (groupIDsToFetchForCompare.length > 0) {
			promises.push(dispatch(fetchGroupCompareReadings(groupIDsToFetchForCompare, timeInterval, compareShift)));
		}
		return Promise.all(promises);
	};
}
