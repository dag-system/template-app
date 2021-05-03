export function formattedTime(hours: number, minutes: number, seconds: number) {
  var hoursDisplay = hours.toString();
  if (hours < 10) {
    hoursDisplay = '0' + hours;
  }

  var minutesDisplay = minutes.toString();
  if (minutes < 10) {
    minutesDisplay = '0' + minutes;
  }

  var secondsDisplay = seconds.toString();
  if (seconds < 10) {
    secondsDisplay = '0' + seconds;
  }

  return hoursDisplay + ':' + minutesDisplay + ':' + secondsDisplay;
}
