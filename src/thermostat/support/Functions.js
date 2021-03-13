function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function describeArc(x, y, radius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");

  return d;
}

export function radialPointerPos(
  leftAngle,
  rightAngle,
  minValue,
  maxValue,
  r,
  cx,
  cy,
  value
) {
  if (rightAngle >= leftAngle) {
    return undefined;
  }
  if (minValue >= maxValue) {
    return undefined;
  }
  if (value > maxValue) {
    return undefined;
  }
  if (value < minValue) {
    return undefined;
  }
  var valueToAngle = (value - minValue) * (360 - leftAngle + rightAngle) / (maxValue - minValue) + leftAngle;

  return polarToCartesian(cx, cy, r, valueToAngle);
}
