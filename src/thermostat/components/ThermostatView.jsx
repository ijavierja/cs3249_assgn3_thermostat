import React, { Component } from "react";
import * as Functions from "../support/Functions.js";
import * as Constants from "../support/Constants.js";

/**
 * The Main component of the app.
 * Contains the view of the application and the behaviour.
 * 
 * Behaviours:
 * Mouse Hover - when mouse is on the radial pointer or path, the pointer fill changes colour.
 * Dragging - when the pointer is being dragged, a slightly transparent circle surrounds the radial pointer.
 * Radial slider - pointer moves to set the target temp + mouse wheel scroll would set the position of pointer
 */
class ThermostatView extends Component {
  setColour = (mode) => {
    if (mode == Constants.mode.off) {
      return Constants.offColour;
    } else if (mode == Constants.mode.heating) {
      return Constants.heatingColour;
    } else if (mode == Constants.mode.cooling) {
      return Constants.coolingColour;
    } else {
      return mode;
    }
  };

  render() {
    return (
      <React.Fragment>
        <circle
          cx={Constants.cx}
          cy={Constants.cy}
          r={Constants.thermostatRadius}
          fill={this.setColour(this.props.mode)}
          onMouseEnter={this.props.handleMouseEnter}
          onMouseLeave={this.props.handleMouseLeave}
        />
        <TargetTemp targetTemp={this.props.targetTemp} />
        <CurrentTemp currentTemp={this.props.currentTemp} />
        <path
          d={Functions.describeArc(
            Constants.cx,
            Constants.cy,
            177,
            Constants.rightRadialAngle,
            Constants.leftRadialAngle
          )}
          fill="none"
          stroke={this.setColour(this.props.mode)}
          strokeWidth="10"
        />
        <RadialSlider
          handleMouseEnterSlider={this.props.handleMouseEnterSlider}
          handleMouseLeaveSlider={this.props.handleMouseLeaveSlider}
          isHovered={this.props.isHovered}
          targetTemp={this.props.targetTemp}
          handleMouseDown={this.props.handleMouseDown}
          isDragging={this.props.isDragging}
          pointerAngle={this.props.pointerAngle}
          handlePathMouseDown={this.props.handlePathMouseDown}
        />
      </React.Fragment>
    );
  }
}

class TargetTemp extends Component {
  render() {
    return (
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="115"
        fill="white"
        fontStyle="Helvetica Neue"
      >
        {this.props.targetTemp}
      </text>
    );
  }
}

class CurrentTemp extends Component {
  render() {
    return (
      <text
        x="50%"
        y="69%"
        textAnchor="middle"
        fontSize="23"
        fill="white"
        fontStyle="Helvetica Neue"
      >
        Current: {this.props.currentTemp}
      </text>
    );
  }
}

class RadialSlider extends Component {
  render() {
    return (
      <svg>
        <RadialSliderPath
          handleMouseEnterSlider={this.props.handleMouseEnterSlider}
          handleMouseLeaveSlider={this.props.handleMouseLeaveSlider}
          isHovered={this.props.isHovered}
          handlePathMouseDown={this.props.handlePathMouseDown}
        />
        <RadialSliderPointer
          handleMouseEnterSlider={this.props.handleMouseEnterSlider}
          handleMouseLeaveSlider={this.props.handleMouseLeaveSlider}
          isHovered={this.props.isHovered}
          targetTemp={this.props.targetTemp}
          handleMouseDown={this.props.handleMouseDown}
          isDragging={this.props.isDragging}
          pointerAngle={this.props.pointerAngle}
        />
      </svg>
    );
  }
}

class RadialSliderPath extends Component {
  handleClick = (e) => {
    console.log(e.pageX + " " + e.pageY);
  };

  render() {
    return (
      <svg>
        <path
          d={Functions.describeArc(
            Constants.cx,
            Constants.cy,
            Constants.radialRadius,
            Constants.leftRadialAngle,
            Constants.rightRadialAngle + 360
          )}
          fill="none"
          stroke="white"
          strokeWidth="6"
          onMouseEnter={this.props.handleMouseEnterSlider}
          onMouseLeave={this.props.handleMouseLeaveSlider}
          onMouseDown={this.props.handlePathMouseDown}
        />
      </svg>
    );
  }
}
class RadialSliderPointer extends Component {
  render() {
    let pos = Functions.polarToCartesian(
      Constants.cx,
      Constants.cy,
      Constants.radialRadius,
      this.props.pointerAngle
    );

    let cx = pos.x;
    let cy = pos.y;
    return (
      <svg>
        <circle
          cx={cx}
          cy={cy}
          r="16"
          fill="white"
          onMouseEnter={this.props.handleMouseEnterSlider}
          onMouseLeave={this.props.handleMouseLeaveSlider}
          onMouseDown={this.props.handleMouseDown}
          opacity={this.props.isDragging ? "60%" : "0%"}
        />
        <circle
          cx={cx}
          cy={cy}
          r="10"
          fill={this.props.isHovered ? "#C93756" : "white"}
          strokeWidth="1.5"
          stroke="white"
          onMouseEnter={this.props.handleMouseEnterSlider}
          onMouseLeave={this.props.handleMouseLeaveSlider}
          onMouseDown={this.props.handleMouseDown}
        />
      </svg>
    );
  }
}

export default ThermostatView;
