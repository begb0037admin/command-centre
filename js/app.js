/* DONE STATE — persisted in tasks.json via Worker, not localStorage */
function isDone(id){var t=tasks.find(function(x){return x.id===id;});return t?!!t.done:false;}
function saveDone(){/* no-op — done state now in tasks.json */}

/* SHOW/HIDE DONE TOGGLE */
function storageGet(key){try{return localStorage.getItem(key);}catch(e){return null;}}
function storageSet(key,value){try{localStorage.setItem(key,value);}catch(e){}}
var EXPANDED_KEY='cc_expanded_v1';
function expandedIds(){try{return JSON.parse(storageGet(EXPANDED_KEY)||'[]');}catch(e){return [];}}
function saveExpanded(ids){storageSet(EXPANDED_KEY,JSON.stringify(ids));}
function isExpanded(id){return expandedIds().indexOf(id)>=0;}
function getShowDone(){return storageGet(SHOW_DONE_KEY)==='1';}
function toggleShowDone(){
  var next=!getShowDone();
  storageSet(SHOW_DONE_KEY,next?'1':'0');
  renderBoard();
}
function updateDoneToggleBtn(){
  var btn=document.getElementById('done-toggle-btn');
  if(!btn)return;
  var showing=getShowDone();
  var doneCount=tasks.filter(function(t){return !!t.done;}).length;
  if(showing){
    btn.textContent='Hide done ('+doneCount+')';
    btn.classList.add('showing');
  } else {
    btn.textContent='Show done'+(doneCount?' ('+doneCount+')':'');
    btn.classList.remove('showing');
  }
  btn.style.display=doneCount>0?'':'none';
}

/* MY LINKS */
var QL_KEY='commandCentre_quicklinks_v1';
function getCustomLinks(){try{return JSON.parse(storageGet(QL_KEY)||'[]');}catch(e){return [];}}
function saveCustomLinks(links){storageSet(QL_KEY,JSON.stringify(links));}
function renderCustomLinks(){
  var links=getCustomLinks();
  var el=document.getElementById('custom-links');
  if(!el)return;
  el.innerHTML='';
  links.forEach(function(link,i){
    var row=document.createElement('div');
    row.className='ql-link-row';
    var label=link.label.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var url=link.url.replace(/"/g,'&quot;');
    // Named per-destination target (14 Sep 2026, Kevin) -- reuses the same
    // tab on repeat clicks to the same URL instead of spawning a new one
    // every time, while distinct quick links still open in their own tabs.
    var qlTarget='ql-'+link.url.replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase().slice(0,60);
    row.innerHTML='<a class="ql-link-a" href="'+url+'" target="'+qlTarget+'">'+label+'</a>'
      +'<button class="ql-remove-btn" onclick="removeCustomLink('+i+')" title="Remove">\xd7</button>';
    el.appendChild(row);
  });
}
function showAddLink(){
  document.getElementById('ql-add-form').style.display='';
  document.getElementById('ql-label').focus();
}
function hideAddLink(){
  document.getElementById('ql-add-form').style.display='none';
  document.getElementById('ql-label').value='';
  document.getElementById('ql-url').value='';
}
function saveCustomLink(){
  var label=document.getElementById('ql-label').value.trim();
  var url=document.getElementById('ql-url').value.trim();
  if(!label||!url)return;
  if(!/^https?:\/\//i.test(url))url='https://'+url;
  var links=getCustomLinks();
  links.push({label:label,url:url});
  saveCustomLinks(links);
  renderCustomLinks();
  hideAddLink();
}
function removeCustomLink(i){
  var links=getCustomLinks();
  links.splice(i,1);
  saveCustomLinks(links);
  renderCustomLinks();
}

/* DISMISS */
function sgDismissed(){try{return JSON.parse(storageGet(DISMISS_KEY)||'{}')}catch(e){return{}}}
function dismissSuggestion(id){
  var d=sgDismissed();d[id]=1;
  storageSet(DISMISS_KEY,JSON.stringify(d));
  var el=document.getElementById('sg-'+id);
  if(el)el.classList.add('dismissed');
}

/* VIEWS */
function showView(v){
  document.getElementById('view-board').style.display=v==='board'?'':'none';
  document.getElementById('view-inbox').style.display=v==='inbox'?'':'none';
  document.getElementById('view-title').textContent=v==='board'?'Task Board':'From your inbox';
  ['board','inbox'].forEach(function(n){var el=document.getElementById('nav-'+n);if(el)el.classList.toggle('active',n===v);});
}

/* RENDER */
/* Board-level staleness summary. Individual badges show which cards have gone
   quiet; this shows how much of the board has, which is the part that is easy
   to miss when almost every card is affected. */
function renderStaleSummary(){
  var host=document.getElementById('staleSummary');
  if(!host)return;
  var live=tasks.filter(function(t){return !t.done;});
  var quiet=live.filter(function(t){return staleDays(t)!==null;});
  var urgentQuiet=quiet.filter(function(t){return t.tier==='today'||t.tier==='tomorrow';});
  if(!quiet.length){host.style.display='none';host.innerHTML='';return;}
  host.style.display='';
  host.innerHTML='<strong>'+quiet.length+' of '+live.length+'</strong> open tasks have had no activity logged for a while'
    +(urgentQuiet.length?' — including <strong>'+urgentQuiet.length+'</strong> still marked Today or Tomorrow':'')
    +'. Tasks are marked quiet after 7 days (Today/Tomorrow), 21 days (This Week) or 45 days (Parked).';
}

/* Newest-first ordering within a tier, keyed on the SOURCE date the card
   shows -- the email received datetime / meeting date parsed out of t.source
   (e.g. "Inbox - Nathan Kirwan, 2026-08-26 14:51", "21 Aug 2026 Granola
   meeting", "19/08/2026", "Inbox 2026-06-08 15:58"). That printed date is
   what Kevin reads on the card, so that is what drives order -- NOT the
   Command Centre-internal activity/dateAdded recency the branch used before.
   Precedence, each step only used when the previous found nothing:
     (1) an explicit dated token in t.source -- ISO YYYY-MM-DD[ HH:MM], or
         DD/MM/YYYY, or "DD[-DD] Mon YYYY", or bare "Mon YYYY" (-> day 1);
         if several appear, the LATEST wins;
     (2) t.dateAdded;
     (3) the earliest "[DD Mon YYYY]" stamp in the action log;
     (4) 0 (sorts last).
   Never throws on a missing/malformed value. Source date decides where unranked
   cards land; a manual drag writes tierRank and preserves that explicit order.
   Ties keep their existing relative order (Array.prototype.sort is stable). */
function ccMonthIdx(s){
  return CC_MONTHS[String(s||'').toLowerCase().slice(0,3)];
}
function sourceDateFromText(s){
  s=String(s||'');
  var best=0,m,re,v,mo;
  /* ISO: 2026-08-26  or  2026-08-26 14:51  or  2026-08-26T14:51 */
  re=/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/g;
  while((m=re.exec(s))){
    v=new Date(+m[1],+m[2]-1,+m[3],m[4]?+m[4]:0,m[5]?+m[5]:0).getTime();
    if(!isNaN(v)&&v>best)best=v;
  }
  /* DD/MM/YYYY with optional HH:MM */
  re=/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b(?:[ T](\d{1,2}):(\d{2}))?/g;
  while((m=re.exec(s))){
    v=new Date(+m[3],+m[2]-1,+m[1],m[4]?+m[4]:0,m[5]?+m[5]:0).getTime();
    if(!isNaN(v)&&v>best)best=v;
  }
  /* "DD Mon YYYY" or "DD-DD Mon YYYY"  e.g. "21 Aug 2026", "17-18 Jun 2026" */
  re=/\b(\d{1,2})(?:\s*-\s*\d{1,2})?\s+([A-Za-z]{3,9})\.?\s+(\d{4})\b/g;
  while((m=re.exec(s))){
    mo=ccMonthIdx(m[2]);
    if(mo===undefined)continue;
    v=new Date(+m[3],mo,+m[1]).getTime();
    if(!isNaN(v)&&v>best)best=v;
  }
  /* Bare "Mon YYYY" (no day) -> first of that month */
  re=/\b([A-Za-z]{3,9})\.?\s+(\d{4})\b/g;
  while((m=re.exec(s))){
    mo=ccMonthIdx(m[1]);
    if(mo===undefined)continue;
    v=new Date(+m[2],mo,1).getTime();
    if(!isNaN(v)&&v>best)best=v;
  }
  return best;
}
function earliestActionTs(t){
  var acts=t&&t.actions;if(!acts)return 0;
  if(!Array.isArray(acts))acts=[acts];
  var earliest=Infinity;
  acts.forEach(function(a){
    var m=/^\s*\[(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?\s*(\d{4})?/.exec(String(a));
    if(!m)return;
    var mo=CC_MONTHS[m[2].toLowerCase()];if(mo===undefined)return;
    var yr=m[3]?parseInt(m[3],10):new Date().getFullYear();
    var v=new Date(yr,mo,parseInt(m[1],10)).getTime();
    if(!isNaN(v)&&v<earliest)earliest=v;
  });
  return earliest===Infinity?0:earliest;
}
function cardSourceTs(t){
  var v=sourceDateFromText(t&&t.source);
  if(v)return v;
  if(t&&t.dateAdded){var d=new Date(t.dateAdded).getTime();if(!isNaN(d)&&d)return d;}
  return earliestActionTs(t)||0;
}
function sortBySourceDate(arr){
  return arr.slice().sort(function(x,y){
    return cardSourceTs(y)-cardSourceTs(x);   /* newest source date first; stable for ties */
  });
}
/* Manual order is an opt-in backbone: ranked cards keep their positions while
   unranked arrivals slot around them by source date. */
function orderTier(arr){
  var ranked=arr.filter(function(t){return t&&Number.isFinite(t.tierRank);}).sort(function(a,b){return a.tierRank-b.tierRank;});
  var unranked=sortBySourceDate(arr.filter(function(t){return !t||!Number.isFinite(t.tierRank)?true:false;}));
  var ordered=ranked.slice();
  unranked.forEach(function(task){
    var ts=cardSourceTs(task),at=-1;
    for(var i=0;i<ordered.length;i++){
      if(Number.isFinite(ordered[i].tierRank)&&cardSourceTs(ordered[i])<ts){at=i;break;}
    }
    if(at<0)ordered.push(task);else ordered.splice(at,0,task);
  });
  return ordered;
}
var ccLinkDocument={version:1,links:[]};
async function loadDashboardLinks(){
  try{
    var response=await fetch('https://tracker.lelitte.co.uk/api/links?t='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    var value=await response.json();
    if(value&&Array.isArray(value.links))ccLinkDocument=value;
  }catch(e){console.warn('Dashboard link map unavailable',e);}
}
function ccLinkDestinations(id){
  var seen={};
  return (ccLinkDocument.links||[]).filter(function(link){return link.status==='active'&&(link.ccTaskIds||[]).indexOf(id)>=0;}).map(function(link){
    var target=link.trackerId;if(seen[target])return null;seen[target]=true;
    return {url:'https://tracker.lelitte.co.uk/#'+encodeURIComponent(target),label:target};
  }).filter(Boolean);
}
function ccCloseLinkPicker(){document.querySelectorAll('.dashboard-link-picker').forEach(function(picker){picker.remove();});}
function ccOpenDashboardLinks(event,destinations){
  event.stopPropagation();
  if(destinations.length===1){window.open(destinations[0].url,'cc-tracker-task','noopener');return;}
  ccCloseLinkPicker();
  var picker=document.createElement('div');picker.className='dashboard-link-picker';picker.setAttribute('role','dialog');picker.setAttribute('aria-label','Choose Tracker link');
  var heading=document.createElement('div');heading.className='dashboard-link-picker-title';heading.textContent='Choose Tracker';picker.append(heading);
  destinations.forEach(function(destination){var button=document.createElement('button');button.type='button';button.textContent=destination.label;button.onclick=function(){window.open(destination.url,'cc-tracker-task','noopener');ccCloseLinkPicker();};picker.append(button);});
  document.body.append(picker);var rect=event.currentTarget.getBoundingClientRect();picker.style.left=Math.min(rect.left,window.innerWidth-picker.offsetWidth-12)+'px';picker.style.top=(rect.bottom+6)+'px';
}
function decorateJumpLinks(){
  document.querySelectorAll('.task-card[data-id]').forEach(function(card){
    var grid=card.querySelector('.card-action-grid');if(!grid||grid.children.length<4||grid.querySelector('[data-dashboard-link="tracker"]'))return;
    var destinations=ccLinkDestinations(card.dataset.id);if(!destinations.length)return;
    var button=document.createElement('button');button.type='button';button.className='card-icon dashboard-link-icon';button.dataset.dashboardLink='tracker';button.textContent='T';button.title='Open in Tracker';button.setAttribute('aria-label','Open in Tracker');button.onclick=function(event){ccOpenDashboardLinks(event,destinations);};
    grid.children[3].replaceWith(button);
  });
}
function renderBoard(){
  if(boardDragging){deferredBoardRender=true;return;}
  if(window._ccSortables){window._ccSortables.forEach(function(s){s.destroy();});window._ccSortables=[];}
  var showDone=getShowDone();
  updateDoneToggleBtn();
  TIERS.forEach(function(tier){
    var list=document.getElementById('list-'+tier);
    var count=document.getElementById('count-'+tier);
    var allItems=tasks.filter(function(t){return t.tier===tier;});
    var items=showDone?allItems:allItems.filter(function(t){return !t.done;});
    items=orderTier(items);
    count.textContent=items.length;
    var badge=document.getElementById('badge-'+tier);if(badge)badge.textContent=allItems.length;
    list.innerHTML=items.map(function(t){return cardHTML(t);}).join('');
  });
  renderStaleSummary();
  var badgeTotal=document.getElementById('badge-total'); if(badgeTotal) badgeTotal.textContent=tasks.length;
  var tcToday=document.getElementById('tc-today'); if(tcToday) tcToday.textContent=tasks.filter(function(t){return t.tier==='today'&&!t.done;}).length;
  var tcTom=document.getElementById('tc-tomorrow'); if(tcTom) tcTom.textContent=tasks.filter(function(t){return t.tier==='tomorrow'&&!t.done;}).length;
  var tcWeek=document.getElementById('tc-week'); if(tcWeek) tcWeek.textContent=tasks.filter(function(t){return t.tier==='week'&&!t.done;}).length;
  var tcParked=document.getElementById('tc-parked'); if(tcParked) tcParked.textContent=tasks.filter(function(t){return t.tier==='parked'&&!t.done;}).length;
  var tcAct=document.getElementById('tc-actions'); if(tcAct) tcAct.textContent=tasks.filter(function(t){return!t.done&&(t.actions||[]).some(function(a){return a.includes('[TODO]');});}).length;
  var ft=document.getElementById('focus-tasks');
  if(ft){
    var nowMs=new Date().setHours(0,0,0,0);
    var todayTasks=tasks.filter(function(t){return t.tier==='today'&&!t.done;});
    var html='';
    function focusZone(key,label,bodyHtml){
      var collapsed=storageGet('focus_'+key)==='0'?' collapsed':'';
      var rot=collapsed?' style="transform:rotate(-90deg)"':'';
      return '<div class="focus-zone"><div class="focus-zone-label" onclick="toggleFocusZone(this,\''+key+'\')">' +label+'<span class="focus-chevron"'+rot+'>&#9662;</span></div><div class="focus-zone-body'+collapsed+'">'+bodyHtml+'</div></div>';
    }
    /* ACT NOW — [TODO]s from Today tasks */
    var todos=[];
    todayTasks.forEach(function(t){(t.actions||[]).forEach(function(a){if(a.indexOf('[TODO]')===0)todos.push({id:t.id,text:a.replace('[TODO]','').trim()});});});
    if(todos.length){
      var b='';var show=Math.min(todos.length,5);
      todos.slice(0,show).forEach(function(a){b+='<div class="focus-act-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+ a.text+'</div>';});
      if(todos.length>show){
        b+='<div class="focus-await-extra" style="display:none">';
        todos.slice(show).forEach(function(a){b+='<div class="focus-act-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+ a.text+'</div>';});
        b+='</div>';
        b+='<div class="focus-more" onclick="toggleMoreItems(this)" data-more="+'+(todos.length-show)+' more">+'+(todos.length-show)+' more</div>';
      }
      html+=focusZone('actnow','Act now',b);
    }
    /* WAITING ON — [AWAITING]s from all tasks */
    var awaits=[];
    tasks.filter(function(t){return!t.done;}).forEach(function(t){(t.actions||[]).forEach(function(a){if(a.indexOf('[AWAITING]')===0)awaits.push({id:t.id,text:a.replace('[AWAITING]','').trim()});});});
    if(awaits.length){
      var b='';var show=Math.min(awaits.length,5);
      awaits.slice(0,show).forEach(function(a){b+='<div class="focus-await-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+ a.text+'</div>';});
      if(awaits.length>show){
        b+='<div class="focus-await-extra" style="display:none">';
        awaits.slice(show).forEach(function(a){b+='<div class="focus-await-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+ a.text+'</div>';});
        b+='</div>';
        b+='<div class="focus-more" onclick="toggleMoreItems(this)" data-more="+'+(awaits.length-show)+' more">+'+(awaits.length-show)+' more</div>';
      }
      html+=focusZone('waitingon','Waiting on',b);
    }
    if(!html)html='<div class="focus-empty">No tasks yet</div>';
    ft.innerHTML=html;
  }
  renderStaleBanner();
  applyExpandedDrawers();
  initTierCollapse();
  initSortables();
  decorateJumpLinks();
}

/* INTEL PANEL (Stage 2 — replaces stale banner) */
function renderStaleBanner(){
  var panel=document.getElementById('intel-panel');
  if(!panel)return;
  var nowMs=new Date().setHours(0,0,0,0);
  var todayTasks=tasks.filter(function(t){return t.tier==='today'&&!t.done;});
  var stale=todayTasks.filter(function(t){return staleDays(t)!==null;});
  var ages=stale.map(function(t){return staleDays(t);});
  var todos=[];
  todayTasks.forEach(function(t){(t.actions||[]).forEach(function(a){if(a.indexOf('[TODO]')===0)todos.push({id:t.id,text:a.replace('[TODO]','').trim()});});});
  var awaits=[];
  tasks.filter(function(t){return!t.done;}).forEach(function(t){(t.actions||[]).forEach(function(a){if(a.indexOf('[AWAITING]')===0)awaits.push({id:t.id,text:a.replace('[AWAITING]','').trim()});});});
  if(!stale.length&&!todos.length&&!awaits.length){panel.style.display='none';return;}
  /* Col 1: Watch — stale today */
  var w='<div class="intel-block watch">'
    +'<div class="intel-header">Watch — Stale today <span>In Today 3+ days — move on, park, or mark done</span></div>';
  if(stale.length){
    w+='<div class="intel-scroll">';
    stale.forEach(function(t,i){
      w+='<div class="intel-item" onclick="goToCard(\''+t.id+'\')" title="'+escHtml(t.title)+'">'
        +'<span class="intel-days">'+ages[i]+'d</span>'
        +'<span class="intel-item-text">'+escHtml(t.title)+'</span></div>';
    });
    w+='</div>';
  } else {
    w+='<div class="intel-empty">No stale tasks ✔</div>';
  }
  w+='</div>';
  /* Col 2: Act now ([TODO] from today tasks) */
  var a='<div class="intel-block act"><div class="intel-header">Act now</div>';
  if(todos.length){
    a+='<div class="intel-scroll">';
    todos.forEach(function(x){
      a+='<div class="intel-item" onclick="goToCard(\''+x.id+'\')" title="'+escHtml(x.text)+'">'
        +'<span class="intel-item-text">'+escHtml(x.text)+'</span></div>';
    });
    a+='</div>';
  } else {
    a+='<div class="intel-empty">No pending actions</div>';
  }
  a+='</div>';
  /* Col 3: Waiting on ([AWAITING] from all tasks) */
  var wt='<div class="intel-block wait"><div class="intel-header">Waiting on</div>';
  if(awaits.length){
    wt+='<div class="intel-scroll">';
    awaits.forEach(function(x){
      wt+='<div class="intel-item" onclick="goToCard(\''+x.id+'\')" title="'+escHtml(x.text)+'">'
        +'<span class="intel-item-text">'+escHtml(x.text)+'</span></div>';
    });
    wt+='</div>';
  } else {
    wt+='<div class="intel-empty">Nothing waiting</div>';
  }
  wt+='</div>';
  panel.innerHTML='<div class="intel-panel">'+w+a+wt+'</div>';
  panel.style.display='';
}

/* ============================================================================
   CANONICAL DEFINITION -- this is THE source of truth for "genuine activity".
   Two other files carry deliberate, hand-maintained PORTS of this exact logic
   because neither can import this module (no build step in this repo, and
   work-inbox is a separate repo/deploy):
     - command-centre/docs/mockups/cc-full-v5.html (its own inline <script>,
       local lastActivityTs()/staleDays()/CC_MONTHS)
     - work-inbox/js/app.js (loadCcTicker()'s ccLastActivityTs()/CC_MONTHS)
   ANY change to the genuine-activity definition below (email-tag patterns,
   fallback order, thresholds) MUST be applied in both of those places too, or
   they will drift out of sync again -- this is exactly the bug fixed 15 Sep
   2026 (renderStaleBanner() used raw dateAdded instead of this function, and
   the mockup copied that same bug in). See docs/HANDOVER.md, 15 Sep 2026
   entry, for the full incident and the regression-guard test that checks all
   three copies agree (tests/staleness_parity_test.js). ============================================================================ */

/* Most recent GENUINE activity timestamp for a task.
   Prefers explicit lastUpdated/dateAdded fields; otherwise reads the newest
   [DD Mon YYYY] stamp from the action log. Phase 3.6 (fetch_inbox.py, in
   work-inbox) auto-appends a dated action entry for every related inbound
   email on a task's thread -- meeting reminders, forwards, chasing replies,
   OOO notices -- tagged "(email: <sender> - <subject>)". Left unfiltered,
   that means a task can receive routine, no-progress mail forever and never
   go stale, no matter how long Kevin has actually ignored it. Fixed 21 Aug
   2026 (Phase 2 item 3, work-inbox stability plan): an action entry tagged
   "(email: ...)" only counts as genuine activity when it is Kevin's OWN
   sent reply, tagged "(email: Kevin (sent to: ...)" by the same pipeline
   (see fetch_inbox.py's sent-email handling) -- that's real progress on his
   side. Untagged entries (manual dashboard notes/edits) always count, same
   as before. Root-caused and verified against real live tasks.json data,
   not assumed; see command-centre/HANDOVER.md, 21 Aug 2026 entry.
   Edge case, also found and fixed via that live verification: a task whose
   ENTIRE action log is routine inbound mail (never once actioned by Kevin)
   and has no dateAdded/lastUpdated field would otherwise return 0 genuine
   signal and silently drop out of staleness tracking altogether -- exactly
   the worst case, not a safe one. Falls back to the earliest dated entry
   (a creation-date proxy) so such a task still ages from when it first
   appeared, instead of vanishing from the check.
   Returns 0 only when nothing is dated at all. */
var CC_MONTHS={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
function lastActivityTs(t){
  var best=0,earliest=Infinity,genuine=0;
  ['lastUpdated','dateAdded'].forEach(function(f){
    if(t[f]){var v=new Date(t[f]).getTime();if(!isNaN(v)&&v>best)best=v;}
  });
  var acts=t.actions;
  if(acts){
    if(!Array.isArray(acts))acts=[acts];
    acts.forEach(function(a){
      var s=String(a);
      var m=/^\s*\[(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?\s*(\d{4})?/.exec(s);
      if(!m)return;
      var mo=CC_MONTHS[m[2].toLowerCase()];
      if(mo===undefined)return;
      var yr=m[3]?parseInt(m[3],10):new Date().getFullYear();
      var v=new Date(yr,mo,parseInt(m[1],10)).getTime();
      if(isNaN(v))return;
      if(v<earliest)earliest=v;
      var hasEmailTag=/\(email:/i.test(s);
      var isKevinSent=/\(email:\s*Kevin\s*\(sent to:/i.test(s);
      if(hasEmailTag&&!isKevinSent)return;
      if(v>genuine)genuine=v;
    });
  }
  if(genuine>best)best=genuine;
  if(!best&&earliest!==Infinity)best=earliest;
  return best;
}

/* Days since last activity, but only once it exceeds what the task's own tier
   implies. Returns null when the task is not overdue for attention. */
var CC_STALE_DAYS={today:7,tomorrow:7,week:21,parked:45};
function staleDays(t){
  var ts=lastActivityTs(t);
  if(!ts)return null;
  var days=Math.floor((Date.now()-ts)/(24*3600*1000));
  var threshold=CC_STALE_DAYS[t.tier];
  if(threshold===undefined)threshold=21;
  return days>=threshold?days:null;
}

/* CARD HTML */
function cardHTML(t){
  var done=!!t.done;
  var doneCls=done?'done-card':'';
  var titleDoneCls=done?'done':'';

  /* NEW/UPDATED badge */
  var badge='';
  if(t.dateAdded||t.lastUpdated){
    var cutoff=Date.now()-4*24*3600*1000;
    var addedTs=t.dateAdded?new Date(t.dateAdded).getTime():0;
    var updatedTs=t.lastUpdated?new Date(t.lastUpdated).getTime():0;
    if(updatedTs>cutoff)badge='<span class="new-badge badge-updated">UPDATED</span>';
    else if(addedTs>cutoff)badge='<span class="new-badge badge-new">NEW</span>';
  }

  /* STALE badge - judged against the tier, not a flat age.
     A parked task sitting quiet for a month is working as intended; a task
     still marked Today after weeks of silence is the thing worth surfacing,
     so the urgent tiers get a much shorter fuse. */
  var staleBadge='';
  if(!done){
    var days=staleDays(t);
    if(days!==null)staleBadge='<span class="new-badge badge-stale" title="Marked '+tierLabel(t.tier)+' but no activity logged for '+days+' days">'+days+'D QUIET</span>';
  }

  /* Open-email button -- PORTED VERBATIM from work-inbox's proven opener
     (work-inbox js/app.js _owaWebUrl()/openEmailWeb(), live since 8 Sept
     2026) per Kevin's explicit instruction (8 Sept 2026): "use the wi
     method -- proven and currently working", not a bespoke CC fix. ONE
     path only, replacing the old two/three-branch system (sourceType
     "codex-graph" branch, openmail://<entryId> COM branch, and the
     separate webLink-only branch) entirely: a real Outlook Web deep-link
     (Graph web_link / display_url / webLink, e.g.
     https://outlook.office365.com/owa/?ItemID=...&viewmodel=ReadMessageItem)
     opened via openEmailWeb(); no usable link -> no icon at all, matching
     work-inbox's own behaviour for a card with no web_link. This retires
     openmail:// / desktop Outlook Classic from command-centre entirely,
     per the standing rule recorded the same day in CLAUDE.md Hard Rules,
     work-inbox/CLAUDE.md, and agent-commons/AGENT_DIRECTORY.md Shared
     rules: no machine uses desktop Win32 Outlook any more. */
  var _emailUrl=_owaWebUrl(t);
  var emailIcon=_emailUrl?'<button class="card-icon" aria-label="Open email" title="Open email in Outlook web" onclick="openEmailWeb(event,this)">'+cardSvg('M3 5h18v14H3z M3 6l9 7 9-7')+'</button>':'<span class="card-icon card-icon-placeholder" aria-hidden="true"></span>';
  var editIcon='<button class="card-icon" aria-label="Edit" title="Edit" onclick="startRename(event,\''+t.id+'\')">'+cardSvg('M4 17.5V20h2.5L18 8.5 15.5 6z M14.5 7l2.5 2.5')+'</button>';
  var archiveIcon=done?'<button class="card-icon" aria-label="Restore" title="Restore" onclick="restoreTask(event,\''+t.id+'\')">'+cardSvg('M5 12a7 7 0 1 0 2-5 M5 4v4h4')+'</button>':'<button class="card-icon" aria-label="Archive" title="Archive" onclick="archiveTask(event,\''+t.id+'\')">'+cardSvg('M4 7h16v13H4z M3 4h18v3H3z M9 11h6')+'</button>';
  var deleteIcon='<button class="card-icon" aria-label="Delete" title="Delete" onclick="deleteTask(event,\''+t.id+'\')">'+cardSvg('M5 7h14 M9 7V4h6v3 M7 7l1 13h8l1-13 M10 11v5 M14 11v5')+'</button>';

  var src='';
  if(t.source){
    var sl=t.source.toLowerCase();
    var sc=sl.indexOf('meeting')>=0||sl.indexOf('mtg')>=0?'badge-mtg':
           sl.indexOf('email')>=0?'badge-email':'badge-mtg';
    src='<span class="badge '+sc+'">'+escHtml(t.source)+'</span>';
  }
  var _dp=t.description||'';
  var descPreview=_dp?'<div class="card-desc">'+escHtml(_dp.length>130?_dp.slice(0,130)+'…':_dp)+'</div>':'';
  var desc=t.description?'<div class="dl">Description</div><div class="dv">'+escHtml(t.description)+'</div>':'';
  var actions=t.actions?'<div class="dl">Actions</div><div class="da" id="da-'+t.id+'">'+actionRowsHTML(t.id,t.actions)+'</div>':'';
  var moveBtns=TIERS.filter(function(tier){return tier!==t.tier;}).map(function(tier){return '<button class="move-btn" onclick="moveTo(event,\''+t.id+'\',\''+tier+'\')">' +tierLabel(tier)+'</button>';}).join('');

  var hasDrawer=!!(t.description||(t.actions&&t.actions.length));
  var chevron=hasDrawer?'<button class="card-icon drawer-chevron" aria-label="'+(isExpanded(t.id)?'Collapse':'Expand')+'" aria-expanded="'+(isExpanded(t.id)?'true':'false')+'" aria-controls="drawer-'+t.id+'" title="'+(isExpanded(t.id)?'Collapse':'Expand')+'" onclick="toggleDrawer(\''+t.id+'\',event)">'+cardSvg(isExpanded(t.id)?'M6 9l6 6 6-6':'M9 6l6 6-6 6')+'</button>':'';
  var emptyIcon='<span class="card-icon card-icon-placeholder" aria-hidden="true"></span>';
  return '<div class="task-card '+doneCls+'" id="card-'+t.id+'" data-id="'+t.id+'" data-tier="'+t.tier+'">'
    +'<div class="card-row">'
    +'<span class="card-drag" onclick="event.stopPropagation()">⠇</span>'
    +'<div class="card-body" onclick="toggleDrawer(\''+t.id+'\',event)">'
    +'<div class="card-title '+titleDoneCls+'" id="title-'+t.id+'">'
    +'<span class="card-title-text">'+escHtml(t.title)+'</span>'
    +((src||badge||staleBadge)?'<span class="card-title-pills">'+src+badge+staleBadge+'</span>':'')
    +'</div>'
    +descPreview
    +'</div>'
    +'<div class="card-actions"><div class="card-action-grid">'+(chevron||emptyIcon)+archiveIcon+deleteIcon+emptyIcon+emailIcon+editIcon+'</div></div>'
    +'</div>'
    +'<div class="task-drawer" id="drawer-'+t.id+'">'
    +desc
    +actions
    +'<div class="ai-chat-bar">'
    +'<input class="ai-input" id="ai-input-'+t.id+'" type="text" placeholder="Add context, paste a Teams message, or ask what to do next..." onkeydown="aiInputKeydown(event,\''+t.id+'\')" />'
    +'<button class="ai-log-btn" id="ai-btn-'+t.id+'" onclick="aiLog(\''+t.id+'\')" aria-label="Update with AI" title="Update with AI">&uarr;</button>'
    +'</div>'
    +'<div class="ai-status" id="ai-status-'+t.id+'"></div>'
    +'<div class="drawer-moves">'+moveBtns+'<button class="delete-btn" onclick="deleteTask(event,\''+t.id+'\')" >Delete</button></div>'
    +'</div>'
    +'</div>';
}

function escHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function boldActs(s){return escHtml(s).replace(/\[[^\]]+\]/g,'<strong>$&</strong>');}

/* One row per action-log entry, each with its own remove control so a single
   bad/duplicate line can be deleted without touching the rest of the log or
   the task itself. Indexed by array position in the underlying t.actions
   array (not content, not display order), so deleting one of two byte-
   identical entries removes only the one clicked.
   Display order is newest-first (Kevin, 10 Sep 2026) while the underlying
   t.actions array itself stays oldest-first/append-only -- every writer
   (fetch_inbox.py Phase 3.6, aiLog's push, quick-add's actions:[]) always
   appends new entries to the end, so reversing only at render time is
   sufficient and never needs the storage order itself to change. */
function actionRowsHTML(taskId,acts){
  var arr=Array.isArray(acts)?acts:(acts?[acts]:[]);
  var indexed=arr.map(function(a,i){return {a:a,i:i};});
  indexed.reverse();
  return indexed.map(function(o){
    return '<div class="da-row"><span class="da-text">'+boldActs(String(o.a))+'</span>'
      +'<button type="button" class="da-del" title="Remove this entry" aria-label="Remove this log entry" onclick="deleteAction(event,\''+taskId+'\','+o.i+')">&times;</button></div>';
  }).join('');
}
function tierLabel(t){return{today:'Today',tomorrow:'Tomorrow',week:'This Week',parked:'Parked'}[t]||t;}
function cardSvg(path){return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+path+'"/></svg>';}
function scrollToTier(tier){var el=document.getElementById('sec-wrap-'+tier);if(el)el.scrollIntoView({behavior:'smooth'});}

/* TOGGLE DONE */
function toggleDone(e,id){
  e.stopPropagation();
  var t=tasks.find(function(x){return x.id===id;});
  if(!t)return;
  t.done=!t.done;
  var card=document.getElementById('card-'+id);
  var chk=card.querySelector('.card-done');
  if(t.done){card.classList.add('done-card');if(chk)chk.classList.add('done');}
  else{card.classList.remove('done-card');if(chk)chk.classList.remove('done');}
  var titleEl=document.getElementById('title-'+id);
  if(titleEl)titleEl.classList.toggle('done',t.done);
  updateDoneToggleBtn();
  if(t.done&&!getShowDone()){card.style.transition='opacity .3s';card.style.opacity='0';setTimeout(function(){renderBoard();},320);}
  persistTasks('Done state: '+id+(t.done?' checked':' unchecked'));
}

/* DRAWER */
var dragEndedAt=0;
var lastJumpDrawerId=null;
var DEEP_LINK_CLASSES=['deep-linked-today','deep-linked-tomorrow','deep-linked-week','deep-linked-parked'];
function fadeDeepLink(card){
  var hadHighlight=false;
  DEEP_LINK_CLASSES.forEach(function(name){if(card.classList.contains(name))hadHighlight=true;card.classList.remove(name);});
  if(!hadHighlight)return;
  card.classList.remove('deep-link-fading');
  void card.offsetWidth;
  card.classList.add('deep-link-fading');
  window.setTimeout(function(){card.classList.remove('deep-link-fading');},4000);
}
function clearJumpState(){
  document.querySelectorAll('.task-card').forEach(function(card){fadeDeepLink(card);});
  document.querySelectorAll('.task-drawer[data-opened-by-jump="true"]').forEach(function(drawer){
    var id=drawer.id.replace(/^drawer-/,'');
    if(drawer.classList.contains('open'))toggleDrawer(id);
    drawer.removeAttribute('data-opened-by-jump');
    if(lastJumpDrawerId===id)lastJumpDrawerId=null;
  });
}
function toggleDrawer(id,e){
  if(e){e.stopPropagation();if(Date.now()-dragEndedAt<250)return;}
  var d=document.getElementById('drawer-'+id);
  if(e){d.removeAttribute('data-opened-by-jump');if(lastJumpDrawerId===id)lastJumpDrawerId=null;}
  d.classList.toggle('open');
  var card=document.getElementById('card-'+id);
  if(card){
    var opening=d.classList.contains('open');
    var ids=expandedIds(),at=ids.indexOf(id);
    if(opening&&at<0)ids.push(id);
    if(!opening&&at>=0)ids.splice(at,1);
    saveExpanded(ids);
    var btn=card.querySelector('.drawer-chevron');
    if(btn){btn.setAttribute('aria-expanded',opening?'true':'false');btn.setAttribute('aria-label',opening?'Collapse':'Expand');btn.title=opening?'Collapse':'Expand';btn.innerHTML=cardSvg(opening?'M6 9l6 6 6-6':'M9 6l6 6-6 6');}
    card.classList.toggle('expanded',opening);
  }
}
function applyExpandedDrawers(){
  expandedIds().forEach(function(id){var d=document.getElementById('drawer-'+id);if(d&&!d.classList.contains('open'))toggleDrawer(id);});
  var jumpDrawer=lastJumpDrawerId&&document.getElementById('drawer-'+lastJumpDrawerId);
  if(jumpDrawer&&jumpDrawer.classList.contains('open'))jumpDrawer.setAttribute('data-opened-by-jump','true');
}
function openDrawerForJump(id){
  var d=document.getElementById('drawer-'+id);
  if(!d||d.classList.contains('open'))return;
  toggleDrawer(id);
  d.setAttribute('data-opened-by-jump','true');
  lastJumpDrawerId=id;
}

/* OPEN EMAIL (web) -- the single opener, ported verbatim from work-inbox's
   _owaWebUrl()/openEmailWeb() (live there since 8 Sept 2026). openmail://
   (desktop Outlook Classic / COM) is retired -- see the standing rule in
   CLAUDE.md Hard Rules. Task looked up from the clicked card's data-id, so
   no task-controlled value is interpolated into this inline handler. */
function _owaWebUrl(o){
  if(!o) return '';
  var hosts={'outlook.office.com':1,'outlook.office365.com':1};
  var cands=[o.web_link,o.display_url,o.webLink];
  for(var i=0;i<cands.length;i++){
    var c=cands[i];
    if(!c) continue;
    try{
      var u=new URL(c);
      if(u.protocol==='https:'&&hosts[u.hostname]&&u.pathname.indexOf('/mail/search')!==0)return c;
    }catch(_){}
  }
  return '';
}
function openEmailWeb(e,btn,item){
  e.stopPropagation();
  var card=btn&&btn.closest?btn.closest('.task-card'):null;
  var id=card?card.getAttribute('data-id'):null;
  var t=id?tasks.find(function(x){return x.id===id;}):item;
  if(!t)return;
  var url=_owaWebUrl(t);
  if(url){
    window.open(url,'cc-email-view','noopener');
  }else{
    alert('No usable Outlook Web link is stored for this task (an https link on outlook.office.com / outlook.office365.com is required), so the email cannot be opened from here.');
  }
}

/* RENAME */
function startRename(e,id){
  e.stopPropagation();
  var titleEl=document.getElementById('title-'+id);
  var task=tasks.find(function(t){return t.id===id;});
  if(!task||titleEl.querySelector('input'))return;
  var inp=document.createElement('input');
  inp.type='text';inp.className='title-edit-input';inp.value=task.title;
  inp.onclick=function(ev){ev.stopPropagation();};
  inp.onkeydown=function(ev){
    if(ev.key==='Enter'){ev.preventDefault();finishRename(id,inp.value.trim());}
    if(ev.key==='Escape'){renderBoard();}
  };
  titleEl.innerHTML='';
  titleEl.appendChild(inp);
  inp.focus();inp.select();
}
async function finishRename(id,newTitle){
  if(!newTitle)return;
  var remote=await fetchTasksRemote();
  var merged=mergeRemote(remote);
  var task=merged.find(function(t){return t.id===id;});
  if(task)task.title=newTitle;
  tasks=merged;
  renderBoard();
  await persistTasks('Rename task '+id);
}

/* QUICK ADD */
async function quickAdd(e){
  e.preventDefault();
  var input=document.getElementById('qa-input');
  var tier=document.getElementById('qa-tier').value;
  var title=input.value.trim();
  if(!title)return;
  var newTask={id:'task-'+Date.now(),title:title,tier:tier,source:'manual',summary:'',description:'',actions:[],notes:'',entryId:'',dateAdded:new Date().toISOString().slice(0,10)};
  tasks.push(newTask);
  renderBoard();
  input.value='';
  setTimeout(function(){var card=document.getElementById('card-'+newTask.id);if(card)card.classList.add('flash-new');},50);
  await persistTasks('Add task: '+title);
}

/* MOVE */
async function moveTo(e,id,tier){
  e.stopPropagation();
  var task=tasks.find(function(t){return t.id===id;});
  if(!task)return;
  moveTaskToTier(task,tier);
}

/* DELETE */
async function deleteTask(e,id){
  e.stopPropagation();
  var index=tasks.findIndex(function(t){return t.id===id;});if(index<0)return;
  askDelete(function(){var task=tasks[index];tasks.splice(index,1);renderBoard();persistTasks('Delete task '+id).then(function(ok){if(ok)showSaveToast('success','Deleted','Undo',function(){tasks.splice(index,0,task);renderBoard();persistTasks('Undo delete '+id);});});});
}
function askDelete(action){var d=document.getElementById('cc-confirm-dialog');var b=document.getElementById('cc-confirm-delete');if(!d||!d.showModal){return;}b.onclick=function(e){e.preventDefault();d.close();action();};d.showModal();}
function archiveTask(e,id){e.stopPropagation();var t=tasks.find(function(x){return x.id===id;});if(!t)return;t.done=true;renderBoard();persistTasks('Archive task '+id).then(function(ok){if(ok)showSaveToast('success','Archived','Undo',function(){t.done=false;renderBoard();persistTasks('Undo archive '+id);});});}
function restoreTask(e,id){e.stopPropagation();var t=tasks.find(function(x){return x.id===id;});if(!t)return;t.done=false;renderBoard();persistTasks('Restore task '+id).then(function(ok){if(ok)showSaveToast('success','Restored');});}

/* DELETE ONE ACTION-LOG ENTRY (not the whole task) */
async function deleteAction(e,id,idx){
  if(e)e.stopPropagation();
  var t=tasks.find(function(x){return x.id===id;});
  if(!t||!Array.isArray(t.actions))return;
  var entry=t.actions[idx];
  if(entry===undefined)return;
  askDelete(function(){t.actions.splice(idx,1);var host=document.getElementById('da-'+id);if(host)host.innerHTML=actionRowsHTML(id,t.actions);persistTasks('Remove action log entry: '+t.title);});
}

/* AI UPDATE */
function aiInputKeydown(e,id){
  if(e.key==='Enter'){
    e.preventDefault();
    aiLog(id);
  }
}

async function aiLog(id){
  var task=tasks.find(function(t){return t.id===id;});
  if(!task)return;
  var inputEl=document.getElementById('ai-input-'+id);
  var statusEl=document.getElementById('ai-status-'+id);
  var btn=document.getElementById('ai-btn-'+id);
  var rawText=inputEl?inputEl.value.trim():'';
  if(!rawText){if(statusEl)statusEl.textContent='Paste some text first.';return;}
  if(btn){btn.disabled=true;btn.textContent='...';}
  if(statusEl)statusEl.textContent='';
  try{
    var workerBase=typeof WORKER_URL!=='undefined'?WORKER_URL:'https://cc-tasks-writer.kevinlelitte.workers.dev';
    var res=await fetch(workerBase+'/ai-log',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        taskId:id,
        taskTitle:task.title,
        taskDescription:task.description||'',
        existingActions:task.actions||[],
        rawText:rawText
      })
    });
    if(!res.ok)throw new Error('HTTP '+res.status);
    var data=await res.json();
    if(!data.entry)throw new Error('No entry returned');
    var remote=await fetchTasksRemote();
    var merged=mergeRemote(remote);
    var t2=merged.find(function(x){return x.id===id;});
    if(!t2)throw new Error('Task not found after refresh');
    if(!Array.isArray(t2.actions))t2.actions=[];
    t2.actions.push(data.entry);
    tasks=merged;
    var drawer=document.getElementById('drawer-'+id);
    if(drawer){var da=drawer.querySelector('.da');if(da)da.innerHTML=actionRowsHTML(id,t2.actions);}
    if(inputEl)inputEl.value='';
    if(statusEl)statusEl.textContent='Added: '+data.entry;
    await persistTasks('AI log update: '+task.title);
  }catch(e){
    if(statusEl)statusEl.textContent='Error: '+e.message;
  }finally{
    if(btn){btn.disabled=false;btn.innerHTML='&uarr;';}
  }
}

/* DRAG (tasks) -- Sortable persists the visible drop order as tierRank. */
var boardDragging=false;
var deferredBoardRender=false;
var activeDragPrevious=[];
function clearDragStyles(){
  TIERS.forEach(function(t){var el=document.getElementById('tier-'+t);if(el){el.classList.remove('drag-over','sug-drag-over');}});
}
function safeRenderBoard(){if(boardDragging){deferredBoardRender=true;return;}renderBoard();}
function moveTaskToTier(task,tier){
  var previous=task.tier;if(previous===tier){renderBoard();return;}
  var previousTierRank=task.tierRank;
  task.tier=tier;delete task.tierRank;renderBoard();
  persistTasks('Move task to '+tier+': '+task.title).then(function(ok){
    if(ok)showSaveToast('success','Moved to '+tierLabel(tier),'Undo',function(){task.tier=previous;if(previousTierRank===undefined)delete task.tierRank;else task.tierRank=previousTierRank;renderBoard();persistTasks('Undo move '+task.id);});
    else {loadTasks().then(function(){renderBoard();showSaveToast('error','Move not saved — the board has been reloaded. Please try again.');});}
  });
}
function snapshotTierLayout(tier){
  return tasks.filter(function(t){return t.tier===tier;}).map(function(t){return {id:t.id,tier:t.tier,tierRank:t.tierRank};});
}
function restoreTierLayout(snapshot){
  snapshot.forEach(function(s){var task=tasks.find(function(t){return t.id===s.id;});if(task){task.tier=s.tier;if(s.tierRank===undefined)delete task.tierRank;else task.tierRank=s.tierRank;}});
}
function rankTierFromDom(tier){
  var list=document.getElementById('list-'+tier);if(!list)return;
  var ids=Array.prototype.map.call(list.querySelectorAll('.task-card'),function(el){return el.dataset.id;});
  var visible={};ids.forEach(function(id){visible[id]=true;});
  orderTier(tasks.filter(function(t){return t.tier===tier&&!visible[t.id];})).forEach(function(t){ids.push(t.id);});
  ids.forEach(function(id,index){var task=tasks.find(function(t){return t.id===id;});if(task){task.tier=tier;task.tierRank=index+1;}});
}
function saveDropLayout(affected,previous,movedId){
  affected.forEach(rankTierFromDom);
  renderBoard();
  persistTasks('Save task order').then(function(ok){
    if(ok){var moved=tasks.find(function(t){return t.id===movedId;});var text=moved&&previous.some(function(s){return s.id===movedId&&s.tier!==moved.tier;})?'Moved to '+tierLabel(moved.tier):'Order saved';showSaveToast('success',text,'Undo',function(){restoreTierLayout(previous);renderBoard();persistTasks('Undo task order');});}
    else {loadTasks().then(function(){renderBoard();showSaveToast('error','Order not saved — the board has been reloaded. Please try again.');});}
  });
}
function initSortables(){
  if(!window.Sortable)return;
  window._ccSortables=[];
  TIERS.forEach(function(tier){var list=document.getElementById('list-'+tier);if(!list)return;
    window._ccSortables.push(new Sortable(list,{group:'cc-tiers',animation:150,forceFallback:true,fallbackOnBody:true,ghostClass:'sortable-ghost',chosenClass:'sortable-chosen',dragClass:'sortable-fallback',filter:'button,input,textarea,.task-drawer,.drawer-chevron',preventOnFilter:false,delay:150,delayOnTouchOnly:true,
      onStart:function(){activeDragPrevious=[];TIERS.forEach(function(name){activeDragPrevious=activeDragPrevious.concat(snapshotTierLayout(name));});boardDragging=true;},
      onEnd:function(evt){var id=evt.item&&evt.item.dataset.id;var from=evt.from&&evt.from.id?evt.from.id.replace('list-',''):tier;var target=evt.to&&evt.to.id?evt.to.id.replace('list-',''):tier;if(evt.from===evt.to&&evt.oldIndex===evt.newIndex){activeDragPrevious=[];boardDragging=false;deferredBoardRender=false;dragEndedAt=Date.now();clearDragStyles();renderBoard();return;}var affected=from===target?[target]:[from,target];var previous=activeDragPrevious.filter(function(s){return affected.indexOf(s.tier)>=0;});activeDragPrevious=[];boardDragging=false;dragEndedAt=Date.now();if(id)saveDropLayout(affected,previous,id);else renderBoard();if(deferredBoardRender){deferredBoardRender=false;renderBoard();}}
    }));
  });
}
function onDragOver(e,tier){
  if(sgDragIdx!==null){
    e.preventDefault();e.dataTransfer.dropEffect='move';
    var zone=document.getElementById('tier-'+tier);
    if(zone)zone.classList.add(sgDragIdx!==null?'sug-drag-over':'drag-over');
  }
}
function onDragLeave(e,tier){
  var zone=document.getElementById('tier-'+tier);
  if(zone&&!zone.contains(e.relatedTarget))zone.classList.remove('drag-over','sug-drag-over');
}
async function onDrop(e,tier){
  e.preventDefault();
  document.getElementById('tier-'+tier).classList.remove('drag-over','sug-drag-over');
  if(sgDragIdx!==null){
    await promoteSuggestion(sgDragIdx,tier);
    sgDragIdx=null;
  }
}
function sgDragStart(e,i){
  sgDragIdx=i;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain','suggestion:'+i);
}
function sgDragEnd(){
  sgDragIdx=null;
  clearDragStyles();
}

/* SUGGESTION coverage check */
function suggestionCovered(s){
  if(!s||!s.entry_id)return false;
  return tasks.some(function(t){return t.entryId===s.entry_id;});
}

function inboxDataUrl(file,stampKey){
  var base=(typeof INBOX_RAW==='string'&&INBOX_RAW)?INBOX_RAW:'https://raw.githubusercontent.com/begb0037admin/work-inbox/main';
  return base.replace(/\/$/,'')+'/data/'+file+'?'+(stampKey||'_')+'='+Date.now();
}

/* INBOX SUGGESTIONS */
async function loadInboxSuggestions(){
  var host=document.getElementById('inboxSuggestions');
  if(!host)return;
  try{
    var res=await fetch(inboxDataUrl('inbox_suggestions.json','_'));
    if(!res.ok)throw new Error('fetch failed');
    var data=await res.json();
    var d=sgDismissed();
    var newTasks=(data.new_tasks||[]).filter(function(s){return !d['n_'+s.entry_id]&&!suggestionCovered(s)});
    window.sgList=newTasks;
    var navBadge=document.getElementById('badge-inbox');if(navBadge)navBadge.textContent=newTasks.length;
    var widgetVal=document.getElementById('inbox-widget-val');if(widgetVal)widgetVal.textContent=newTasks.length?newTasks.length+' suggestion'+(newTasks.length!==1?'s':''):'No suggestions';
    if(!newTasks.length){host.innerHTML='';return;}
    var stale=false;
    try{stale=(Date.now()-new Date((data.generated_at||'').replace(' ','T')).getTime())>24*3600*1000}catch(e){}
    var tierChip={today:'<span class="sg-tier sg-tier-today">&#128308; Today</span>',tomorrow:'<span class="sg-tier sg-tier-tomorrow">&#128992; Tomorrow</span>',week:'<span class="sg-tier sg-tier-week">&#128993; This Week</span>'};
    var h='<div class="section sg-section"><div class="section-header"><span class="section-dot" style="background:#378add"></span><span class="section-title">From your inbox</span><span class="section-count">'+newTasks.length+'</span><span class="section-rule"></span></div>';
    h+='<div class="sg-stamp'+(stale?' sg-stale':'')+'">'
      +'Suggested '+escHtml(data.generated_at||'')+(stale?' — stale, briefing needs a refresh':'')
      +' \xb7 drag a card into a list below to add it as a task</div>';
    newTasks.forEach(function(s,i){
      h+='<div class="sg-card" draggable="true" ondragstart="sgDragStart(event,'+i+')" ondragend="sgDragEnd()">'
        +'<div class="sg-title-row">'+(tierChip[s.tier]||tierChip.week)+'<span class="sg-title">'+escHtml(s.title)+'</span></div>'
        +'<div class="sg-desc">'+escHtml(s.description)+'</div>'
        +'<div class="sg-meta">From '+escHtml(s.email_from)+' \xb7 "'+escHtml(s.email_subject)+'" \xb7 '+escHtml(s.received||'')+'</div>'
        +'<div class="sg-actions"><button class="sg-btn"'+(_owaWebUrl({web_link:s.web_link})?' onclick="openTaskEmail('+i+', event)"':' disabled title="Email link not available"')+'>&#128231; Open email</button>'
        +'<button class="sg-btn" onclick="dismissSuggestion(\'n_'+s.entry_id+'\')" >Dismiss</button>'
        +'<button class="sg-btn sg-add" onclick="promoteSuggestion('+i+',\'today\')">+ Today</button>'
        +'<button class="sg-btn sg-add" onclick="promoteSuggestion('+i+',\'tomorrow\')">+ Tomorrow</button>'
        +'<button class="sg-btn sg-add" onclick="promoteSuggestion('+i+',\'week\')">+ This Week</button>'
        +'</div></div>';
    });
    h+='</div>';
    host.innerHTML=h;
  }catch(e){host.innerHTML='';}
}
loadInboxSuggestions();

function openTaskEmail(idx,e){
  var suggestion=window.sgList&&window.sgList[idx];
  if(suggestion)openEmailWeb(e,null,suggestion);
}

async function promoteSuggestion(idx,tier){
  var s=window.sgList&&window.sgList[idx];
  if(!s)return;
  var remote=await fetchTasksRemote();
  var merged=mergeRemote(remote);
  var newTask={id:'task-'+Date.now(),title:s.title,tier:tier,source:s.email_from||'inbox',summary:'',description:s.description||'',actions:[],notes:'',entryId:s.entry_id||'',dateAdded:new Date().toISOString().slice(0,10)};
  merged.push(newTask);
  tasks=merged;
  renderBoard();
  var ok=await persistTasks('Add task from inbox: '+newTask.title);
  if(ok){
    dismissSuggestion('n_'+s.entry_id);
    showView('board');
  } else {
    /* Save failed (e.g. Worker 502) -- roll back the in-memory add so the
       board does not show an unsaved task, and leave the suggestion card
       in the list (dismissSuggestion was never called) instead of
       silently losing it. */
    tasks=tasks.filter(function(t){return t.id!==newTask.id;});
    renderBoard();
  }
  loadInboxSuggestions();
}

/* TIER DROPDOWN */
function toggleTierDrop(){document.getElementById('qa-tier-list').classList.toggle('open');}
function setTier(val,label){
  if(val!=='all') document.getElementById('qa-tier').value=val;
  document.getElementById('qa-tier-label').textContent=label;
  document.querySelectorAll('.sb-qa-sel-list li').forEach(function(li){li.classList.toggle('selected',li.textContent===label);});
  document.getElementById('qa-tier-list').classList.remove('open');
  showView('board');
  filterBoard(val);
}
function filterBoard(tier){
  ['today','tomorrow','week','parked'].forEach(function(t){
    var wrap=document.getElementById('sec-wrap-'+t);
    if(wrap) wrap.style.display=(tier==='all'||tier===t)?'':'none';
  });
}
document.addEventListener('click',function(e){
  var wrap=document.getElementById('qa-tier-wrap');
  if(wrap&&!wrap.contains(e.target))document.getElementById('qa-tier-list').classList.remove('open');
});

/* FOCUS COLLAPSE */
function toggleFocusZone(label,key){
  var body=label.nextElementSibling;
  var chevron=label.querySelector('.focus-chevron');
  var isOpen=!body.classList.contains('collapsed');
  body.classList.toggle('collapsed',isOpen);
  chevron.style.transform=isOpen?'rotate(-90deg)':'';
  storageSet('focus_'+key,isOpen?'0':'1');
}

/* TIER SECTION COLLAPSE */
var TIER_COLLAPSE_KEY='commandCentre_tierCollapse_v1';
function getTierCollapseState(){
  try{return JSON.parse(storageGet(TIER_COLLAPSE_KEY)||'{}');}catch(e){return {};}
}
function applyTierCollapse(tier,collapsed){
  var wrap=document.getElementById('sec-wrap-'+tier);
  var button=document.getElementById('section-toggle-'+tier);
  if(wrap) wrap.classList.toggle('sec-collapsed',collapsed);
  if(button){button.textContent=collapsed?'Expand ▸':'Collapse ▾';button.setAttribute('aria-expanded',collapsed?'false':'true');}
}
function setTierSectionCollapsed(tier,collapsed){
  var state=getTierCollapseState();
  state[tier]=collapsed;
  storageSet(TIER_COLLAPSE_KEY,JSON.stringify(state));
  applyTierCollapse(tier,collapsed);
}
function toggleTierSection(tier,e){
  if(e)e.stopPropagation();
  setTierSectionCollapsed(tier,!getTierCollapseState()[tier]);
}
function initTierCollapse(){
  var state=getTierCollapseState();
  ['today','tomorrow','week','parked'].forEach(function(t){
    applyTierCollapse(t,!!state[t]);
  });
}

/* CLICK ITEM -> JUMP TO CARD */
function goToCard(id){
  var task=tasks.find(function(t){return t.id===id;});
  if(!task)return;
  var tier=task.tier||'today';
  clearJumpState();
  if(task.done&&!getShowDone()){
    storageSet(SHOW_DONE_KEY,'1');
    renderBoard();
  }
  if(getTierCollapseState()[tier])setTierSectionCollapsed(tier,false);
  var card=document.getElementById('card-'+id);
  if(!card)return;
  card.scrollIntoView({behavior:'smooth',block:'center'});
  void card.offsetWidth;
  card.classList.add('deep-linked-'+tier);
  openDrawerForJump(id);
}

/* WAITING ON / ACT NOW EXPAND-COLLAPSE */
function toggleMoreItems(btn){
  var extra=btn.previousElementSibling;
  if(!extra||!extra.classList.contains('focus-await-extra'))return;
  var expanded=extra.style.display!=='';
  extra.style.display=expanded?'none':'';
  btn.textContent=expanded?btn.getAttribute('data-more'):'Show less';
}

/* SIDEBAR RESIZE */
(function(){
  var handle=document.getElementById('sb-resize');
  var sidebar=document.querySelector('.sidebar');
  var stored=storageGet('commandCentre_sidebarW');
  if(stored){var w=parseInt(stored);if(w>=180){sidebar.style.width=w+'px';document.documentElement.style.setProperty('--sidebar-width',w+'px');}}
  var startX,startW;
  handle.addEventListener('mousedown',function(e){
    startX=e.clientX;startW=sidebar.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.userSelect='none';document.body.style.cursor='col-resize';
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
    e.preventDefault();
  });
  function onMove(e){
    var w=Math.max(180,startW+(e.clientX-startX));
    sidebar.style.width=w+'px';
    document.documentElement.style.setProperty('--sidebar-width',w+'px');
  }
  function onUp(){
    storageSet('commandCentre_sidebarW',sidebar.offsetWidth);
    handle.classList.remove('dragging');
    document.body.style.userSelect='';document.body.style.cursor='';
    document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);
  }
})();

/* CLOCK */
function initClock(){
  function tick(){
    var n=new Date();
    var clockEl=document.getElementById('wi-clock-time');
    if(clockEl) clockEl.textContent=n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    var dateEl=document.getElementById('sidebarDate');
    if(dateEl) dateEl.textContent=n.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
  tick(); setInterval(tick,1000);
}

/* TIER FILTER (v5 sidebar) */
function clearTickerSelection(){document.querySelectorAll('.ticker-stat.selected').forEach(function(el){el.classList.remove('selected');});}
function applyFilter(val){
  var sel=document.getElementById('tierSelect');if(sel)sel.value=val;
  filterBoard(val);
  clearTickerSelection();
  if(val!=='all'){var el=document.querySelector('.ticker-stat[data-tier="'+val+'"]');if(el)el.classList.add('selected');}
}
function clickStat(tier){
  var el=document.querySelector('.ticker-stat[data-tier="'+tier+'"]');
  var already=el&&el.classList.contains('selected');
  applyFilter(already?'all':tier);
}

/* SIDEBAR BRIEFING STATS */
async function loadSidebarBriefing(){
  try{
    var res=await fetch(inboxDataUrl('briefing.json','t'));
    if(!res.ok)return;
    var d=await res.json();
    var _days=['Sun','Mon','Tues','Weds','Thurs','Fri','Sat'];
    var _months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function _setCount(id,n){
      var el=document.getElementById(id);if(!el)return;
      el.classList.remove('red','gold');
      if(n==null){el.textContent='—';return;}
      var v=parseInt(n,10);
      if(isNaN(v)){el.textContent='—';return;}
      el.textContent=v+' email'+(v===1?'':'s');
      if(v>=2)el.classList.add('red');else if(v===1)el.classList.add('gold');
    }
    _setCount('wi-urgent-count',d.urgent_count!=null?d.urgent_count:(Array.isArray(d.urgent)?d.urgent.length:null));
    _setCount('wi-needs-count',d.needs_count!=null?d.needs_count:(Array.isArray(d.needs)?d.needs.length:(Array.isArray(d.needs_action)?d.needs_action.length:null)));
    var refEl=document.getElementById('wi-last-refreshed');
    if(refEl&&d.refreshed_at){
      try{
        var _t=new Date(d.refreshed_at.replace(' ','T'));
        if(isNaN(_t.getTime()))throw new Error('unparsed refreshed_at');
        var _hh=_t.getHours().toString().padStart(2,'0');
        var _mm=_t.getMinutes().toString().padStart(2,'0');
        refEl.textContent=_days[_t.getDay()]+' '+_t.getDate()+' '+_months[_t.getMonth()]+' '+_hh+':'+_mm;
      }catch(e){refEl.textContent=d.refreshed_at;}
    }
  }catch(e){}
}

/* SIDEBAR ABSENCES */
async function loadSidebarAbsences(){
  var el=document.getElementById('absencesSidebar');if(!el)return;
  try{
    var res=await fetch(inboxDataUrl('briefing.json','t'));
    if(!res.ok){el.innerHTML='<span class="abs-none">Unavailable</span>';return;}
    var d=await res.json();
    var abs=(d.absences||d.calendar_highlights||[]).filter(Boolean);
    if(!abs.length){el.innerHTML='<span class="abs-none">None recorded</span>';return;}
    function fmtAbsence(a){
      var text=String(a).trim();
      if(text&&!/ - |returns|today|tomorrow|next week|date unknown/i.test(text)){
        text+=' - date unknown';
      }
      return text.replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
    }
    el.innerHTML='<ul class="abs-list">'+abs.map(function(a){return'<li>'+fmtAbsence(a)+'</li>';}).join('')+'</ul>';
  }catch(e){el.innerHTML='<span class="abs-none">Unavailable</span>';}
}

/* INIT */
if(storageGet(SHOW_DONE_KEY)===null)storageSet(SHOW_DONE_KEY,'0');
initClock();
loadSidebarBriefing();
loadSidebarAbsences();
renderCustomLinks();
initTierCollapse();
loadDashboardLinks().then(function(){ return loadTasks(); }).then(function(){
  var hash=window.location.hash.replace('#','');
  if(hash){
    setTimeout(function(){
      goToCard(hash);
    },400);
  }
});
