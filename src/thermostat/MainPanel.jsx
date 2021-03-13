import React, { Component } from "react";
import "./MainPanel.css";
import * as Functions from "./support/Functions.js";
import * as Constants from "./support/Constants.js";

class MainPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTemp: Constants.initialCurrentTemp,
      targetTemp: Constants.initialTargetTemp,
      mode: Constants.mode.off,
      isDragging: false,
      isHovered: false,
      pointerAngle: Functions.radialPointerPos(
        Constants.leftRadialAngle,
        Constants.rightRadialAngle,
        Constants.minTt,
        Constants.maxTt,
        Constants.radialRadius,
        Constants.cx,
        Constants.cy,
        this.props.targetTemp
      ),
    };
  }
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
      targetTemp: newTargetTemp,
      mode: this.updateMode(
        this.state.currentTemp,
        newTargetTemp,
        this.state.mode
      ),
    });
  };

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

  handleMouseDown = (e) => {
    if (e.button !== 0) {
      return;
    }
    this.setState({ isDragging: true });
    e.stopPropagation();
    e.preventDefault();
  };

  handleMouseUp = (e) => {
    this.setState({ isDragging: false });
    e.stopPropagation();
    e.preventDefault();
  };

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
      )
    });
  };

  getAngle = (x, y) => {
    let diffx = x - Constants.cx;
    let diffy = y - Constants.cy;

    let basicAngle;
    if(diffx === 0) {
      basicAngle = 90;
    }
    else {
      basicAngle = Math.atan(Math.abs(diffy)/Math.abs(diffx)) * 180 / Math.PI;
    }
    let finalAngle = "what what";
    if ( (diffx>0) && (diffy >= 0) ) {
      finalAngle = 90 + basicAngle;
    }
    else if ((diffx<0) && (diffy<=0)) {
      finalAngle = 270 + basicAngle;
    }
    else if ((diffx<=0) && (diffy >0)) {
      finalAngle = 270 - basicAngle;
    }
    else if (diffx >= 0 && diffy < 0) {
      finalAngle = 90 - basicAngle;
    }
    
    if (finalAngle > Constants.rightRadialAngle && finalAngle < Constants.leftRadialAngle ) {
      finalAngle = Constants.rightRadialAngle;
      if ( this.state.pointerAngle <= Constants.rightRadialAngle) {
        finalAngle = Constants.rightRadialAngle;
      }
      else if ( this.state.pointerAngle >= Constants.leftRadialAngle ) {
        finalAngle = Constants.leftRadialAngle;
      }
    }
    return finalAngle;
  };

  getTargetTemp = (angle) => {
    if ( angle <= Constants.rightRadialAngle) {
      angle += 360;
    }
    return Math.round(
      Constants.minTt +
      (angle - Constants.leftRadialAngle) *
        ((Constants.maxTt - Constants.minTt) /
          (360 + Constants.rightRadialAngle - Constants.leftRadialAngle))
    );
  };

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

class UnitSymbol extends Component {
  render() {
    return (
      <svg class="svg-icon">
        <path
          fill="none"
          transform="translate(191,335)"
          strokeWidth="0.9"
          stroke="white"
          d="M5.776,4.086c-0.933,0-1.689,0.756-1.689,1.689s0.756,1.69,1.689,1.69s1.689-0.757,1.689-1.69S6.709,4.086,5.776,4.086 M5.776,6.621c-0.466,0-0.845-0.378-0.845-0.845c0-0.466,0.378-0.845,0.845-0.845S6.621,5.31,6.621,5.776C6.621,6.243,6.243,6.621,5.776,6.621 M9.161,14.219l1.261,0.004v-3.378h3.379V9.577h-3.379V7.043h3.801l0.002-1.262H9.161V14.219zM17.603,0.708H2.397c-0.933,0-1.689,0.756-1.689,1.689v15.205c0,0.934,0.756,1.689,1.689,1.689h15.205c0.933,0,1.689-0.756,1.689-1.689V2.397C19.292,1.464,18.535,0.708,17.603,0.708 M18.447,17.602c0,0.467-0.379,0.846-0.845,0.846H2.397c-0.466,0-0.845-0.379-0.845-0.846V2.397c0-0.466,0.378-0.845,0.845-0.845h15.205c0.466,0,0.845,0.379,0.845,0.845V17.602z"
        ></path>
      </svg>
    );
  }
}

class SymbolHot extends Component {
  render() {
    return (
      <svg className="svg-icon">
        <path
          fill="none"
          transform="translate(270, 322)" //190 is centre
          strokeWidth="1.2"
          stroke="white"
          d="M5.114,5.726c0.169,0.168,0.442,0.168,0.611,0c0.168-0.169,0.168-0.442,0-0.61L3.893,3.282c-0.168-0.168-0.442-0.168-0.61,0c-0.169,0.169-0.169,0.442,0,0.611L5.114,5.726z M3.955,10c0-0.239-0.193-0.432-0.432-0.432H0.932C0.693,9.568,0.5,9.761,0.5,10s0.193,0.432,0.432,0.432h2.591C3.761,10.432,3.955,10.239,3.955,10 M10,3.955c0.238,0,0.432-0.193,0.432-0.432v-2.59C10.432,0.693,10.238,0.5,10,0.5S9.568,0.693,9.568,0.932v2.59C9.568,3.762,9.762,3.955,10,3.955 M14.886,5.726l1.832-1.833c0.169-0.168,0.169-0.442,0-0.611c-0.169-0.168-0.442-0.168-0.61,0l-1.833,1.833c-0.169,0.168-0.169,0.441,0,0.61C14.443,5.894,14.717,5.894,14.886,5.726 M5.114,14.274l-1.832,1.833c-0.169,0.168-0.169,0.441,0,0.61c0.168,0.169,0.442,0.169,0.61,0l1.833-1.832c0.168-0.169,0.168-0.442,0-0.611C5.557,14.106,5.283,14.106,5.114,14.274 M19.068,9.568h-2.591c-0.238,0-0.433,0.193-0.433,0.432s0.194,0.432,0.433,0.432h2.591c0.238,0,0.432-0.193,0.432-0.432S19.307,9.568,19.068,9.568 M14.886,14.274c-0.169-0.168-0.442-0.168-0.611,0c-0.169,0.169-0.169,0.442,0,0.611l1.833,1.832c0.168,0.169,0.441,0.169,0.61,0s0.169-0.442,0-0.61L14.886,14.274z M10,4.818c-2.861,0-5.182,2.32-5.182,5.182c0,2.862,2.321,5.182,5.182,5.182s5.182-2.319,5.182-5.182C15.182,7.139,12.861,4.818,10,4.818M10,14.318c-2.385,0-4.318-1.934-4.318-4.318c0-2.385,1.933-4.318,4.318-4.318c2.386,0,4.318,1.933,4.318,4.318C14.318,12.385,12.386,14.318,10,14.318 M10,16.045c-0.238,0-0.432,0.193-0.432,0.433v2.591c0,0.238,0.194,0.432,0.432,0.432s0.432-0.193,0.432-0.432v-2.591C10.432,16.238,10.238,16.045,10,16.045"
        ></path>
      </svg>
    );
  }
}

class SymbolCold extends Component {
  render() {
    return (
      <svg className="svg-icon">
        <path
          d="m20.751 1032.1c-0.123-0.3-0.49-0.4-1.22-0.4-1.274 0.1-3.533 4.6-3.42 1.8-1.928-1.1-0.173 3.2-2.238 3.6-1.302 1.4-0.701-0.9-0.836-1.6-0.21-1 0.262-1.7 1.003-2.2l2.061-2.1c-1.033-2.7-3.586 3-2.971-0.3 0.49-1-0.321-2.4-1.087-2.5h0.012c-0.202 0-0.394 0.1-0.576 0.3-0.165 0.1-0.322 0.3-0.433 0.6h-0.012c-0.056 0.1-0.114 0.3-0.148 0.4h-0.011c-0.025 0.1-0.058 0.2-0.066 0.4h0.016c-0.006 0.1-0.012 0.2 0.01 0.4h0.016c0.024 0.1 0.051 0.3 0.107 0.4h0.016c0.071 0.4 0.091 0.7 0.079 0.8-0.001 0 0.016 0.1 0.015 0.1-0.007 0-0.039 0.1-0.062 0.1-0.025 0-0.067 0.1-0.109 0.1-0.043 0-0.089-0.1-0.146-0.1-0.171-0.1-0.387-0.4-0.647-0.6-0.3388-0.3-0.7419-0.7-1.1107-0.8-0.1957 0-0.3753 0-0.5496 0.1-0.0838 0-0.1514 0.1-0.2267 0.2-0.0826 0.1-0.1598 0.3-0.2298 0.4l2.0508 2.1c0.371 0.2 0.674 0.6 0.853 0.9 0.044 0.1 0.087 0.2 0.115 0.3 0.029 0.1 0.048 0.2 0.06 0.3 0.028 0.2 0.011 0.4-0.044 0.7-0.034 0.1-0.015 0.4 0.004 0.7 0.009 0.2-0.01 0.3-0.002 0.4 0.006 0.2 0.032 0.4 0.025 0.5-0.005 0.1-0.007 0.2-0.038 0.3-0.045 0.1-0.135 0.1-0.262 0.1-0.123 0-0.305-0.2-0.536-0.4h-0.016c-0.248-0.1-0.4482-0.2-0.5984-0.3-0.0767-0.1-0.1293-0.2-0.1857-0.3-0.0602-0.1-0.1223-0.2-0.1625-0.3-0.0738-0.2-0.1099-0.5-0.1406-0.7h-0.0158c-0.0144-0.2-0.0122-0.3-0.0212-0.4-0.0098-0.1-0.0023-0.2-0.0096-0.4-0.007-0.1-0.0128-0.2-0.0212-0.3-0.0085-0.1-0.0347-0.3-0.0486-0.4-0.0065 0-0.0276 0-0.036-0.1-0.0934-0.5-0.3118-0.8-0.9758-0.4h0.0159c0.0055 0.2-0.0079 0.3-0.0178 0.4-0.0006 0 0.0164 0 0.0158 0.1-0.0111 0.1-0.045 0.1-0.0695 0.2-0.0268 0.1-0.0485 0.1-0.0897 0.2h-0.1529c-0.1079 0-0.2485-0.1-0.3977-0.2-0.4423-0.4-1.033-1.2-1.6102-1.8-0.3883-0.4-0.7751-0.7-1.0951-0.7-0.0067 0-0.0092-0.1-0.0159-0.1-0.7482 0-1.09 0.2-1.2033 0.5-0.0309 0.1-0.056 0.2-0.058 0.3-0.0017 0 0.0209 0.1 0.0444 0.2 0.044 0.2 0.1339 0.4 0.266 0.7 0.2471 0.4 0.6241 0.8 1.0109 1.2 0.3954 0.4 0.798 0.7 1.1036 0.9 0.4277 0.3 0.6254 0.5 0.6468 0.6 0.0056 0-0.0107 0.1-0.0232 0.1-0.114 0.2-0.8859 0.1-1.2709 0.3-0.0853 0.1-0.1492 0.2-0.1834 0.3 0.0324 0.1 0.077 0.1 0.1266 0.2 0.1491 0.2 0.3546 0.3 0.6182 0.4 0.5283 0.1 1.227 0 1.8544 0.1 0.2058 0.1 0.398 0.1 0.5781 0.2 0.2702 0.1 0.5007 0.3 0.6626 0.6 0.054 0.2 0.0977 0.3 0.1352 0.4 0.2038 0.1 0.3496 0.2 0.4452 0.3s0.1348 0.2 0.1425 0.3h-0.0116c-0.0149 0-0.0242 0-0.0549 0.1-0.3061 0.1-1.3457-0.1-1.8142 0-0.3788 0.1-0.7288 0.1-1.0485 0-0.3196-0.1-0.6141-0.2-0.8893-0.4-0.1297-0.1-0.2638-0.2-0.3861-0.3-0.1292-0.1-0.2677-0.2-0.3904-0.3-0.2385-0.3-0.475-0.6-0.6985-0.8-0.0316-0.1-0.0561-0.2-0.1035-0.3-0.0501-0.1-0.1208-0.2-0.1857-0.3-0.0547 0-0.1196-0.1-0.1815-0.2-0.0689 0-0.1458 0-0.2205-0.1h-0.2437c-0.2285-0.1-0.4694 0-0.6634 0-0.1447 0.1-0.2399 0.2-0.3248 0.3-0.0424 0-0.0801 0.1-0.1055 0.1-0.0248 0.1-0.0417 0.1-0.0463 0.2h0.0158c-0.0011 0.1 0.0083 0.1 0.0243 0.2 0.043 0.2 0.1778 0.5 0.5255 0.7 0.5853 0.3 0.8616 0.6 0.9264 0.8 0.0162 0 0.0014 0.1-0.0073 0.1-0.011 0 0.0005 0.1-0.0232 0.1h-0.0274c-0.1326 0.1-0.3912 0.2-0.7257 0.2h-0.0274-0.5379-0.0275-1.1117c-0.3097 0-0.53565 0.1-0.70561 0.3h-0.05484c-0.13882 0.1-0.23114 0.2-0.2773 0.3-0.005109 0-0.007255 0.1-0.011588 0.1-0.016489 0-0.046 0.1-0.046356 0.1-0.00037193 0 0.015841 0.1 0.015831 0.1 0.00236 0 0.02076 0.1 0.040145 0.2 0.077328 0.3 0.33768 0.5 0.68693 0.8 0.17292 0.1 0.35029 0.2 0.55489 0.2 0.4175 0.2 0.8726 0.2 1.2879 0 0.7878-0.2 1.0665-0.1 1.0801 0-0.011 0.1-0.0827 0.2-0.2066 0.3-0.1307 0.2-0.3029 0.4-0.4808 0.5-0.1594 0.2-0.3289 0.4-0.465 0.6h-0.0116c-0.1383 0.2-0.263 0.4-0.3078 0.5-0.0207 0.1-0.0358 0.2-0.0263 0.3h0.0158c0.0019 0.1 0.0133 0.1 0.0158 0.1 0.0432 0.2 0.2321 0.5 0.7217 0.6l2.0605-2c0.0083 0 0.0032 0 0.0115-0.1 0.1385-0.1 0.2693-0.3 0.426-0.4 0.4698-0.4 1.0347-0.6 1.7456-0.5 0.5365 0.1 1.7368-0.2 2.0305 0.1h0.0475c0.004 0.1 0.0138 0.1 0.0158 0.1 0.0008 0-0.012 0-0.0232 0.1-0.0437 0.1-0.1799 0.3-0.4491 0.5h0.0158c-0.0218 0.2-0.0613 0.3-0.1086 0.3-0.6165 1.3-3.2287 0.5-3.6038 1.2-0.024 0-0.0577 0.1-0.0622 0.2h0.0158c-0.0015 0-0.0138 0.1 0.0127 0.2 0.0264 0.1 0.0777 0.2 0.1468 0.3h0.0158c0.3539 0 0.5796 0 0.7268 0.1 0.1259 0 0.2104 0.1 0.1973 0.2-0.0779 0.6-2.2764 1.9-2.7205 2.9-0.0367 0-0.0749 0.1-0.0853 0.2h0.0158c-0.0013 0.2-0.0056 0.4 0.0139 0.5h0.0158c0.0205 0.1 0.0383 0.2 0.076 0.3 0.0034 0 0.0124 0.1 0.0159 0.1 0.0819 0.1 0.2066 0.3 0.3471 0.3 0.8793 0.4 2.7715-1.4 3.3198-2.3 0.3514-0.5 0.5468-0.7 0.6569-0.7 0.0421 0.1 0.0728 0.1 0.095 0.2h0.0158c0.0226 0.1 0.0326 0.2 0.0486 0.4 0.0426 0.3 0.1058 0.7 0.3104 0.9h0.1456c0.1193 0.1 0.2582 0.1 0.463 0 0.0002-0.1 0.0115-0.1 0.0116-0.1 0.0018-0.2-0.0084-0.4 0.0051-0.6 0.001 0 0.0105 0 0.0116-0.1 0.0145-0.2 0.0461-0.4 0.0757-0.6h0.0116c0.0317-0.2 0.0677-0.4 0.119-0.6 0.0539-0.2 0.1107-0.5 0.1897-0.6 0.1352-0.4 0.3291-0.7 0.5535-1 0.0436 0 0.0695-0.1 0.117-0.2 0.1409-0.1 0.2749-0.3 0.4529-0.4 0.178-0.2 0.381-0.3 0.599-0.5l-0.004 3.5c-0.427 0.7-1.2623 1.3-1.8523 2-0.2386 0.1-0.4074 0.2-0.5442 0.4-0.054 0-0.1206 0.1-0.1602 0.1-0.0075 0-0.0046 0-0.0116 0.1-0.0438 0-0.0764 0.1-0.1012 0.2h-0.0116c-0.0327 0.1-0.073 0.2-0.0653 0.3 0.0066 0.2 0.055 0.3 0.1235 0.4 0.097 0.2 0.2515 0.3 0.4294 0.3 0.0692 0.1 0.1219 0.1 0.2004 0.1 0.14 0 0.2982-0.1 0.4588-0.2 0.1607-0.1 0.3266-0.2 0.4967-0.5 0.1346-0.1 0.2536-0.3 0.3556-0.4 0.203-0.2 0.361-0.3 0.462-0.4 0.036 0 0.077 0.1 0.102 0.1 0.062 0.1 0.086 0.2 0.096 0.4s0.021 0.5 0.015 0.7c-0.007 0.3-0.031 0.6-0.02 0.9h0.016c0.012 0.3 0.029 0.5 0.09 0.8 0.061 0.2 0.176 0.4 0.321 0.6 0.075 0.1 0.148 0.1 0.252 0.2 0.11 0 0.224 0.1 0.373 0.1 2.182 0-0.082-5.8 2.065-3 1.36 1.7 2.594-0.5 0.819-1.2-0.59-0.7-1.451-1.2-1.878-2l-0.012-3.4c1.75 1 2.15 2.7 2.165 4.6 1.518 0.7 0.334-2.8 1.74-0.8 0.725 1.2 3.859 4 3.815 1.1-0.183-1.2-4.696-3.5-1.865-3.4 1.134-1.9-3.239-0.1-3.58-2.2-1.436-1.3 0.813-0.6 1.611-0.8 0.947-0.2 1.618 0.3 2.172 1l2.067 2c2.718-1-3.002-3.5 0.359-2.9 1.627 0.7 3.941-1.6 1.464-2.1-1.313 0.1-3.917 0.1-1.576-1.2 1.739-1.3-0.978-2.4-1.484-0.6-0.92 1-1.893 2.2-3.408 1.8-0.75-0.1-2.949 0.4-1.319-0.7 0.6-2.1 3.478-0.5 3.997-1.9-0.274-0.8-2.553 0-0.842-1.3 0.917-0.5 2.764-2.4 2.397-3.3z"
          fill="white"
          strokeWidth="0.1"
          stroke="white"
          transform="translate(110 -710)"
        />
      </svg>
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
        />
        <RadialSliderPointer
          handleMouseEnterSlider={this.props.handleMouseEnterSlider}
          handleMouseLeaveSlider={this.props.handleMouseLeaveSlider}
          isHovered={this.props.isHovered}
          targetTemp={this.props.targetTemp}
          handleMouseDown={this.props.handleMouseDown}
          isDragging={this.props.isDragging}
        />
      </svg>
    );
  }
}

class RadialSliderPath extends Component {
  render() {
    return (
      <svg>
        <path
          d={Functions.describeArc(Constants.cx, Constants.cy, Constants.radialRadius, Constants.leftRadialAngle, Constants.rightRadialAngle+360)}
          fill="none"
          stroke="white"
          strokeWidth="6"
          onMouseEnter={this.props.handleMouseEnterSlider}
          onMouseLeave={this.props.handleMouseLeaveSlider}
        />
      </svg>
    );
  }
}
class RadialSliderPointer extends Component {
  
  render() {
    let pos = Functions.radialPointerPos(
      Constants.leftRadialAngle,
      Constants.rightRadialAngle,
      Constants.minTt,
      Constants.maxTt,
      Constants.radialRadius,
      Constants.cx,
      Constants.cy,
      this.props.targetTemp
    );
    if (pos === undefined) {
      let cx = Constants.cx;
      let cy = Constants.cy;
    }

    let cx = pos.x;

    let cy = pos.y;
    return (
      <svg>
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
      </svg>
    );
  }
}

export default MainPanel;
