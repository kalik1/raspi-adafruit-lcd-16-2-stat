'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initCycleState = initCycleState;
exports.startCycleStates = startCycleStates;
exports.stopCycleStates = stopCycleStates;
exports.setState = setState;

var _ip = _interopRequireDefault(require("./ip.functions"));

var _nodeOsUtils = _interopRequireDefault(require("node-os-utils"));

var _os = _interopRequireWildcard(require("os"));

var _internalIp = _interopRequireDefault(require("internal-ip"));

var _helpers = require("./helpers.function");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CYCLE_STATES = ['cpuram', 'disk', 'internalIp', 'externalIp'];
let currentCiclyngState = 0;
let looping = false;
let cyclingPromise = null;

let _lcd;

let preventHang = false;

function initCycleState({
  lcd
}) {
  _lcd = lcd;
}

function nextState() {
  return currentCiclyngState++ % CYCLE_STATES.length;
}

function nextStateName() {
  return CYCLE_STATES[(currentCiclyngState + 1) % CYCLE_STATES.length];
}

async function printInternalIp(forceExternalIp = false) {
  const internalIpv4 = await _internalIp.default.v4().catch(err => console.error(err));

  const internalHostname = _os.default.hostname();

  _lcd.message(`${internalHostname}\n${internalIpv4}`, true);
}

async function printExternalIp(forceExternalIp = false) {
  const externalIpv4 = await (0, _ip.default)().catch(err => console.error(err));

  _lcd.message(`${externalIpv4.country}(${externalIpv4.city})\n${externalIpv4.ip}`, true);
}

async function printCpuRam() {
  //const {avgIdle, avgTotal} = await osu.cpu.average();  
  //const cpuUsage = (1-(avgIdle/avgTotal))*100;
  const cpuUsage = await _nodeOsUtils.default.cpu.usage();
  const ramPct = (0, _os.freemem)() / (0, _os.totalmem)() * 100;

  _lcd.message(`CPU: ${cpuUsage.toFixed(2)}%\nUsed RAM: ${ramPct.toFixed(2)}%`, true);
}

async function printDisk() {
  const diskUsage = await _nodeOsUtils.default.drive.info();

  _lcd.message(`Free Disk: ${diskUsage.freeGb}GB\nUsed Disk: ${diskUsage.usedPercentage}%`, true);
}

async function cycleStates() {
  looping = true;

  while (looping) {
    if (!preventHang) {
      await setState(CYCLE_STATES[nextState()]);
      await (0, _helpers.sleep)(5000);
    }

    preventHang = false;
  }
}

function startCycleStates() {
  cyclingPromise = cycleStates();
}

async function stopCycleStates() {
  looping = false;
  preventHang = true;
  await cyclingPromise;
  cyclingPromise = null;
}

;

async function setState(stateName) {
  switch (stateName) {
    case 'cpuram':
      await printCpuRam();
      break;

    case 'internalIp':
      await printInternalIp();
      break;

    case 'externalIp':
      await printExternalIp();
      break;

    case 'disk':
      await printDisk();
      break;

    default:
      console.error('Requested Unknown State');
  }
}
//# sourceMappingURL=cyclestates.functions.js.map