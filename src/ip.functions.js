'use strict';


import http from 'http';
const EXTERNAL_IP_CALCTIME = 60 * 60 * 1000; // 1hour in ms
let oldIp = null;
let lastIpCalculationTime = null;

export default function getExternalIpAndInfos(forceRecalc = false) {
  return new Promise((resolve,reject) => {
      if (!forceRecalc && oldIp && lastIpCalculationTime && (Date.now() - lastIpCalculationTime) < EXTERNAL_IP_CALCTIME) {
      //console.log('using cached:')
      //console.log(oldIp);
      return resolve(oldIp);
    }
    http.get('http://ipconfig.io/json', (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
    
      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        return;
      }
    
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          //console.log(parsedData);
          lastIpCalculationTime = Date.now();
          oldIp = parsedData;
          resolve(parsedData)
        } catch (e) {
          console.error(e.message);
          reject(e.message)
        }
      });
    }).on('error', (e) => {
      //console.error(`Got error: ${e.message}`);
      reject(e.message || e)
    });
  });    
}