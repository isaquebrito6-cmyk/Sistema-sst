// ======================================================
// SST Pro — CÓDIGO COMPLETO E CORRIGIDO
// PGR • PCMSO NR-7 • NR-09 • Firebase
// ======================================================

let empresaDados = {};
let listaColaboradores = [];
let listaClinicas = [];
let listaRiscos = [];
let listaExames = [];
let usuarioAtual = null;

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
  if (typeof auth === 'undefined' || typeof db === 'undefined') {
    console.error('Firebase não carregado! Verifique o config.js');
    return;
  }
  
  auth.onAuthStateChanged(user => {
    if (user) {
      usuarioAtual = user;
      document.getElementById('tela-login').classList.remove('ativa');
      document.getElementById('tela-principal').classList.add('ativa');
      carregarDados();
    } else {
      usuarioAtual = null;
      document.getElementById('tela-login').classList.add('ativa');
      document.getElementById('tela-principal').classList.remove('ativa');
    }
  });

  // Navegação
  document.querySelectorAll('.btn-menu').forEach(botao => {
    botao.addEventListener('click', () => {
      const alvo = botao.dataset.tela;
      abrirSecao(alvo);
    });
  });
});

// === LOGIN ===
async function fazerLogin() {
  const email = document.getElementById('email-login').value.trim();
  const senha = document.getElementById('senha-login').value;
  const msgErro = document.getElementById('msg-erro');
  
  if (!email || !senha) {
    msgErro.textContent = 'Preencha e-mail e senha!';
    return;
  }
  
  try {
    await auth.signInWithEmailAndPassword(email, senha);
    msgErro.textContent = '';
  } catch (erro) {
    console.log('Erro login:', erro.code);
    if (erro.code === 'auth/user-not-found') {
      try {
        await auth.createUserWithEmailAndPassword(email, senha);
        msgErro.textContent = 'Conta criada com sucesso!';
      } catch (criaErro) {
        msgErro.textContent = 'Crie o usuário primeiro no Firebase → Authentication';
      }
    } else {
      msgErro.textContent = 'Erro: ' + (erro.message || erro.code);
    }
  }
}

function sair() { auth.signOut(); }

// === RECUPERAÇÃO DE SENHA ===
function mostrarEsqueciSenha() {
  const area = document.getElementById('area-esqueci-senha');
  if (area) area.style.display = 'block';
  const msgSucesso = document.getElementById('msg-sucesso');
  if (msgSucesso) msgSucesso.style.display = 'none';
  const msgErro = document.getElementById('msg-erro');
  if (msgErro) msgErro.textContent = '';
}

function esconderEsqueciSenha() {
  const area = document.getElementById('area-esqueci-senha');
  if (area) area.style.display = 'none';
  const emailRecupera = document.getElementById('email-recupera');
  if (emailRecupera) emailRecupera.value = '';
}

async function enviarLinkSenha() {
  const email = document.getElementById('email-recupera').value.trim();
  const msgErro = document.getElementById('msg-erro');
  const msgSucesso = document.getElementById('msg-sucesso');
  
  if (!email) {
    if (msgErro) msgErro.textContent = 'Digite seu e-mail!';
    return;
  }
  
  try {
    await auth.sendPasswordResetEmail(email);
    if (msgSucesso) {
      msgSucesso.textContent = '✅ Link enviado! Verifique sua caixa de entrada (e spam)';
      msgSucesso.style.display = 'block';
    }
    if (msgErro) msgErro.textContent = '';
    document.getElementById('email-recupera').value = '';
  } catch (erro) {
    if (msgSucesso) msgSucesso.style.display = 'none';
    if (erro.code === 'auth/user-not-found') {
      msgErro.textContent = 'E-mail não cadastrado.';
    } else if (erro.code === 'auth/invalid-email') {
      msgErro.textContent = 'E-mail inválido.';
    } else {
      msgErro.textContent = 'Erro: ' + erro.message;
    }
  }
}

// === NAVEGAÇÃO ===
function abrirSecao(nome) {
  document.querySelectorAll('.btn-menu').forEach(b => b.classList.remove('ativa'));
  document.querySelectorAll(`[data-tela="${nome}"]`).forEach(b => b.classList.add('ativa'));
  document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
  const secao = document.getElementById(`sec-${nome}`);
  if (secao) secao.classList.add('ativa');
  
  if (nome === 'pcmso' || nome === 'nr09') atualizarSelects();
}

// === DADOS DA EMPRESA ===
async function salvarEmpresa() {
  empresaDados = {
    razao: document.getElementById('emp-razao').value,
    fantasia: document.getElementById('emp-fantasia').value,
    cnpj: document.getElementById('emp-cnpj').value,
    endereco: document.getElementById('emp-endereco').value,
    telefone: document.getElementById('emp-tel').value,
    responsavel: document.getElementById('emp-resp').value
  };
  await db.collection('config').doc('empresa').set(empresaDados);
  alert('✅ Dados salvos!');
}

async function carregarEmpresa() {
  try {
    const doc = await db.collection('config').doc('empresa').get();
    if (doc.exists) {
      empresaDados = doc.data();
      if (document.getElementById('emp-razao')) document.getElementById('emp-razao').value = empresaDados.razao || '';
      if (document.getElementById('emp-fantasia')) document.getElementById('emp-fantasia').value = empresaDados.fantasia || '';
      if (document.getElementById('emp-cnpj')) document.getElementById('emp-cnpj').value = empresaDados.cnpj || '';
      if (document.getElementById('emp-endereco')) document.getElementById('emp-endereco').value = empresaDados.endereco || '';
      if (document.getElementById('emp-tel')) document.getElementById('emp-tel').value = empresaDados.telefone || '';
      if (document.getElementById('emp-resp')) document.getElementById('emp-resp').value = empresaDados.responsavel || '';
      if (document.getElementById('nr09-razao')) document.getElementById('nr09-razao').value = empresaDados.razao || '';
      if (document.getElementById('nr09-cnpj')) document.getElementById('nr09-cnpj').value = empresaDados.cnpj || '';
    }
  } catch(e) { console.log('Erro carregar empresa:', e); }
}

// === COLABORADORES ===
async function cadastrarColaborador() {
  const colab = {
    nome: document.getElementById('col-nome').value,
    cpf: document.getElementById('col-cpf').value,
    funcao: document.getElementById('col-funcao').value,
    setor: document.getElementById('col-setor').value,
    admissao: document.getElementById('col-admissao').value
  };
  
  if (!colab.nome) return alert('Preencha o nome!');
  
  await db.collection('colaboradores').add(colab);
  limparCampos('col-');
  carregarColaboradores();
  atualizarSelects();
  alert('✅ Colaborador cadastrado!');
}

async function carregarColaboradores() {
  try {
    const snap = await db.collection('colaboradores').get();
    listaColaboradores = [];
    snap.forEach(doc => listaColaboradores.push({ id: doc.id, ...doc.data() }));
    
    const lista = document.getElementById('lista-colaboradores');
    if (lista) {
      lista.innerHTML = listaColaboradores.map(c => `
        <div class="item-lista">
          <div><strong>${c.nome}</strong><br>${c.funcao} — ${c.setor}</div>
          <button class="btn-excluir" onclick="excluirColab('${c.id}')">Excluir</button>
        </div>
      `).join('');
    }
    const qtd = document.getElementById('qtd-colab');
    if (qtd) qtd.textContent = listaColaboradores.length;
  } catch(e) { console.log('Erro:', e); }
}

async function excluirColab(id) {
  if (confirm('Excluir?')) {
    await db.collection('colaboradores').doc(id).delete();
    carregarColaboradores();
  }
}

// === CLÍNICAS ===
async function cadastrarClinica() {
  const clinica = {
    razao: document.getElementById('clin-razao').value,
    cnpj: document.getElementById('clin-cnpj').value,
    endereco: document.getElementById('clin-endereco').value,
    telefone: document.getElementById('clin-tel').value
  };
  if (!clinica.razao) return alert('Preencha a razão social!');
  await db.collection('clinicas').add(clinica);
  limparCampos('clin-');
  carregarClinicas();
  alert('✅ Clínica cadastrada!');
}

async function carregarClinicas() {
  try {
    const snap = await db.collection('clinicas').get();
    listaClinicas = [];
    snap.forEach(doc => listaClinicas.push({ id: doc.id, ...doc.data() }));
    
    const lista = document.getElementById('lista-clinicas');
    if (lista) {
      lista.innerHTML = listaClinicas.map(c => `
        <div class="item-lista">
          <div><strong>${c.razao}</strong><br>${c.telefone}</div>
          <button class="btn-excluir" onclick="excluirClinica('${c.id}')">Excluir</button>
        </div>
      `).join('');
    }
    const qtd = document.getElementById('qtd-clinicas');
    if (qtd) qtd.textContent = listaClinicas.length;
  } catch(e) { console.log('Erro:', e); }
}

async function excluirClinica(id) {
  if (confirm('Excluir?')) {
    await db.collection('clinicas').doc(id).delete();
    carregarClinicas();
  }
}

// === PGR ===
async function adicionarRisco() {
  const setor = document.getElementById('risco-setor').value;
  const funcao = document.getElementById('risco-funcao').value;
  const medidas = document.getElementById('risco-medidas').value;
  
  if (!setor || !funcao) return alert('Preencha Setor e Função!');
  
  const riscosSelecionados = [];
  document.querySelectorAll('.chk-risco:checked').forEach(cb => riscosSelecionados.push(cb.value));
  
  if (riscosSelecionados.length === 0) return alert('Selecione pelo menos um risco!');
  
  await db.collection('riscos').add({ setor, funcao, riscos: riscosSelecionados, medidas });
  
  document.querySelectorAll('.chk-risco').forEach(cb => cb.checked = false);
  document.getElementById('risco-setor').value = '';
  document.getElementById('risco-funcao').value = '';
  document.getElementById('risco-medidas').value = '';
  
  carregarRiscos();
  alert('✅ Risco adicionado!');
}

async function carregarRiscos() {
  try {
    const snap = await db.collection('riscos').get();
    listaRiscos = [];
    snap.forEach(doc => listaRiscos.push({ id: doc.id, ...doc.data() }));
    
    const lista = document.getElementById('lista-riscos');
    if (lista) {
      lista.innerHTML = listaRiscos.map(r => `
        <div class="item-lista">
          <div><strong>${r.setor} — ${r.funcao}</strong><br>${r.riscos.join(' | ')}</div>
          <button class="btn-excluir" onclick="excluirRisco('${r.id}')">Excluir</button>
        </div>
      `).join('');
    }
  } catch(e) { console.log('Erro:', e); }
}

async function excluirRisco(id) {
  if (confirm('Excluir?')) {
    await db.collection('riscos').doc(id).delete();
    carregarRiscos();
  }
}

function gerarPGR() {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const pgrHTML = `
<style>
  .doc-pagina { font-family:Arial; font-size:12pt; line-height:1.6; padding:20px; }
  .doc-pagina h2 { text-align:center; font-size:16pt; margin-bottom:5px; }
  .doc-pagina h4 { font-size:13pt; margin-top:20px; border-bottom:1px solid #ccc; padding-bottom:5px; }
  .assinaturas { margin-top:50px; display:flex; justify-content:space-between; }
  .linha-assinatura { border-top:1px solid #000; width:45%; text-align:center; padding-top:10px; }
  ul { margin:5px 0; padding-left:20px; }
  hr { border:none; border-top:1px solid #ddd; margin:15px 0; }
</style>
<div class="doc-pagina">
  <h2>PROGRAMA DE GERENCIAMENTO DE RISCOS — PGR</h2>
  <p style="text-align:center;">NR-1 • Portaria MTP nº 426/2021</p>
  <h3 style="text-align:center; margin:15px 0;">${empresaDados.razao || 'Nome da Empresa'}</h3>
  <p style="text-align:center;">CNPJ: ${empresaDados.cnpj || ''}</p>
  <p style="text-align:center;">Data: ${dataHoje}</p>
  
  <h4>1. OBJETIVO</h4>
  <p>Identificar, avaliar e controlar os riscos ocupacionais, garantindo segurança e saúde no trabalho.</p>
  
  <h4>2. INVENTÁRIO DE RISCOS</h4>
  ${listaRiscos.length === 0 ? '<p><em>Nenhum risco cadastrado.</em></p>' : ''}
  ${listaRiscos.map(r => `
    <p><strong>Setor:</strong> ${r.setor} | <strong>Função:</strong> ${r.funcao}</p>
    <p><strong>Riscos:</strong></p>
    <ul>${r.riscos.map(rr => `<li>${rr}</li>`).join('')}</ul>
    <p><strong>Medidas:</strong> ${r.medidas || 'A definir'}</p>
    <hr>
  `).join('')}
  
  <h4>3. PLANO DE AÇÃO</h4>
  <p>Eliminação → Substituição → Controles Técnicos → Administrativos → EPI. Revisão anual.</p>
  
  <div class="assinaturas">
    <div class="linha-assinatura">${empresaDados.responsavel || '___________'}<br>Responsável Legal</div>
    <div class="linha-assinatura">___________<br>Responsável Técnico</div>
  </div>
</div>`;
  const el = document.getElementById('visual-pgr');
  if (el) el.innerHTML = pgrHTML;
  alert('✅ PGR gerado! Use Imprimir → Salvar como PDF.');
}

function gerarPCMSO() {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const riscosUnicos = [...new Set(listaRiscos.flatMap(r => r.riscos))];
  
  const pcmsoHTML = `
<style>
  .doc-pagina { font-family:Arial; font-size:12pt; line-height:1.6; padding:20px; }
  .doc-pagina h2 { text-align:center; font-size:16pt; margin-bottom:5px; }
  .doc-pagina h4 { font-size:13pt; margin-top:20px; border-bottom:1px solid #ccc; padding-bottom:5px; }
  .assinaturas { margin-top:50px; display:flex; justify-content:space-between; }
  .linha-assinatura { border-top:1px solid #000; width:45%; text-align:center; padding-top:10px; }
  ul { margin:5px 0; padding-left:20px; }
</style>
<div class="doc-pagina">
  <h2>PCMSO — PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL</h2>
  <p style="text-align:center;">NR-7 • Portaria MTP nº 426/2021</p>
  <h3 style="text-align:center; margin:15px 0;">${empresaDados.razao || 'Nome da Empresa'}</h3>
  <p style="text-align:center;">CNPJ: ${empresaDados.cnpj || ''}</p>
  <p style="text-align:center;">Data: ${dataHoje}</p>
  
  <h4>1. OBJETIVO</h4>
  <p>Promover e preservar a saúde dos trabalhadores através de ações preventivas e acompanhamento médico.</p>
  
  <h4>2. RISCOS DE REFERÊNCIA</h4>
  ${riscosUnicos.length === 0 ? '<p><em>Cadastre riscos no PGR primeiro.</em></p>' : ''}
  ${riscosUnicos.map(r => `<p>• ${r}</p>`).join('')}
  
  <h4>3. EXAMES OBRIGATÓRIOS</h4>
  <ul>
    <li><strong>Admissional:</strong> Antes de iniciar</li>
    <li><strong>Periódico:</strong> Anual ou conforme risco</li>
    <li><strong>Retorno ao Trabalho:</strong> Após afastamento &gt; 30 dias</li>
    <li><strong>Mudança de Função:</strong> Antes da transferência</li>
    <li><strong>Demissional:</strong> Até o desligamento</li>
  </ul>
  
  <h4>4. DISPOSIÇÕES FINAIS</h4>
  <p>ASO em 2 vias. Arquivamento por 20 anos. Integração com PGR.</p>
  
  <div class="assinaturas">
    <div class="linha-assinatura">${empresaDados.responsavel || '___________'}<br>Responsável Legal</div>
    <div class="linha-assinatura">___________<br>Médico do Trabalho — CRM</div>
  </div>
</div>`;
  const el = document.getElementById('visual-pcmso');
  if (el) el.innerHTML = pcmsoHTML;
  alert('✅ PCMSO gerado! Pronto para impressão.');
}

// === NR-09 ===
function adicionarAgenteNR09() {
  const lista = document.getElementById('nr09-agentes-lista');
  if (!lista) return;
  lista.insertAdjacentHTML('beforeend', `
    <div class="card" style="margin:10px 0; padding:15px; border:1px solid #ddd; border-radius:8px;">
      <input type="text" class="ag-nome" placeholder="Agente (ex: Ruído, Poeira)">
      <input type="text" class="ag-tipo" placeholder="Físico / Químico / Biológico">
      <input type="text" class="ag-valor" placeholder="Valor medido">
      <input type="text" class="ag-limite" placeholder="Limite de exposição">
      <input type="text" class="ag-situacao" placeholder="Situação">
      <button onclick="this.parentElement.remove()" class="btn-excluir">Remover</button>
    </div>`);
}

function adicionarAcaoNR09() {
  const lista = document.getElementById('nr09-acoes-lista');
  if (!lista) return;
  lista.insertAdjacentHTML('beforeend', `
    <div class="card" style="margin:10px 0; padding:15px; border:1px solid #ddd; border-radius:8px;">
      <input type="text" class="ac-prioridade" placeholder="Prioridade">
      <input type="text" class="ac-descricao" placeholder="Medida de controle">
      <input type="text" class="ac-prazo" placeholder="Prazo">
      <input type="text" class="ac-responsavel" placeholder="Responsável">
      <button onclick="this.parentElement.remove()" class="btn-excluir">Remover</button>
    </div>`);
}

function gerarDocumentoNR09() {
  const dataElab = document.getElementById('nr09-data-elab')?.value || new Date().toLocaleDateString('pt-BR');
  const respTec = document.getElementById('nr09-resp-tecnico')?.value || '________________';

  const agentes = document.querySelectorAll('#nr09-agentes-lista .card');
  let tabelaAgentes = '';
  agentes.forEach(ag => {
    const nome = ag.querySelector('.ag-nome')?.value || '';
    if (nome) {
      tabelaAgentes += `<tr><td>${nome}</td><td>${ag.querySelector('.ag-tipo')?.value || ''}</td><td>${ag.querySelector('.ag-valor')?.value || ''}</td><td>${ag.querySelector('.ag-limite')?.value || ''}</td><td>${ag.querySelector('.ag-situacao')?.value || ''}</td></tr>`;
    }
  });

  const acoes = document.querySelectorAll('#nr09-acoes-lista .card');
  let tabelaAcoes = '';
  acoes.forEach(ac => {
    const desc = ac.querySelector('.ac-descricao')?.value || '';
    if (desc) {
      tabelaAcoes += `<tr><td>${ac.querySelector('.ac-prioridade')?.value || ''}</td><td>${desc}</td><td>${ac.querySelector('.ac-prazo')?.value || ''}</td><td>${ac.querySelector('.ac-responsavel')?.value || ''}</td></tr>`;
    }
  });

  const docHTML = `
<style>
  .pagina-nr09 { font-family:Arial; font-size:12pt; line-height:1.6; padding:20px; }
  .pagina-nr09 h1 { text-align:center; font-size:18pt; margin-bottom:5px; }
  .pagina-nr09 h2 { font-size:14pt; margin-top:25px; border-bottom:1px solid #ccc; padding-bottom:5px; }
  .pagina-nr09 table { width:100%; border-collapse:collapse; margin:12px 0; }
  .pagina-nr09 th, .pagina-nr09 td { border:1px solid #333; padding:8px; font-size:11pt; }
  .pagina-nr09 th { background:#eee; font-weight:bold; }
  .assinatura { margin-top:60px; display:flex; justify-content:space-between; }
  .assinatura div { border-top:1px solid #000; width:45%; text-align:center; padding-top:10px; }
</style>
<div class="pagina-nr09">
  <h1>NR-09 — AVALIAÇÃO E
