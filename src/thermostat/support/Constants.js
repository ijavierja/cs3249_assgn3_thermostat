export const mode = Object.freeze({"off":"OFF", "heating":"HEATING", "cooling":"COOLING"});

//default values
export const initialCurrentTemp = 72;
export const initialTargetTemp = 72;
export const minTc = 32;
export const maxTc = 100;
export const minTt = 50;
export const maxTt = 80;
export const dT=2;
export const dTcool=1.5;
export const dTheat=1;

//default colours
export const offColour = "#66616b";
export const coolingColour = "#81dafc";
export const coolingColourSide = "#4fcbfc";
export const heatingColour = "#fc819d ";
export const heatingColourSide = "#fc4f75";

//default circle center
export const cx = 200;
export const cy= 200

//default colour ring properties
export const colourRadius = 177;

//default thermostatview properties
export const thermostatRadius = 173;

//default Radial Slider properties
export const leftRadialAngle = 220;
export const rightRadialAngle = 140;
export const radialRadius = 155;
