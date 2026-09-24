#!/usr/bin/env node
'use strict';

/* DOM-level regression check for the top-panel -> card jump path. */
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Could not find ${name}`);
  let at = source.indexOf('{', start), depth = 0;
  for (; at < source.length; at++) {
    if (source[at] === '{') depth++;
    if (source[at] === '}' && --depth === 0) return source.slice(start, at + 1);
  }
  throw new Error(`Could not brace-match ${name}`);
}

class FakeClassList {
  constructor(...names) { this.names = new Set(names); }
  add(...names) { names.forEach(name => this.names.add(name)); }
  remove(...names) { names.forEach(name => this.names.delete(name)); }
  contains(name) { return this.names.has(name); }
  toggle(name, force) {
    const next = force === undefined ? !this.names.has(name) : force;
    if (next) this.names.add(name); else this.names.delete(name);
    return next;
  }
}

class FakeElement {
  constructor(id, ...classes) {
    this.id = id;
    this.classList = new FakeClassList(...classes);
    this.attributes = new Map();
    this.dataset = {};
    this.offsetWidth = 0;
    this.scrolled = false;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) || null; }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelector(selector) {
    if (selector !== '.drawer-chevron') return null;
    return { setAttribute() {}, title: '', innerHTML: '' };
  }
  scrollIntoView() { this.scrolled = true; }
}

const activeClasses = ['deep-linked-today', 'deep-linked-tomorrow', 'deep-linked-week', 'deep-linked-parked'];
const ids = ['today-card', 'tomorrow-card', 'parked-card'];
const cards = ids.map((id, index) => {
  const card = new FakeElement(`card-${id}`, 'task-card');
  card.dataset.tier = ['today', 'tomorrow', 'parked'][index];
  return card;
});
const drawers = ids.map(id => new FakeElement(`drawer-${id}`, 'task-drawer'));
const elements = new Map(cards.concat(drawers).map(element => [element.id, element]));
const document = {
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll(selector) {
    if (selector === '.task-card') return cards;
    if (selector === '.task-drawer[data-opened-by-jump="true"]') {
      return drawers.filter(drawer => drawer.getAttribute('data-opened-by-jump') === 'true');
    }
    throw new Error(`Unexpected selector: ${selector}`);
  }
};
const window = { setTimeout() { return 1; } };
const tasks = ids.map((id, index) => ({ id, tier: ['today', 'tomorrow', 'parked'][index] }));
let expanded = [];
const storage = {};
const implementation = new Function(
  'document', 'window', 'tasks', 'getShowDone', 'getTierCollapseState',
  'setTierSectionCollapsed', 'renderBoard', 'storageGet', 'storageSet',
  'expandedIds', 'saveExpanded',
  `var SHOW_DONE_KEY='test-show-done'; var dragEndedAt=0; var lastJumpDrawerId=null;
   var DEEP_LINK_CLASSES=['deep-linked-today','deep-linked-tomorrow','deep-linked-week','deep-linked-parked'];
   function cardSvg(){return '';}
   ${['toggleDrawer', 'fadeDeepLink', 'clearJumpState', 'openDrawerForJump', 'goToCard'].map(extractFunction).join('\n')}
   return {goToCard,toggleDrawer};`
)(
  document, window, tasks, () => false, () => ({}), () => {}, () => {},
  key => storage[key] || null, (key, value) => { storage[key] = value; },
  () => expanded, value => { expanded = value; }
);

function activeCards() {
  return cards.filter(card => activeClasses.some(name => card.classList.contains(name)));
}
function assert(condition, message) { if (!condition) throw new Error(message); }

ids.forEach((id, index) => {
  implementation.goToCard(id);
  const active = activeCards();
  assert(active.length === 1, `jump ${index + 1}: expected exactly one highlighted card, got ${active.length}`);
  assert(active[0].id === `card-${id}`, `jump ${index + 1}: wrong highlighted card`);
  assert(elements.get(`drawer-${id}`).classList.contains('open'), `jump ${index + 1}: target drawer is closed`);
  assert(elements.get(`drawer-${id}`).getAttribute('data-opened-by-jump') === 'true', `jump ${index + 1}: target drawer was not marked as jump-opened`);
});

/* A manual drawer opened with the chevron must survive the next jump. */
implementation.toggleDrawer('parked-card', { stopPropagation() {} });
implementation.toggleDrawer('parked-card', { stopPropagation() {} });
implementation.goToCard('tomorrow-card');
assert(elements.get('drawer-parked-card').classList.contains('open'), 'manual drawer was closed by a later jump');
assert(elements.get('drawer-parked-card').getAttribute('data-opened-by-jump') === null, 'manual drawer retained jump marker');
assert(activeCards().length === 1 && activeCards()[0].id === 'card-tomorrow-card', 'manual drawer test left multiple highlighted cards');
console.log('All deep-link highlight checks passed.');
