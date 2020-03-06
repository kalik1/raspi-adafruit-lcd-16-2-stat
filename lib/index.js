"use strict";

var _internalIp = _interopRequireDefault(require("internal-ip"));

var _http = _interopRequireDefault(require("http"));

var _nodeOsUtils = _interopRequireDefault(require("node-os-utils"));

var _dns = _interopRequireDefault(require("dns"));

var _os = require("os");

var _adafruitI2cLcd = require("adafruit-i2c-lcd");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CYCLE_STATES = ['cpuram', 'disk', 'ip'];
const EXTERNAL_IP_CALCTIME = 60 * 60 * 1000; // 1hour in ms

const sleep = ms => new Promise(r => setTimeout(() => r(), ms));

const lcd = new _adafruitI2cLcd.plate(1, 0x20);
let currentCiclyngState;
let lastState;
let looping;
let oldIp;
let lastIpCalculationTime;

function setup() {
  currentCiclyngState = 0;
  lastState = null;
  looping = false;
  oldIp = null;
  lcd.backlight(lcd.colors.RED);
  lcd.message('LCD Status - By \n Giorgio Pillon');
}

function getExternalIp() {
  if (oldIp && lastIpCalculationTime && Date.now() - lastIpCalculationTime < EXTERNAL_IP_CALCTIME) return oldIp;
  return new Promise((resolve, reject) => {
    _http.default.get('http://ipconfig.io/json', res => {
      const {
        statusCode
      } = res;
      const contentType = res.headers['content-type'];
      let error;

      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
      }

      if (error) {
        console.error(error.message); // Consume response data to free up memory

        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData); //console.log(parsedData);

          lastIpCalculationTime = Date.now();
          resolve(parsedData);
        } catch (e) {
          console.error(e.message);
          reject(e.message);
        }
      });
    }).on('error', e => {
      //console.error(`Got error: ${e.message}`);
      reject(e.message || e);
    });
  });
}

function nextState() {
  return currentCiclyngState++ % CYCLE_STATES.length;
}

function nextStateName() {
  return CYCLE_STATES[(currentCiclyngState + 1) % CYCLE_STATES.length];
}

async function printState(stateName) {
  switch (stateName) {
    case 'cpuram':
      await printCpuRam();
      break;

    case 'ip':
      await printIp();
      break;

    case 'disk':
      await printDisk();
      break;

    default:
      console.error('Requested Unknown State');
  }
}

async function cycleStates() {
  looping = true;

  while (looping) {
    await printState(CYCLE_STATES[nextState()]);
    await sleep(5000);
  }
}

async function printIp(forceExternalIp = false) {
  const internalIpv4 = await _internalIp.default.v4().catch(err => console.error(err));
  const externalIpv4 = await getExternalIp().catch(err => console.error(err));
  lcd.message(`${internalIpv4}\n${externalIpv4.ip}`, true);
}

async function printCpuRam() {
  //const {avgIdle, avgTotal} = await osu.cpu.average();
  //const cpuUsage = (1-(avgIdle/avgTotal))*100;
  const cpuUsage = await _nodeOsUtils.default.cpu.usage();
  const ramPct = (0, _os.freemem)() / (0, _os.totalmem)() * 100;
  lcd.message(`CPU: ${cpuUsage.toFixed(2)}%\n Used Mem: ${ramPct.toFixed(2)}%`, true);
}

async function printDisk() {
  const diskUsage = await _nodeOsUtils.default.drive.info();
  lcd.message(`Free Disk: ${diskUsage.freeGb}GB\nUsed : ${diskUsage.usedPercentage}%`, true);
}

lcd.on('button_change', async function (button) {
  looping = false;

  switch (lcd.buttonName(button)) {
    case 'DOWN':
      if (lastState !== 'DOWN') {
        lastState = 'DOWN';
        lcd.clear();
      }

      cycleStates();
      break;

    case 'SELECT':
      if (lastState !== 'DOWN') {
        lastState = 'DOWN';
        lcd.clear();
      }

      printState('ip');
      break;

    case 'UP':
      if (lastState !== 'UP') {
        lastState = 'UP';
        ;
      }

      printState('cpuram');
      break;

    case 'LEFT':
      if (lastState !== 'LEFT') {
        lastState = 'LEFT';
        ;
      }

      printState('disk');
      break;

    default:
      lcd.message('Button changed:\n' + lcd.buttonName(button));
  } //lcd.message('Button changed:\n' + lcd.buttonName(button));

});
setup();
cycleStates();
//# sourceMappingURL=index.js.map