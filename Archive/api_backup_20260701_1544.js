
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
    t.onclick=function(){t.className='';};
  } else {
    t._timer=setTimeout(function(){t.className='';},2500);
  }
}

async function persistTasks(msg){
  showSaveToast('saving','Saving…');
  try{
    var res=await fetch(WRITER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({doc:{tasks:tasks},message:msg})});
    if(!res.ok){
      showSaveToast('error','Save failed — HTTP '+res.status+' (tap to dismiss)');
      console.warn('Writer error',res.status);
    } else {
      showSaveToast('success','Saved ✓');
    }
  }catch(e){
    showSaveToast('error','Save failed — '+e.message+' (tap to dismiss)');
    console.warn('Writer fetch failed',e);
  }
}

