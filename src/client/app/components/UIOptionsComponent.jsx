import React from 'react';


export default class UIOptionsComponent extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const labelStyle = {
			textDecoration: 'underline'
		};
		const divPadding = {
			paddingTop: '35px'
		};
		return (
			<div className="col-md-2" style={divPadding}>
				<p style={labelStyle}>Energy Type:</p>
				<div className="radio">
					<label><input type="radio" name="energyTypes" value="Electricity" defaultChecked />Electricity</label>
				</div>
				<div className="radio">
					<label><input type="radio" name="energyTypes" value="Wind" />Wind</label>
				</div>
				<div className="radio">
					<label><input type="radio" name="energyTypes" value="NaturalGas" />Natural Gas</label>
				</div>
				<div className="radio">
					<label><input type="radio" name="energyTypes" value="Solar" />Solar</label>
				</div>
				<br />
				<p style={labelStyle}>Graph Type:</p>
				<div className="radio">
					<label><input type="radio" name="graphTypes" value="Bar" defaultChecked />Bar</label>
				</div>
				<div className="radio">
					<label><input type="radio" name="graphTypes" value="Line" />Line</label>
				</div>
				<div className="radio">
					<label><input type="radio" name="graphTypes" value="Map" />Map</label>
				</div>
				<br />
				<div className="checkbox">
					<label><input type="checkbox" value="overlayweather" />Overlay Weather</label>
				</div>
				<div className="checkbox">
					<label><input type="checkbox" value="scaling" />kWh/m scaling</label>
				</div>
				<br />
				<button type="button" id="changeButton" className="btn btn-primary">Change!</button>
			</div>
		);
	}
}