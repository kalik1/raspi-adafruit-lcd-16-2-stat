'use strict';

var _adafruitI2cLcd = require("adafruit-i2c-lcd");

var _cyclestates = require("./cyclestates.functions");

const lcd = new _adafruitI2cLcd.plate(1, 0x20);
let lastState = null;

(function setup() {
  lcd.backlight(lcd.colors.RED);
  lcd.message('LCD Status - By \n Giorgio Pillon');
  (0, _cyclestates.initCycleState)({
    lcd
  });
})();

(async function run() {
  (0, _cyclestates.startCycleStates)();
})();

lcd.on('button_change', async function (button) {
  await (0, _cyclestates.stopCycleStates)();

  switch (lcd.buttonName(button)) {
    case 'SELECT':
      if (lastState !== 'SELECT') {
        lastState = 'SELECT';
        lcd.clear();
      }

      (0, _cyclestates.startCycleStates)();
      break;

    case 'DOWN':
      if (lastState !== 'DOWN') {
        lastState = 'DOWN';
        lcd.clear();
      }

      (0, _cyclestates.setState)('internalIp');
      break;

    case 'RIGHT':
      if (lastState !== 'RIGHT') {
        lastState = 'RIGHT';
        lcd.clear();
      }

      (0, _cyclestates.setState)('externalIp');
      break;

    case 'UP':
      if (lastState !== 'UP') {
        lastState = 'UP';
        ;
      }

      (0, _cyclestates.setState)('cpuram');
      break;

    case 'LEFT':
      if (lastState !== 'LEFT') {
        lastState = 'LEFT';
        ;
      }

      (0, _cyclestates.setState)('disk');
      break;

    default:
      lcd.message('Button changed:\n' + lcd.buttonName(button), true);
  } //lcd.message('Button changed:\n' + lcd.buttonName(button));

});
//# sourceMappingURL=index.js.map