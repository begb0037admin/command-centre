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
  var badgeTotal=document.getElementById('badge-total'); if(badgeTotal) badgeTotal.textContent=tasks.length;
  var tcToday=document.getElementById('tc-today'); if(tcToday) tcToday.textContent=tasks.filter(function(t){return t.tier==='today'&&!t.done;}).length;
  var tcTom=document.getElementById('tc-tomorrow'); if(tcTom) tcTom.textContent=tasks.filter(function(t){return t.tier==='tomorrow'&&!t.done;}).length;
  var tcWeek=document.getElementById('tc-week'); if(tcWeek) tcWeek.textContent=tasks.filter(function(t){return t.tier==='week'&&!t.done;}).length;
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
      todos.slice(0,show).forEach(function(a){b+='<div class="focus-act-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+a.text+'</div>';});
      if(todos.length>show){
        b+='<div class="focus-await-extra" style="display:none">';
        todos.slice(show).forEach(function(a){b+='<div class="focus-act-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+a.text+'</div>';});
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
      awaits.slice(0,show).forEach(function(a){b+='<div class="focus-await-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+a.text+'</div>';});
      if(awaits.length>show){
        b+='<div class="focus-await-extra" style="display:none">';
        awaits.slice(show).forEach(function(a){b+='<div class="focus-await-item" title="'+a.text.replace(/"/g,'&quot;')+'" onclick="goToCard(\''+a.id+'\')">'+a.text+'</div>';});
        b+='</div>';
        b+='<div class="focus-more" onclick="toggleMoreItems(this)" data-more="+'+(awaits.length-show)+' more">+'+(awaits.length-show)+' more</div>';
      }
      html+=focusZone('waitingon','Waiting on',b);
    }
    if(!html)html='<div class="focus-empty">No tasks yet</div>';
    ft.innerHTML=html;
  }
  renderStaleBanner();
  document.querySelectorAll('.task-card[draggable]').forEach(function(card){
    card.addEventListener('dragstart',onCardDragStart);
    card.addEventListener('dragend',onCardDragEnd);
  });
}

/* INTEL PANEL + SIDEBAR STATS */
function renderStaleBanner(){
  var panel=document.getElementById('intel-panel');
  var sbStats=document.getElementById('sb-stale-stats');
  var nowMs=new Date().setHours(0,0,0,0);
  var todayTasks=tasks.filter(function(t){return t.tier==='today'&&!t.done;});
  var stale=todayTasks.filter(function(t){return t.dateAdded&&Math.floor((nowMs-new Date(t.dateAdded))/86400000)>3;});
  var ages=stale.map(function(t){return Math.floor((nowMs-new Date(t.dateAdded))/86400000);});
  if(sbStats){
    if(stale.length){
      var maxAge=Math.max.apply(null,ages);
      var avgAge=Math.round(ages.reduce(function(s,a){return s+a;},0)/ages.length);
      var over2w=ages.filter(function(a){return a>=14;}).length;
      sbStats.innerHTML='<div class="sb-stale-stats">'
        +'<div class="sb-stale-num">'+stale.length+'</div>'
        +'<div class="sb-stale-label">Tasks stalled<br>in Today</div>'
        +'<div class="sb-stale-row"><span class="sb-stale-row-label">Oldest</span><span class="sb-stale-row-val">'+maxAge+' days</span></div>'
        +'<div class="sb-stale-row"><span class="sb-stale-row-label">Avg age</span><span class="sb-stale-row-val">'+avgAge+' days</span></div>'
        +'<div class="sb-stale-row"><span class="sb-stale-row-label">2+ weeks</span><span class="sb-stale-row-val">'+over2w+' task'+(over2w!==1?'s':'')+'</span></div>'
        +'</div>';
    } else {sbStats.innerHTML='';}
  }
  if(!panel) return;
  /* Block 1: Watch — stale today */
  var blk1='';
  if(stale.length){
    var rows='';
    stale.forEach(function(t,i){rows+='<div class="intel-item" onclick="goToCard(\''+t.id+'\')"><span class="intel-days">'+ages[i]+'d</span><span class="intel-item-text">'+escHtml(t.title)+'</span></div>';});
    blk1='<div class="intel-block watch"><div class="intel-header">Watch — stale today <span>In Today 3+ days — move on, park, or mark done</span></div>'
      +rows+'</div>';
  }
  /* Block 2: Act now ([TODO] from today tasks) */
  var todos=[];
  todayTasks.forEach(function(t){(t.actions||[]).forEach(function(a){if(a.indexOf('[TODO]')===0)todos.push({id:t.id,text:a.replace('[TODO]','').trim()});});});
  var blk2='';
  if(todos.length){
    var showN=Math.min(todos.length,4);var b='';
    todos.slice(0,showN).forEach(function(a){b+='<div class="intel-item" style="display:block" onclick="goToCard(\''+a.id+'\')">'
      +'<div style="font-size:12px;font-weight:600;color:var(--text-dark);margin-bottom:3px">'+escHtml(a.text)+'</div></div>';});
    if(todos.length>showN){b+='<div class="intel-more" onclick="this.previousSibling&&this.previousSibling.style&&(this.style.display=\'none\')">+ '+(todos.length-showN)+' more actions</div>';}
    blk2='<div class="intel-block act"><div class="intel-header">Act now</div>'+b+'</div>';
  }
  /* Block 3: Waiting on ([AWAITING] from all tasks) */
  var awaits=[];
  tasks.filter(function(t){return!t.done;}).forEach(function(t){(t.actions||[]).forEach(function(a){if(a.indexOf('[AWAITING]')===0)awaits.push({id:t.id,text:a.replace('[AWAITING]','').trim()});});});
  var blk3='';
  if(awaits.length){
    var showN=Math.min(awaits.length,5);var b='';
    awaits.slice(0,showN).forEach(function(a){b+='<div class="intel-item" style="display:block" onclick="goToCard(\''+a.id+'\')">'
      +'<span style="font-size:11.5px;color:var(--text-muted)">'+escHtml(a.text)+'</span></div>';});
    if(awaits.length>showN){b+='<div class="intel-more">+ '+(awaits.length-showN)+' more</div>';}
    blk3='<div class="intel-block wait"><div class="intel-header">Waiting on</div>'+b+'</div>';
  }
  var hasContent=blk1||blk2||blk3;
  if(!hasContent){panel.innerHTML='';return;}
  panel.innerHTML=(blk1||'')+(blk2||'')+(blk3||'');
}

/* CARD HTML */
function cardHTML(t){
  var done=!!t.done;
  var checkedCls=done?'done':'';
  var doneCls=done?'done-card':'';

  /* Source + NEW/UPDATED badge inline in title */
  var titleBadge='';
  if(t.dateAdded||t.lastUpdated){
    var cutoff=Date.now()-4*24*3600*1000;
    var addedTs=t.dateAdded?new Date(t.dateAdded).getTime():0;
    var updatedTs=t.lastUpdated?new Date(t.lastUpdated).getTime():0;
    if(updatedTs>cutoff)titleBadge='<span class="badge badge-gold">UPDATED</span>';
    else if(addedTs>cutoff)titleBadge='<span class="badge" style="background:#dcfce7;color:#15803d">NEW</span>';
  }
  if(t.source&&!titleBadge){
    var bCls=/meeting|granola|1-1|recurring/i.test(t.source)?'badge-mtg':'badge-email';
    titleBadge='<span class="badge '+bCls+'">'+escHtml(t.source)+'</span>';
  }

  var emailIcon=t.entryId?'<span class="card-icon" title="Open email" onclick="openEmail(event,\''+escHtml(t.entryId)+'\')">&#9993;</span>':'';
  var editIcon='<span class="card-icon" title="Rename" onclick="startRename(event,\''+t.id+'\')">&#9998;</span>';

  var descText=t.summary||(t.description?t.description.substring(0,150)+(t.description.length>150?'…':''):'');
  var descEl=descText?'<div class="card-desc">'+escHtml(descText)+'</div>':'';

  var desc=t.description?'<div class="dl">Description</div><div class="dv">'+escHtml(t.description)+'</div>':'';
  var actions=t.actions?'<div class="dl">Actions</div><div class="da">'+boldActs(Array.isArray(t.actions)?t.actions.join('\n'):t.actions)+'</div>':'';
  var moveBtns=TIERS.filter(function(tier){return tier!==t.tier;}).map(function(tier){return '<button class="move-btn" onclick="moveTo(event,\''+t.id+'\',\''+tier+'\'">' +tierLabel(tier)+'</button>';}).join('');

  return '<div class="task-card '+doneCls+'" id="card-'+t.id+'" draggable="true" data-id="'+t.id+'" data-tier="'+t.tier+'"'
    +' ondragover="onCardDragOver(event,\''+t.id+'\',\''+t.tier+'\')"'
    +' ondragleave="onCardDragLeave(event,\''+t.id+'\')"'
    +' ondrop="onCardDropOnCard(event,\''+t.id+'\',\''+t.tier+'\')">'
    +'<div class="card-ph-row">'
    +'<span class="card-drag" title="Drag to reorder">⠇</span>'
    +'<button class="card-done '+checkedCls+'" onclick="toggleDone(event,\''+t.id+'\')"></button>'
    +'<div class="card-body" onclick="toggleDrawer(\''+t.id+'\')">'
    +'<div class="card-title '+(done?'done':'')+'" id="title-'+t.id+'">'+escHtml(t.title)+titleBadge+'</div>'
    +descEl
    +'</div>'
    +'<div class="card-actions">'+emailIcon+editIcon+'</div>'
    +'</div>'
    +'<div class="task-drawer" id="drawer-'+t.id+'">'
    +desc
    +actions
    +'<div class="dl">Update with AI</div>'
    +'<textarea class="ai-input" id="ai-input-'+t.id+'" placeholder="Paste raw text here — Teams message, email, portal update — AI will summarise and add to Actions."></textarea>'
    +'<button class="ai-log-btn" id="ai-btn-'+t.id+'" onclick="aiLog(\''+t.id+'\')" >Update with AI</button>'
    +'<div class="ai-status" id="ai-status-'+t.id+'"></div>'
    +'<div class="drawer-moves">'+moveBtns+'<button class="delete-btn" onclick="deleteTask(event,\''+t.id+'\')" >Delete</button></div>'
    +'</div>'
    +'</div>';
}

function escHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function boldActs(s){return escHtml(s).replace(/\[[^\]]+\]/g,'<strong>$&</strong>');}
function tierLabel(t){return{today:'Today',tomorrow:'Tomorrow',week:'This Week',parked:'Parked'}[t]||t;}
function scrollToTier(tier){var el=document.getElementById('tier-'+tier);if(el)el.scrollIntoView({behavior:'smooth'});}

/* TOGGLE DONE */
function toggleDone(e,id){
  e.stopPropagation();
  var t=tasks.find(function(x){return x.id===id;});
  if(!t)return;
  t.done=!t.done;
  var card=document.getElementById('card-'+id);
  var chk=card.querySelector('.card-done');
  if(t.done){card.classList.add('done-card');chk.classList.add('done');}
  else{card.classList.remove('done-card');chk.classList.remove('done');}
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

/* AI UPDATE */
async function aiLog(id){
  var task=tasks.find(function(t){return t.id===id;});
  if(!task)return;
  var inputEl=document.getElementById('ai-input-'+id);
  var statusEl=document.getElementById('ai-status-'+id);
  var btn=document.getElementById('ai-btn-'+id);
  var rawText=inputEl?inputEl.value.trim():'';
  if(!rawText){if(statusEl)statusEl.textContent='Paste some text first.';return;}
  if(btn){btn.disabled=true;btn.textContent='Processing…';}
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
    if(drawer){var da=drawer.querySelector('.da');if(da)da.innerHTML=boldActs(Array.isArray(t2.actions)?t2.actions.join('\n'):t2.actions);}
    if(inputEl)inputEl.value='';
    if(statusEl)statusEl.textContent='Added: '+data.entry;
    await persistTasks('AI log update: '+task.title);
  }catch(e){
    if(statusEl)statusEl.textContent='Error: '+e.message;
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Update with AI';}
  }
}

/* DRAG (tasks) */
function onCardDragStart(e){
  dragId=e.currentTarget.dataset.id;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed='move';
}
function onCardDragEnd(e){
  e.currentTarget.classList.remove('dragging');
  clearDragStyles();
  dragId=null;
}
function clearDragStyles(){
  TIERS.forEach(function(t){var el=document.getElementById('tier-'+t);if(el){el.classList.remove('drag-over','sug-drag-over');}});
  document.querySelectorAll('.task-card.drop-before,.task-card.drop-after').forEach(function(c){c.classList.remove('drop-before','drop-after');});
}
function onDragOver(e,tier){
  if(dragId||sgDragIdx!==null){
    e.preventDefault();e.dataTransfer.dropEffect='move';
    document.getElementById('tier-'+tier).classList.add(sgDragIdx!==null?'sug-drag-over':'drag-over');
  }
}
function onDragLeave(e,tier){
  document.getElementById('tier-'+tier).classList.remove('drag-over','sug-drag-over');
}
async function onDrop(e,tier){
  e.preventDefault();
  document.getElementById('tier-'+tier).classList.remove('drag-over','sug-drag-over');
  if(dragId){
    var task=tasks.find(function(t){return t.id===dragId;});
    if(task){
      tasks.splice(tasks.indexOf(task),1);
      task.tier=tier;
      tasks.push(task);
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
  e.currentTarget.classList.add(e.clientY<rect.top+rect.height/2?'drop-before':'drop-after');
  document.getElementById('tier-'+tier).classList.add('drag-over');
}
function onCardDragLeave(e,id){
  e.currentTarget.classList.remove('drop-before','drop-after');
}
async function onCardDropOnCard(e,targetId,targetTier){
  e.preventDefault();
  e.stopPropagation();
  var targetCard=e.currentTarget;
  var before=targetCard.classList.contains('drop-before');
  clearDragStyles();
  if(!dragId||dragId===targetId){dragId=null;return;}
  var draggedTask=tasks.find(function(t){return t.id===dragId;});
  if(!draggedTask){dragId=null;return;}
  tasks.splice(tasks.indexOf(draggedTask),1);
  var targetIdx=tasks.findIndex(function(t){return t.id===targetId;});
  draggedTask.tier=targetTier;
  tasks.splice(before?targetIdx:targetIdx+1,0,draggedTask);
  dragId=null;
  renderBoard();
  await persistTasks('Reorder: '+draggedTask.title);
}

/* SUGGESTION coverage check */
function suggestionCovered(s){
  if(!s||!s.entry_id)return false;
  return tasks.some(function(t){return t.entryId===s.entry_id;});
}

/* INBOX SUGGESTIONS */
async function loadInboxSuggestions(){
  var host=document.getElementById('inboxSuggestions');
  if(!host)return;
  try{
    var res=await fetch('https://raw.githubusercontent.com/begb0037admin/work-inbox/main/data/inbox_suggestions.json?_='+Date.now());
    if(!res.ok)throw new Error('fetch failed');
    var data=await res.json();
    var d=sgDismissed();
    var newTasks=(data.new_tasks||[]).filter(function(s){return !d['n_'+s.entry_id]&&!suggestionCovered(s)});
    window.sgList=newTasks;
    var navBadge=document.getElementById('badge-inbox');if(navBadge)navBadge.textContent=newTasks.length;
    var navText=document.getElementById('inbox-widget-text');if(navText)navText.textContent=newTasks.length+' new suggestion'+(newTasks.length===1?'':'s');
    if(!newTasks.length){host.innerHTML='';return;}
    var stale=false;
    try{stale=(Date.now()-new Date((data.generated_at||'').replace(' ','T')).getTime())>24*3600*1000}catch(e){}
    var tierChip={today:'<span class="sg-tier sg-tier-today">&#128308; Today</span>',tomorrow:'<span class="sg-tier sg-tier-tomorrow">&#128992; Tomorrow</span>',week:'<span class="sg-tier sg-tier-week">&#128993; This Week</span>'};
    var h='<div class="section sg-section"><div class="section-header"><span class="section-dot" style="background:#378add"></span><span class="section-title">From your inbox</span><span class="section-count">'+newTasks.length+'</span><span class="section-rule"></span></div>';
    h+='<div class="sg-stamp'+(stale?' sg-stale':'')+'">'
      +'Suggested '+escHtml(data.generated_at||'')+(stale?' — stale, briefing needs a refresh':'')
      +' \xb7 drag a card into a list below to add it as a task</div>';
    newTasks.forEach(function(s,i){
      h+='<div class="sg-card" draggable="true" ondragstart="sgDragIdx='+i+'" ondragend="sgDragIdx=null;clearDragStyles()">'
        +'<div class="sg-title-row">'+(tierChip[s.tier]||tierChip.week)+'<span class="sg-title">'+escHtml(s.title)+'</span></div>'
        +'<div class="sg-desc">'+escHtml(s.description)+'</div>'
        +'<div class="sg-meta">From '+escHtml(s.email_from)+' \xb7 "'+escHtml(s.email_subject)+'" \xb7 '+escHtml(s.received||'')+'</div>'
        +'<div class="sg-actions"><button class="sg-btn" onclick="openTaskEmail(\''+s.entry_id+'\', event)">&#128231; Open email</button>'
        +'<button class="sg-btn" onclick="dismissSuggestion(\'n_'+s.entry_id+'\')" >Dismiss</button>'
        +'<button class="sg-btn sg-add" onclick="promoteSuggestion('+i+',\'today\')">&plus; Today</button>'
        +'<button class="sg-btn sg-add" onclick="promoteSuggestion('+i+',\'tomorrow\')">&plus; Tomorrow</button>'
        +'<button class="sg-btn sg-add" onclick="promoteSuggestion('+i+',\'week\')">&plus; This Week</button>'
        +'</div></div>';
    });
    h+='</div>';
    host.innerHTML=h;
  }catch(e){host.innerHTML='';}
}
loadInboxSuggestions();

/* CLOCK */
function updateCcClock(){
  var n=new Date();
  var timeEl=document.getElementById('cc-clock');
  if(timeEl)timeEl.textContent=n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  var dateEl=document.getElementById('cc-date');
  if(dateEl)dateEl.textContent=n.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}
updateCcClock();
setInterval(updateCcClock,1000);

/* TIER FILTER DROPDOWN (sidebar) */
function applyTierFilter(val){
  showView('board');
  filterBoard(val);
}

/* WORK INBOX DAILY FOCUS WIDGET (cross-dashboard: shows Work Inbox data) */
function formatWiRefreshed(raw){
  /* briefing.json refreshed_at is like "Wednesday 01 July · 12:00" -- reformat to "Weds 1 July 12:00" */
  if(!raw)return '—';
  var m=raw.match(/^(\w+)\s+0?(\d+)\s+(\w+)\D*(\d{1,2}:\d{2})/);
  if(!m)return raw;
  var dayShort={Monday:'Mon',Tuesday:'Tue',Wednesday:'Weds',Thursday:'Thu',Friday:'Fri',Saturday:'Sat',Sunday:'Sun'}[m[1]]||m[1];
  return dayShort+' '+m[2]+' '+m[3]+' '+m[4];
}
async function loadWorkInboxWidget(){
  var urls=['https://github-proxy.lelitte.co.uk/work-inbox/data/briefing.json?t='+Date.now(),INBOX_RAW+'/data/briefing.json?t='+Date.now()];
  var data=null;
  for(var i=0;i<urls.length;i++){
    try{var r=await fetch(urls[i]);if(r.ok){data=await r.json();break;}}catch(e){}
  }
  if(!data)return;
  var set=function(id,val){var el=document.getElementById(id);if(el)el.textContent=val;};
  set('wi-today',(data.prioritiesToday||[]).length);
  set('wi-tomorrow',(data.prioritiesTomorrow||[]).length);
  set('wi-week',(data.prioritiesWeek||[]).length);
  set('wi-parked',(data.fyi||[]).length);
  set('wi-refreshed',formatWiRefreshed(data.refreshed_at));
  set('wi-urgent',(data.urgent||[]).length+' emails');
  set('wi-needs',(data.needs||[]).length+' emails');
  var absEl=document.getElementById('absencesSidebar');
  if(absEl){
    if(data.absences&&data.absences.length){
      absEl.innerHTML='<ul class="abs-list">'+data.absences.map(function(a){return '<li>'+escHtml(a)+'</li>';}).join('')+'</ul>';
    } else {
      absEl.innerHTML='<span class="abs-none">None recorded</span>';
    }
  }
}
loadWorkInboxWidget();
setInterval(loadWorkInboxWidget,300000);

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
  dismissSuggestion('n_'+s.entry_id);
  renderBoard();
  await persistTasks('Add task from inbox: '+newTask.title);
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
  if(tier==='all'){
    TIERS.forEach(function(t){var el=document.getElementById('tier-'+t);if(el)el.style.display='';});
  } else {
    TIERS.forEach(function(t){var el=document.getElementById('tier-'+t);if(el)el.style.display=(t===tier)?'':'none';});
  }
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
  var expanded=extra.style.display!=='none';
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

/* INIT */
localStorage.setItem(SHOW_DONE_KEY,'0');
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

/* HASHCHANGE — fires when WI navigates this tab to a new hash via _ccWindow.location.href */
window.addEventListener('hashchange',function(){
  var id=window.location.hash.replace('#','');
  if(id) goToCard(id);
});
