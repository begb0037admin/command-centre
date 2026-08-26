/* DONE STATE — persisted in tasks.json via Worker, not localStorage */
function isDone(id){var t=tasks.find(function(x){return x.id===id;});return t?!!t.done:false;}
function saveDone(){/* no-op — done state now in tasks.json */}

/* SHOW/HIDE DONE TOGGLE */
function getShowDone(){return localStorage.getItem(SHOW_DONE_KEY)==='1';}
function toggleShowDone(){
  var next=!getShowDone();
  localStorage.setItem(SHOW_DONE_KEY,next?'1':'0');
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
function getCustomLinks(){return JSON.parse(localStorage.getItem(QL_KEY)||'[]');}
function saveCustomLinks(links){localStorage.setItem(QL_KEY,JSON.stringify(links));}
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
    row.innerHTML='<a class="ql-link-a" href="'+url+'" target="_blank">'+label+'</a>'
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
function sgDismissed(){try{return JSON.parse(localStorage.getItem(DISMISS_KEY)||'{}')}catch(e){return{}}}
function dismissSuggestion(id){
  var d=sgDismissed();d[id]=1;
  localStorage.setItem(DISMISS_KEY,JSON.stringify(d));
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

function renderBoard(){
  var showDone=getShowDone();
  updateDoneToggleBtn();
  TIERS.forEach(function(tier){
    var list=document.getElementById('list-'+tier);
    var count=document.getElementById('count-'+tier);
    var allItems=tasks.filter(function(t){return t.tier===tier;});
    var items=showDone?allItems:allItems.filter(function(t){return !t.done;});
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
      var collapsed=localStorage.getItem('focus_'+key)==='0'?' collapsed':'';
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
  document.querySelectorAll('.task-card').forEach(function(card){
    card.addEventListener('dragstart',onCardDragStart);
    card.addEventListener('dragend',onCardDragEnd);
  });
}

/* INTEL PANEL (Stage 2 — replaces stale banner) */
function renderStaleBanner(){
  var panel=document.getElementById('intel-panel');
  if(!panel)return;
  var nowMs=new Date().setHours(0,0,0,0);
  var todayTasks=tasks.filter(function(t){return t.tier==='today'&&!t.done;});
  var stale=todayTasks.filter(function(t){return t.dateAdded&&Math.floor((nowMs-new Date(t.dateAdded))/86400000)>3;});
  var ages=stale.map(function(t){return Math.floor((nowMs-new Date(t.dateAdded))/86400000);});
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
  var doneCircleCls=done?'done':'';
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

  /* Open-email button. Two openers coexist (Codex Connector Migration research
     doc, Section 5). Outlook COM pipeline tasks keep the exact openmail://<entryId>
     path via openEmail(). Tasks with sourceType "codex-graph" carry a Graph web_link
     that GetItemFromID cannot resolve, so openEmailWeb() opens it as a plain
     Outlook Web Access hyperlink instead. A codex-graph task with no usable link
     still shows the button, visibly de-emphasised, and explains itself on click.
     NOTE (26 Aug 2026): this used to key on the human-readable `source` field
     (a provenance string already populated on every live task, e.g. "Inbox -
     Simon Burford, 2026-08-19 15:51", and rendered as the card's source badge
     below). That was a field-name collision waiting to happen the moment a
     Codex task-writer set source:"codex-graph" for provenance -- it would have
     silently also flipped the opener AND clobbered the badge to the literal
     text "codex-graph". Opener routing now keys on a separate, purpose-built
     `sourceType` field instead. sourceType is optional and absent on all
     tasks today (no tasks.json migration was needed or performed -- same
     approach as how `source` itself was introduced); when sourceType is
     absent or anything other than "codex-graph", this branch is skipped and
     the existing legacy COM branch below (keyed on entryId) applies exactly
     as before. This opener logic does not inspect `source` for routing --
     `source` remains pure human-readable provenance/badge text below (the
     file does still set `source` values for manually created/promoted
     tasks; that write path is unrelated to and unaffected by this opener). */
  var emailIcon='';
  if(t.sourceType==='codex-graph'){
    var _cgHasLink=!!(t.web_link||t.display_url);
    emailIcon='<button class="card-icon"'+(_cgHasLink?'':' style="opacity:.45"')
      +' title="'+(_cgHasLink?'Open email in Outlook web':'Email link unavailable for this task')
      +'" onclick="openEmailWeb(event,this)">&#9993;</button>';
  }else if(t.entryId){
    emailIcon='<button class="card-icon" title="Open email" onclick="openEmail(event,\''+escHtml(t.entryId)+'\')">&#9993;</button>';
  }
  var editIcon='<button class="card-icon" title="Rename" onclick="startRename(event,\''+t.id+'\')">&#9998;</button>';

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

  return '<div class="task-card '+doneCls+'" id="card-'+t.id+'" draggable="true" data-id="'+t.id+'" data-tier="'+t.tier+'"'
    +' ondragover="onCardDragOver(event,\''+t.id+'\',\''+t.tier+'\')"'
    +' ondragleave="onCardDragLeave(event,\''+t.id+'\')"'
    +' ondrop="onCardDropOnCard(event,\''+t.id+'\',\''+t.tier+'\')">'
    +'<div class="card-row">'
    +'<span class="card-drag" onclick="event.stopPropagation()">⠇</span>'
    +'<button class="card-done '+doneCircleCls+'" onclick="toggleDone(event,\''+t.id+'\')" title="Mark done"></button>'
    +'<div class="card-body" onclick="toggleDrawer(\''+t.id+'\')">'
    +'<div class="card-title '+titleDoneCls+'" id="title-'+t.id+'">'
    +'<span class="card-title-text">'+escHtml(t.title)+'</span>'
    +((src||badge||staleBadge)?'<span class="card-title-pills">'+src+badge+staleBadge+'</span>':'')
    +'</div>'
    +descPreview
    +'</div>'
    +'<div class="card-actions">'+emailIcon+editIcon+'</div>'
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
   the task itself. Indexed by array position (not content), so deleting one
   of two byte-identical entries removes only the one clicked. */
function actionRowsHTML(taskId,acts){
  var arr=Array.isArray(acts)?acts:(acts?[acts]:[]);
  return arr.map(function(a,i){
    return '<div class="da-row"><span class="da-text">'+boldActs(String(a))+'</span>'
      +'<button type="button" class="da-del" title="Remove this entry" aria-label="Remove this log entry" onclick="deleteAction(event,\''+taskId+'\','+i+')">&times;</button></div>';
  }).join('');
}
function tierLabel(t){return{today:'Today',tomorrow:'Tomorrow',week:'This Week',parked:'Parked'}[t]||t;}
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
function toggleDrawer(id){
  var d=document.getElementById('drawer-'+id);
  d.classList.toggle('open');
  var card=document.getElementById('card-'+id);
  if(card){
    var opening=d.classList.contains('open');
    card.classList.toggle('expanded',opening);
    card.classList.remove('deep-linked-today','deep-linked-tomorrow','deep-linked-week','deep-linked-parked');
    if(opening){
      var tier=card.dataset.tier;
      if(!tier){var t=tasks.find(function(x){return x.id===id;});tier=t?t.tier:'today';}
      void card.offsetWidth;
      card.classList.add('deep-linked-'+tier);
    }
  }
}

/* OPEN EMAIL */
function openEmail(e,entryId){
  e.stopPropagation();
  window.location.href='openmail://'+entryId;
}

/* OPEN EMAIL (web) -- sourceType:"codex-graph" tasks only, per the Codex Connector
   Migration research doc, Section 5 (opener design), corrected 26 Aug 2026 to key
   on the dedicated `sourceType` machine-routing field rather than the human-
   readable `source` provenance field -- see the field-collision note above
   emailIcon's assignment. The Graph connector's web_link (snake_case;
   display_url as an equivalent fallback) is opened as a plain hyperlink to
   Outlook Web Access in a new tab. GetItemFromID / openmail:// is never used for
   these. Each candidate link is validated independently and only followed if it
   is https:// on a known Outlook Web host; anything missing or unrecognised
   degrades to a visible notice -- never a silent no-op and never a throw. The
   task id is read from the card's data-id via the clicked element, so no
   task-controlled value is interpolated into this inline handler. */
function openEmailWeb(e,btn){
  e.stopPropagation();
  var card=btn&&btn.closest?btn.closest('.task-card'):null;
  var id=card?card.getAttribute('data-id'):null;
  var t=id?tasks.find(function(x){return x.id===id;}):null;
  if(!t)return;
  var hosts={'outlook.office.com':1,'outlook.office365.com':1};
  var url='';
  [t.web_link,t.display_url].forEach(function(c){
    if(url||!c)return;
    try{var u=new URL(c);if(u.protocol==='https:'&&hosts[u.hostname])url=c;}catch(_){}
  });
  if(url){
    window.open(url,'_blank','noopener');
  }else{
    alert('This task came from the Codex connector but has no usable Outlook Web link stored (an https web_link or display_url on outlook.office.com / outlook.office365.com is required), so the email cannot be opened from here.');
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
  task.tier=tier;
  renderBoard();
  await persistTasks('Move task to '+tier+': '+task.title);
}

/* DELETE */
async function deleteTask(e,id){
  e.stopPropagation();
  if(!confirm('Delete this task?'))return;
  tasks=tasks.filter(function(t){return t.id!==id;});
  renderBoard();
  await persistTasks('Delete task '+id);
}

/* DELETE ONE ACTION-LOG ENTRY (not the whole task) */
async function deleteAction(e,id,idx){
  if(e)e.stopPropagation();
  var t=tasks.find(function(x){return x.id===id;});
  if(!t||!Array.isArray(t.actions))return;
  var entry=t.actions[idx];
  if(entry===undefined)return;
  if(!confirm('Remove this log entry?\n\n'+entry))return;
  t.actions.splice(idx,1);
  var host=document.getElementById('da-'+id);
  if(host)host.innerHTML=actionRowsHTML(id,t.actions);
  await persistTasks('Remove action log entry: '+t.title);
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

/* DRAG (tasks) */
var dragEl=null;
var dragDropped=false;

function onCardDragStart(e){
  dragId=e.currentTarget.dataset.id;
  dragEl=e.currentTarget;
  dragDropped=false;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',dragId);
  setTimeout(function(){if(dragEl)dragEl.classList.add('dragging');},0);
}
function onCardDragEnd(e){
  if(dragEl)dragEl.classList.remove('dragging');
  clearDragStyles();
  if(dragId&&!dragDropped)renderBoard();
  dragId=null;
  dragEl=null;
  dragDropped=false;
}
function clearDragStyles(){
  TIERS.forEach(function(t){var el=document.getElementById('tier-'+t);if(el){el.classList.remove('drag-over','sug-drag-over');}});
  document.querySelectorAll('.task-card.drop-before,.task-card.drop-after').forEach(function(c){c.classList.remove('drop-before','drop-after');});
}
function placeDraggedTaskFromDom(tier){
  if(!dragId)return null;
  var task=tasks.find(function(t){return t.id===dragId;});
  if(!task)return null;
  tasks.splice(tasks.indexOf(task),1);
  task.tier=tier;
  var list=document.getElementById('list-'+tier);
  var ids=list?Array.from(list.querySelectorAll('.task-card')).map(function(c){return c.dataset.id;}):[];
  var pos=ids.indexOf(dragId);
  var nextId=pos>=0?ids.slice(pos+1).find(function(id){return id!==dragId;}):null;
  var prevId=pos>=0?ids.slice(0,pos).reverse().find(function(id){return id!==dragId;}):null;
  if(nextId){
    var nextIdx=tasks.findIndex(function(t){return t.id===nextId;});
    tasks.splice(nextIdx>=0?nextIdx:tasks.length,0,task);
  } else if(prevId){
    var prevIdx=tasks.findIndex(function(t){return t.id===prevId;});
    tasks.splice(prevIdx>=0?prevIdx+1:tasks.length,0,task);
  } else {
    var lastIdx=-1;
    tasks.forEach(function(t,i){if(t.tier===tier)lastIdx=i;});
    tasks.splice(lastIdx+1,0,task);
  }
  return task;
}
function onDragOver(e,tier){
  if(dragId||sgDragIdx!==null){
    e.preventDefault();e.dataTransfer.dropEffect='move';
    var zone=document.getElementById('tier-'+tier);
    if(zone)zone.classList.add(sgDragIdx!==null?'sug-drag-over':'drag-over');
    if(dragId&&dragEl){
      var list=document.getElementById('list-'+tier);
      if(list&&!list.contains(dragEl))list.appendChild(dragEl);
    }
  }
}
function onDragLeave(e,tier){
  var zone=document.getElementById('tier-'+tier);
  if(zone&&!zone.contains(e.relatedTarget))zone.classList.remove('drag-over','sug-drag-over');
}
async function onDrop(e,tier){
  e.preventDefault();
  document.getElementById('tier-'+tier).classList.remove('drag-over','sug-drag-over');
  if(dragId){
    var task=placeDraggedTaskFromDom(tier);
    if(task){
      dragDropped=true;
      renderBoard();
      await persistTasks('Move task to '+tier+': '+task.title);
    }
    dragId=null;
  } else if(sgDragIdx!==null){
    await promoteSuggestion(sgDragIdx,tier);
    sgDragIdx=null;
  }
}
function onCardDragOver(e,id,tier){
  if(!dragId||dragId===id)return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect='move';
  document.querySelectorAll('.task-card.drop-before,.task-card.drop-after').forEach(function(c){c.classList.remove('drop-before','drop-after');});
  var rect=e.currentTarget.getBoundingClientRect();
  var before=e.clientY<rect.top+rect.height/2;
  e.currentTarget.classList.add(before?'drop-before':'drop-after');
  if(dragEl&&dragEl!==e.currentTarget){
    e.currentTarget.parentNode.insertBefore(dragEl,before?e.currentTarget:e.currentTarget.nextSibling);
  }
  document.getElementById('tier-'+tier).classList.add('drag-over');
}
function onCardDragLeave(e,id){
  e.currentTarget.classList.remove('drop-before','drop-after');
}
async function onCardDropOnCard(e,targetId,targetTier){
  e.preventDefault();
  e.stopPropagation();
  clearDragStyles();
  if(!dragId)return;
  if(dragId===targetId){
    var parent=e.currentTarget.parentNode;
    var sameTier=parent&&parent.id&&parent.id.indexOf('list-')===0?parent.id.replace('list-',''):targetTier;
    var sameTask=placeDraggedTaskFromDom(sameTier);
    if(sameTask){
      dragDropped=true;
      dragId=null;
      renderBoard();
      await persistTasks('Reorder: '+sameTask.title);
    }
    return;
  }
  var draggedTask=placeDraggedTaskFromDom(targetTier);
  if(!draggedTask){dragId=null;return;}
  dragDropped=true;
  dragId=null;
  renderBoard();
  await persistTasks('Reorder: '+draggedTask.title);
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
        +'<div class="sg-actions"><button class="sg-btn" onclick="openTaskEmail(\''+s.entry_id+'\', event)">&#128231; Open email</button>'
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

function openTaskEmail(entryId,e){
  if(e)e.stopPropagation();
  window.location.href='openmail://'+entryId;
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
  localStorage.setItem('focus_'+key,isOpen?'0':'1');
}

/* TIER SECTION COLLAPSE */
var TIER_COLLAPSE_KEY='commandCentre_tierCollapse_v1';
function getTierCollapseState(){
  try{return JSON.parse(localStorage.getItem(TIER_COLLAPSE_KEY)||'{}');}catch(e){return {};}
}
function applyTierCollapse(tier,collapsed){
  var wrap=document.getElementById('sec-wrap-'+tier);
  var chevron=document.getElementById('chev-'+tier);
  if(wrap) wrap.classList.toggle('sec-collapsed',collapsed);
  if(chevron) chevron.style.transform=collapsed?'rotate(-90deg)':'';
}
function toggleTierSection(tier){
  var state=getTierCollapseState();
  var collapsed=!state[tier];
  state[tier]=collapsed;
  localStorage.setItem(TIER_COLLAPSE_KEY,JSON.stringify(state));
  applyTierCollapse(tier,collapsed);
}
function initTierCollapse(){
  var state=getTierCollapseState();
  ['today','tomorrow','week','parked'].forEach(function(t){
    applyTierCollapse(t,!!state[t]);
  });
}

/* CLICK ITEM -> JUMP TO CARD */
function goToCard(id){
  var card=document.getElementById('card-'+id);
  if(!card)return;
  card.scrollIntoView({behavior:'smooth',block:'center'});
  var tierEl=card.closest('.task-list');
  var tier=tierEl?tierEl.id.replace('list-',''):(card.dataset.tier||'today');
  card.classList.remove('deep-linked-today','deep-linked-tomorrow','deep-linked-week','deep-linked-parked');
  void card.offsetWidth;
  card.classList.add('deep-linked-'+tier);
  var drawer=document.getElementById('drawer-'+id);
  if(drawer&&!drawer.classList.contains('open'))toggleDrawer(id);
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
  var stored=localStorage.getItem('commandCentre_sidebarW');
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
    localStorage.setItem('commandCentre_sidebarW',sidebar.offsetWidth);
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
localStorage.setItem(SHOW_DONE_KEY,'0');
initClock();
loadSidebarBriefing();
loadSidebarAbsences();
renderCustomLinks();
initTierCollapse();
loadTasks().then(function(){
  var hash=window.location.hash.replace('#','');
  if(hash){
    setTimeout(function(){
      var card=document.getElementById('card-'+hash);
      if(card){
        card.scrollIntoView({behavior:'smooth',block:'center'});
        var _tierEl=card.closest('.task-list');
        var _tier=_tierEl?_tierEl.id.replace('list-',''):'';
        var _dlClass='deep-linked-'+(_tier||'today');
        card.classList.add(_dlClass);
        var drawer=document.getElementById('drawer-'+hash);
        if(drawer&&!drawer.classList.contains('open')) toggleDrawer(hash);
      }
    },400);
  }
});
