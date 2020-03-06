'use strict';

import { plate as LcdPlate } from 'adafruit-i2c-lcd';

import {
  startCycleStates,
  stopCycleStates,
  setState,
  initCycleState
} from './cyclestates.functions'

const lcd = new LcdPlate(1, 0x20);

(function setup() {
  lcd.backlight(lcd.colors.RED);
  lcd.message('LCD Status - By \n Giorgio Pillon');
  initCycleState({lcd});
})();
 
(async function run() {
   startCycleStates();
})();
 
lcd.on('button_change', async function(button) {
  await stopCycleStates();
  switch (lcd.buttonName(button)) {
    case 'SELECT':
      if (lastState !== 'SELECT') {
        lastState = 'SELECT';
        lcd.clear(); 
      }      
      startCycleStates();
      break;
    case 'DOWN':
      if (lastState !== 'DOWN') {
        lastState = 'DOWN';
        lcd.clear(); 
      }
      setState('internalIp');
      break;
    case 'RIGHT':
      if (lastState !== 'RIGHT') {
        lastState = 'RIGHT';
        lcd.clear(); 
      }
      setState('externalIp');
      break;
    case 'UP':
      if (lastState !== 'UP') {
        lastState = 'UP';; 
      }
      setState('cpuram');
      break;
    case 'LEFT':
      if (lastState !== 'LEFT') {
        lastState = 'LEFT';; 
      }
      setState('disk');
      break;
    default:
      lcd.message('Button changed:\n' + lcd.buttonName(button), true);
  }
  //lcd.message('Button changed:\n' + lcd.buttonName(button));
});