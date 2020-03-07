'use strict';

import getExternalIpAndInfos from './ip.functions';
import osu from 'node-os-utils';
import os from 'os';
import { hostname, cpus, totalmem, freemem } from 'os';
import internalIp from 'internal-ip';
import {sleep} from './helpers.function'
const CYCLE_STATES = ['cpuram', 'disk', 'internalIp', 'externalIp'];

let currentCiclyngState = 0;
let looping = false;
let cyclingPromise = null;
let _lcd;
let preventHang= false;

export function initCycleState({lcd}) {
  _lcd = lcd
}
function nextState() {
  return (currentCiclyngState++) %(CYCLE_STATES.length)
}

function nextStateName() {
  return CYCLE_STATES[ (currentCiclyngState + 1) %(CYCLE_STATES.length)]
}

async function printInternalIp(forceExternalIp = false) {
  const internalIpv4 = await internalIp.v4().catch(err => console.error(err));
  const internalHostname = os.hostname();
  _lcd.message(`${internalHostname}\n${internalIpv4}`, true);
}

async function printExternalIp(forceExternalIp = false) {
  const externalIpv4 = await getExternalIpAndInfos().catch(err => console.error(err));
  _lcd.message(`${externalIpv4.country}(${externalIpv4.city})\n${externalIpv4.ip}`, true);
}

async function printCpuRam() {
  //const {avgIdle, avgTotal} = await osu.cpu.average();  
  //const cpuUsage = (1-(avgIdle/avgTotal))*100;
  const cpuUsage = await osu.cpu.usage();
  const ramPct = (freemem()/totalmem()*100);
  _lcd.message(`CPU: ${cpuUsage.toFixed(2)}%\nUsed RAM: ${ramPct.toFixed(2)}%`, true);
}

async function printDisk() {
  const diskUsage = await osu.drive.info();
  _lcd.message(`Free Disk: ${diskUsage.freeGb}GB\nUsed Disk: ${diskUsage.usedPercentage}%`, true);
}

async function cycleStates() {
  looping = true;
  while(looping) {
    if (!preventHang) {
      await setState(CYCLE_STATES[nextState()]);
      await sleep(5000)
    }
  preventHang = false;
  }  
} 

export function startCycleStates() {
  cyclingPromise = cycleStates();
}

export async function stopCycleStates() {
  looping = false;
  preventHang = true;
  await cyclingPromise;
  cyclingPromise = null;
};

export async function setState(stateName) {
  switch(stateName) {
    case 'cpuram':
      await printCpuRam()
      break;
    case 'internalIp':
      await printInternalIp()
      break; 
    case 'externalIp':
      await printExternalIp()
      break; 
    case 'disk':
      await printDisk()
      break;
    default:
      console.error('Requested Unknown State')
    }
}