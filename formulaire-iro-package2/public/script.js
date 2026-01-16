(function(){
  var form = document.getElementById('incidentForm');
  var ref = document.getElementById('ref');
  var dateDecl = document.getElementById('dateDecl');
  var btnPdf = document.getElementById('btnPdf');
  var printContent = document.getElementById('printContent');
  var printDate = document.getElementById('printDate');

  var API_ENDPOINT = window.API_ENDPOINT || '/api/incidents';
  var AUTH_TOKEN = window.AUTH_TOKEN || 'Bearer local';
  var APP_NAME = 'IRO-Portal';

  function genRef(){
    var ts = new Date().toISOString().replace(/[-:TZ\.]/g,'');
    return 'IRO-' + ts.substring(0,8) + '-' + ts.substring(8,14);
  }
  ref.value = genRef();
  dateDecl.valueAsDate = new Date();

  function buildPrintable(data){
    var rows = Object.keys(data).map(function(k){
      return '<tr><th>'+k+'</th><td>'+String(data[k]||'').replace(/</g,'&lt;')+'</td></tr>';
    }).join('');
    printContent.innerHTML = '<table class="print-table">'+rows+'</table>';
    printDate.textContent = new Date().toLocaleString('fr-FR');
  }

  function collectData(){
    function v(id){ var el = document.getElementById(id); return el ? el.value : ''; }
    var r = document.querySelector('input[name="typeEvt"]:checked');
    var impacts = [];
    if(document.getElementById('impactFin').checked) impacts.push('Financier');
    if(document.getElementById('impactQual').checked) impacts.push('Non financier');
    return {
      reference: ref.value,
      entite: v('entite'),
      declarant: v('declarant'),
      dateSurvenance: v('dateSurv'),
      dateConstatation: v('dateConst'),
      dateDeclaration: v('dateDecl'),
      nature: v('nature'),
      description: v('description'),
      typeEvenement: r ? r.value : '',
      impacts: impacts.join(','),
      montantPerte: v('perte'),
      montantRecuperable: v('recup'),
      impactQualitatif: v('impactQualTxt'),
      causes: v('causes'),
      actions: v('actions'),
      observations: v('obs')
    };
  }

  function buildFormData(payload){
    var data = new FormData();
    Object.keys(payload).forEach(function(k){ data.append(k, payload[k]||''); });
    var files = document.getElementById('files').files;
    for(var i=0;i<files.length;i++){ data.append('pieces', files[i], files[i].name); }
    return data;
  }

  function withTimeout(ms){
    var controller = new AbortController();
    var id = setTimeout(function(){ controller.abort(); }, ms);
    return { signal: controller.signal, cancel: function(){ clearTimeout(id); } };
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    var payload = collectData();
    var data = buildFormData(payload);
    var correlationId = payload.reference + '-' + Math.random().toString(36).slice(2,8);
    var timeout = withTimeout(15000);

    fetch(API_ENDPOINT, {
      method: 'POST', body: data,
      headers: {
        'Authorization': AUTH_TOKEN,
        'X-Request-Id': correlationId,
        'X-App': APP_NAME,
        'X-Org-Unit': payload.entite
      }, signal: timeout.signal
    }).then(function(resp){
      timeout.cancel();
      var ct = resp.headers.get('content-type')||'';
      if(!resp.ok){
        return (ct.includes('application/json')? resp.json() : resp.text()).then(function(err){
          throw new Error('HTTP '+resp.status+' '+resp.statusText+' — '+(typeof err==='string'?err:JSON.stringify(err)));
        });
      }
      return ct.includes('application/json')? resp.json() : resp.text();
    }).then(function(res){
      var refServer = (typeof res==='object' && res && res.reference)? res.reference : payload.reference;
      alert('Incident enregistré avec succès.
Référence: '+ refServer + '

ID de corrélation: '+ correlationId);
      buildPrintable(payload); window.print();
      form.reset(); ref.value = genRef(); dateDecl.valueAsDate = new Date();
    }).catch(function(err){
      console.error('Erreur API', err);
      alert('Échec de l'enregistrement: '+ err.message + '
ID de corrélation: '+ correlationId);
    });
  });

  btnPdf.addEventListener('click', function(){ var payload = collectData(); buildPrintable(payload); window.print(); });
})();
