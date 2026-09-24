
var WRITER='https://cc-tasks-writer.kevinlelitte.workers.dev';
var PROXY='https://github-proxy.lelitte.co.uk/command-centre';
var INBOX_RAW='https://raw.githubusercontent.com/begb0037admin/work-inbox/main';
var TIERS=['today','tomorrow','week','parked'];
var DONE_KEY='commandCentre_done_v1';
var DISMISS_KEY='cc_sg_dismissed_v1';
var SHOW_DONE_KEY='cc_show_done_v1';

var tasks=[];
var dragId=null;
var sgDragIdx=null;

/* BASE SHA (Phase 3, 21 Aug 2026) -- what tasks.json's blob sha was the
   moment we last loaded/saved it, so the Worker can tell "nothing changed
   server-side since this page loaded, safe to write directly" from
   "something changed, must merge" BEFORE attempting a write, instead of
   only reacting to a 409 that (per the Worker's own Phase 1 finding)
   almost never actually happens for this exact failure mode. Verified live
   this session that raw.githubusercontent.com's ETag header is NOT usable
   for this (it's a 64-hex SHA-256 of the raw bytes, not GitHub's 40-hex
   blob SHA-1) -- so this is captured via one direct, unauthenticated
   GitHub Contents API call, once per page load, not on every poll. */
var _tasksBaseSha=null;
async function refreshTasksBaseSha(){
  try{
    var r=await fetch('https://api.github.com/repos/begb0037admin/command-centre/contents/data/tasks.json?ref=main&t='+Date.now(),{headers:{'Accept':'application/vnd.github.v3+json'}});
    if(r.ok){var j=await r.json();_tasksBaseSha=j.sha||null;}
  }catch(e){/* best-effort -- baseSha capture is an enhancement, page must still work without it */}
}

/* LOAD TASKS */
async function loadTasks(){
  var t=Date.now();
  var urls=[PROXY+'/data/tasks.json?t='+t,'https://raw.githubusercontent.com/begb0037admin/command-centre/main/data/tasks.json?t='+t];
  var data=null;
  for(var i=0;i<urls.length;i++){
    try{var r=await fetch(urls[i]);if(r.ok){data=await r.json();break;}}catch(e){}
  }
  if(!data){console.warn('Could not load tasks');return;}
  tasks=Array.isArray(data)?data:(data.tasks||[]);
  var lu=document.getElementById('last-updated');
  if(lu){var n=new Date();lu.textContent='Updated '+n.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' '+n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
  renderBoard();
  renderCustomLinks();
  refreshTasksBaseSha();
}

/* FETCH REMOTE (for merge guard) */
async function fetchTasksRemote(){
  var t=Date.now();
  var urls=[PROXY+'/data/tasks.json?t='+t,'https://raw.githubusercontent.com/begb0037admin/command-centre/main/data/tasks.json?t='+t];
  for(var i=0;i<urls.length;i++){
    try{var r=await fetch(urls[i]);if(r.ok){var d=await r.json();return Array.isArray(d)?d:(d.tasks||[]);}}catch(e){}
  }
  return null;
}

function mergeRemote(remote){
  if(!remote)return tasks;
  var localMap={};
  tasks.forEach(function(t){localMap[t.id]=t;});
  remote.forEach(function(rt){
    if(localMap[rt.id]){
      var lt=localMap[rt.id];
      var rtActions=Array.isArray(rt.actions)?rt.actions.join(''):rt.actions||'';
      var ltActions=Array.isArray(lt.actions)?lt.actions.join(''):lt.actions||'';
      if(rtActions.length>ltActions.length)lt.actions=rt.actions;
    } else {
      tasks.push(rt);
      localMap[rt.id]=rt;
    }
  });
  return tasks;
}

/* PERSIST */
function showSaveToast(state,text){
  var t=document.getElementById('save-toast');
  if(!t)return;
  t.className='visible '+state;
  t.textContent=text;
  clearTimeout(t._timer);
  if(state==='error'){
    t.onclick=function(){t.className='';}
  } else {
    t._timer=setTimeout(function(){t.className='';},2500);
  }
}
/* Phase 3 (21 Aug 2026): the old client-side one-way "CC done -> tick WI"
   sync (syncDoneToInbox, formerly here) is REMOVED, not repaired. Decision,
   documented per the task brief:
   - It computed WI tick keys as date-scoped positions
     (dateKey+'_pri_'+tier+'_'+i / dateKey+'_'+section+'_'+j) -- the
     pre-17-Aug scheme. Work-inbox's own tick keys have since moved to
     stable 'eid_<entry_id>'/'id_<ccTaskId>' identifiers precisely because
     the old scheme silently detached from its card on any reorder/reshuffle
     (the 17 Aug tick-resurrection incident). Reviving this function as-is
     would have re-shipped that exact bug for every sync-driven tick.
   - It was also already dead code -- confirmed live, toggleDone() never
     called it -- so "repair" would mean rewriting it entirely against the
     current key scheme, which is exactly what the Worker-side
     syncTaskDoneToTicks() (cloudflare-worker/cc-tasks-writer-proposed.js)
     now does instead, from ONE place shared by both repos' write paths
     rather than a second, divergence-prone client implementation that also
     depended on a fragile direct cross-origin fetch of work-inbox's
     briefing.json/ticks.json from this page.
   Done-state sync (both directions, reversible) now happens server-side in
   the Worker as a side effect of persistTasks()/work-inbox's pushTicks() --
   see that file's DONE-SYNC section. Nothing else in this file needs to
   drive it. */

async function persistTasks(msg){
  showSaveToast('saving','Saving…');
  try{
    var res=await fetch(WRITER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({doc:{tasks:tasks},message:msg,baseSha:_tasksBaseSha})});
    var body=null;
    try{body=await res.json();}catch(e){}
    if(!res.ok||!(body&&body.ok)){
      showSaveToast('error','Save failed — HTTP '+res.status+' (tap to dismiss)');
      console.warn('Writer error',res.status,body&&body.error);
      return false;
    } else {
      if(body.sha)_tasksBaseSha=body.sha;
      showSaveToast('success','Saved ✓');
      return true;
    }
  }catch(e){
    showSaveToast('error','Save failed — '+e.message+' (tap to dismiss)');
    console.warn('Writer fetch failed',e);
    return false;
  }
}
