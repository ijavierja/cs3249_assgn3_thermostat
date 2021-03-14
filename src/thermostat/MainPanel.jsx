import React, { Component } from "react";
import "./MainPanel.css";
import * as Functions from "./support/Functions.js";
import * as Constants from "./support/Constants.js";
import ThermostatView from "./components/ThermostatView.jsx";
import UnitSymbol from "./components/UnitSymbol.jsx";
import SymbolHot from "./components/SymbolHot.jsx";
import SymbolCold from "./components/SymbolCold.jsx";

/**
 * Container class for other Components.
 * Single-source of truth where state and properties are stored.
 * Class that contains the behaviour when events are triggered.
 * 
 * X state not implemented yet.
 * Triggering events are done by firing events such as OnMouseDown, etc. 
 * Should be replaced with listener and publisher.
 * As of now, unsure how this can be done.
 */
class MainPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTemp: Constants.initialCurrentTemp,
      targetTemp: Constants.initialTargetTemp,
      mode: Constants.mode.off,
      isDragging: false,
      isHovered: false,
      pointerAngle: Functions.valueToAngle(
        Constants.leftRadialAngle,
        Constants.rightRadialAngle,
        Constants.minTt,
        Constants.maxTt,
        Constants.initialTargetTemp
      ),
    };
  }

  /**
   * Determines the mode based on the given current temperature, target temperature, and the current mode.
   * 
   * @returns 
   * mode
   */
  updateMode = (currentTemp, targetTemp, mode) => {
    if (currentTemp >= targetTemp + Constants.dT + Constants.dTcool) {
      return Constants.mode.cooling;
    } else if (currentTemp <= targetTemp - Constants.dT - Constants.dTheat) {
      return Constants.mode.heating;
    } else if (
      (mode === Constants.mode.cooling &&
        currentTemp <= targetTemp - Constants.dT) ||
      (mode === Constants.mode.heating &&
        currentTemp >= targetTemp + Constants.dT)
    ) {
      return Constants.mode.off;
    }
    return mode;
  };

  increaseCurrent = () => {
    let newCurrentTemp;
    if (this.state.currentTemp >= Constants.maxTc) {
      newCurrentTemp = this.state.currentTemp;
    } else {
      newCurrentTemp = this.state.currentTemp + 1;
    }

    this.setState({
      currentTemp: newCurrentTemp,
      mode: this.updateMode(
        newCurrentTemp,
        this.state.targetTemp,
        this.state.mode
      ),
    });
  };
  decreaseCurrent = () => {
    let newCurrentTemp;
    if (this.state.currentTemp <= Constants.minTc) {
      newCurrentTemp = this.state.currentTemp;
    } else {
      newCurrentTemp = this.state.currentTemp - 1;
    }
    this.setState({
      currentTemp: newCurrentTemp,
      mode: this.updateMode(
        newCurrentTemp,
        this.state.targetTemp,
        this.state.mode
      ),
    });
  };
  increaseTarget = () => {
    let newTargetTemp;
    if (this.state.targetTemp >= Constants.maxTt) {
      newTargetTemp = this.state.targetTemp;
    } else {
      newTargetTemp = this.state.targetTemp + 1;
    }

    this.setState({
      pointerAngle: Functions.valueToAngle(
        Constants.leftRadialAngle,
        Constants.rightRadialAngle,
        Constants.minTt,
        Constants.maxTt,
        newTargetTemp
      ),
      targetTemp: newTargetTemp,
      mode: this.updateMode(
        this.state.currentTemp,
        newTargetTemp,
        this.state.mode
      ),
    });
  };

  decreaseTarget = () => {
    let newTargetTemp;
    if (this.state.targetTemp <= Constants.minTt) {
      newTargetTemp = this.state.targetTemp;
    } else {
      newTargetTemp = this.state.targetTemp - 1;
    }

    this.setState({
      pointerAngle: Functions.valueToAngle(
        Constants.leftRadialAngle,
        Constants.rightRadialAngle,
        Constants.minTt,
        Constants.maxTt,
        newTargetTemp
      ),
      targetTemp: newTargetTemp,
      mode: this.updateMode(
        this.state.currentTemp,
        newTargetTemp,
        this.state.mode
      ),
    });
  };

  /**
   * Handles when the mouse is scrolled to increase/ decrease target temperature. 
   */
  handleMouseScroll = (e) => {
    let verticalScroll = e.deltaY;
    if (verticalScroll > 0) {
      this.decreaseTarget();
    } else {
      this.increaseTarget();
    }
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  };

  handleMouseEnterSlider = () => {
    this.setState({ isHovered: true });
  };

  handleMouseLeaveSlider = () => {
    this.setState({ isHovered: false });
  };

  /**
   * When mouse is down on slider path,
   * set the angle and target temp to where the mouse is at.
   * Also sets to isDragging mode so when the mouse move, the slider is updated.
   */
  handleMouseDown = (e) => {
    if (e.button !== 0) {
      return;
    }
    let newAngle = this.getAngle(e.pageX, e.pageY);
    let newTargetTemp = this.getTargetTemp(newAngle);
    this.setState({
      pointerAngle: newAngle,
      targetTemp: newTargetTemp,
      isDragging: true,
      mode: this.updateMode(
        this.state.currentTemp,
        newTargetTemp,
        this.state.mode
      ),
    });
    e.stopPropagation();
    e.preventDefault();
  };
  
  /**
   * Terminates dragging mode.
   */
  handleMouseUp = (e) => {
    this.setState({ isDragging: false });
    e.stopPropagation();
    e.preventDefault();
  };

  /**
   * Moves the slider pointer and updates the target temperature.
   */
  handleMouseMove = (e) => {
    e.preventDefault();
    if (!this.state.isDragging) {
      return;
    }
    let newAngle = this.getAngle(e.pageX, e.pageY);
    let newTargetTemp = this.getTargetTemp(newAngle);
    this.setState({
      pointerAngle: newAngle,
      targetTemp: newTargetTemp,
      mode: this.updateMode(
        this.state.currentTemp,
        newTargetTemp,
        this.state.mode
      ),
    });
  };

  /**
   * Determines the angle of the mouse from the center 
   */
  getAngle = (x, y) => {
    let diffx = x - Constants.cx;
    let diffy = y - Constants.cy;

    let basicAngle;
    if (diffx === 0) {
      basicAngle = 90;
    } else {
      basicAngle =
        (Math.atan(Math.abs(diffy) / Math.abs(diffx)) * 180) / Math.PI;
    }
    let finalAngle = "what what";
    if (diffx > 0 && diffy >= 0) {
      finalAngle = 90 + basicAngle;
    } else if (diffx < 0 && diffy <= 0) {
      finalAngle = 270 + basicAngle;
    } else if (diffx <= 0 && diffy > 0) {
      finalAngle = 270 - basicAngle;
    } else if (diffx >= 0 && diffy < 0) {
      finalAngle = 90 - basicAngle;
    }

    if (
      finalAngle > Constants.rightRadialAngle &&
      finalAngle < Constants.leftRadialAngle
    ) {
      finalAngle = Constants.rightRadialAngle;
      if (this.state.pointerAngle <= Constants.rightRadialAngle) {
        finalAngle = Constants.rightRadialAngle;
      } else if (this.state.pointerAngle >= Constants.leftRadialAngle) {
        finalAngle = Constants.leftRadialAngle;
      }
    }
    return finalAngle;
  };

  /**
   * Get the target temperature from the given angle.
   */
  getTargetTemp = (angle) => {
    if (angle <= Constants.rightRadialAngle) {
      angle += 360;
    }
    return Math.round(
      Constants.minTt +
        (angle - Constants.leftRadialAngle) *
          ((Constants.maxTt - Constants.minTt) /
            (360 + Constants.rightRadialAngle - Constants.leftRadialAngle))
    );
  };

  /**
   * Turns off/on the default mouse wheel action.
   */
  changeScroll = () => {
    let style = document.body.style.overflow;
    document.body.style.overflow = style === "hidden" ? "auto" : "hidden";
  };

  render() {
    return (
      <div
        className="MainPanel"
        onWheel={this.handleMouseScroll}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        <svg
          width={Constants.cx * 2}
          height={Constants.cy * 2}
          onMouseEnter={this.changeScroll}
          onMouseLeave={this.changeScroll}
        >
          <circle cx={Constants.cx} cy={Constants.cy} r="200" fill="#dddddd" />
          <circle cx={Constants.cx} cy={Constants.cy} r="190" fill="white" />
          <circle cx={Constants.cx} cy={Constants.cy} r="180" fill="black" />
          <linearGradient id="gradientColour">
            <stop offset="0%" stopColor={Constants.coolingColourSide}></stop>
            <stop offset="100%" stopColor={Constants.heatingColourSide}></stop>
          </linearGradient>
          <path
            d={Functions.describeArc(
              Constants.cx,
              Constants.cy,
              Constants.colourRadius,
              Constants.leftRadialAngle,
              Constants.rightRadialAngle + 360
            )}
            fill="none"
            stroke="url(#gradientColour)"
            strokeWidth="10"
          />
          />
          <ThermostatView
            currentTemp={this.state.currentTemp}
            targetTemp={this.state.targetTemp}
            mode={this.state.mode}
            isHovered={this.state.isHovered}
            handleMouseEnterSlider={this.handleMouseEnterSlider}
            handleMouseLeaveSlider={this.handleMouseLeaveSlider}
            isDragging={this.state.isDragging}
            handleMouseDown={this.handleMouseDown}
            pointerAngle={this.state.pointerAngle}
            handlePathMouseDown={this.handleMouseDown}
          />
          <UnitSymbol />
          <SymbolHot />
          <SymbolCold />
        </svg>
        <div className="Button">
          current:
          <button onClick={this.increaseCurrent}>Up</button>
          <button onClick={this.decreaseCurrent}>down</button>
        </div>
      </div>
    );
  }
}

export default MainPanel;
