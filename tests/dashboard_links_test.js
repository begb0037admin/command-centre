#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Missing ${name}`);
  let at = source.indexOf('{', start), depth = 0;
  for (; at < source.length; at += 1) {
    if (source[at] === '{') depth += 1;
    if (source[at] === '}' && --depth === 0) return source.slice(start, at + 1);
  }
  throw new Error(`Could not parse ${name}`);
}

const ccLinkDestinations = new Function('ccLinkDocument', `${extract('ccLinkDestinations')}; return ccLinkDestinations;`)({
  links: [
    { status: 'active', ccTaskIds: ['t1'], trackerId: 'trk_one' },
    { status: 'active', ccTaskIds: ['t1'], trackerId: 'trk_two' },
    { status: 'proposed', ccTaskIds: ['t1'], trackerId: 'trk_ignored' },
  ],
});
const destinations = ccLinkDestinations('t1');
if (destinations.length !== 2 || !destinations[0].url.includes('tracker.lelitte.co.uk/#trk_one')) throw new Error('active Tracker destinations were not rendered from the link map');
if (!source.includes("grid.children[3].replaceWith(button)")) throw new Error('Tracker icon does not use CC row 2, col 1');
if (!source.includes("destinations.length===1") || !source.includes("className='dashboard-link-picker'")) throw new Error('multi-link picker path is missing');
console.log('Command-centre link icon and picker checks passed.');
