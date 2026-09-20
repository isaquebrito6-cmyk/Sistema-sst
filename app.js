// ======================================================
// SST Pro — Lógica Principal
// PGR • PCMSO • Colaboradores • Clínicas • Documentos
// ======================================================

let empresaDados = {};
let listaColaboradores = [];
let listaClinicas = [];
let listaRiscos = [];
let listaExames = [];
let usuarioAtual = null;

// === INICIALIZAÇÃO ===
auth.onAuthStateChanged(user => {
  if (user) {
    usuarioAtual = user;
    document.getElementById('tela-login').classList.remove('ativa');
    document.getElementById('tela-principal').classList.add('ativa');
    carregarDados();
    atualizarPainel();
  } else {
    usuarioAtual = null;
    document.getElementById('tela-login').classList.add('ativa');
    document.getElementById('tela-principal').classList.remove('ativa');
  }
});

// === LOGIN ===
async function fazerLogin() {
  const email = document.getElementById('email-login').value.trim();
  const senha = document.getElementById('senha-login').value;
  const msgErro = document.getElementById('msg-erro');
  
  try {
    await auth.signInWithEmailAndPassword(email, senha);
    msgErro.textContent = '';
  } catch (erro) {
    if (erro.code === 'auth/user-not-found') {
      try {
        await auth.createUserWithEmailAndPassword(email, senha);
        msgErro.textContent = 'Conta criada! Você entrou.';
      } catch (criaErro) {
        msgErro.textContent = 'Crie a senha primeiro no Firebase → Authentication';
      }
    } else {
      msgErro.textContent = 'Erro: ' + erro.message;
    }
  }
}

function sair() { auth.signOut(); }

// === NAVEGAÇÃO ===
document.querySelectorAll('.btn-menu').forEach(botao => {
  botao.addEventListener('click', () => {
    const alvo = botao.dataset.tela;
    abrirSecao(alvo);
  });
});

function abrirSecao(nome) {
  document.querySelectorAll('.btn-menu').forEach(b => b.classList.remove('ativa'));
  document.querySelectorAll(`[data-tela="${nome}"]`).forEach(b => b.classList.add('ativa'));
  document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
  document.getElementById(`sec-${nome}`).classList.add('ativa');
  
  if (nome === 'pcmso') atualizarSelects();
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
  alert('✅ Dados da empresa salvos!');
}

async function carregarEmpresa() {
  const doc = await db.collection('config').doc('empresa').get();
  if (doc.exists) {
    empresaDados = doc.data();
    document.getElementById('emp-razao').value = empresaDados.razao || '';
    document.getElementById('emp-fantasia').value = empresaDados.fantasia || '';
    document.getElementById('emp-cnpj').value = empresaDados.cnpj || '';
    document.getElementById('emp-endereco').value = empresaDados.endereco || '';
    document.getElementById('emp-tel').value = empresaDados.telefone || '';
    document.getElementById('emp-resp').value = empresaDados.responsavel || '';
  }
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
  const snap = await db.collection('colaboradores').get();
  listaColaboradores = [];
  snap.forEach(doc => {
    listaColaboradores.push({ id: doc.id, ...doc.data() });
  });
  
  const lista = document.getElementById('lista-colaboradores');
  lista.innerHTML = listaColaboradores.map(c => `
    <div class="item-lista">
      <div><strong>${c.nome}</strong><br>${c.funcao} — ${c.setor}</div>
      <button class="btn-excluir" onclick="excluirColab('${c.id}')">Excluir</button>
    </div>
  `).join('');
  
  document.getElementById('qtd-colab').textContent = listaColaboradores.length;
}

async function excluirColab(id) {
  if (confirm('Excluir este colaborador?')) {
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
  const snap = await db.collection('clinicas').get();
  listaClinicas = [];
  snap.forEach(doc => {
    listaClinicas.push({ id: doc.id, ...doc.data() });
  });
  
  const lista = document.getElementById('lista-clinicas');
  lista.innerHTML = listaClinicas.map(c => `
    <div class="item-lista">
      <div><strong>${c.razao}</strong><br>${c.telefone}</div>
      <button class="btn-excluir" onclick="excluirClinica('${c.id}')">Excluir</button>
    </div>
  `).join('');
  
  document.getElementById('qtd-clinicas').textContent = listaClinicas.length;
}

async function excluirClinica(id) {
  if (confirm('Excluir esta clínica?')) {
    await db.collection('clinicas').doc(id).delete();
    carregarClinicas();
  }
}

// === PGR — RISCOS ===
async function adicionarRisco() {
  const setor = document.getElementById('risco-setor').value;
  const funcao = document.getElementById('risco-funcao').value;
  const medidas = document.getElementById('risco-medidas').value;
  
  if (!setor || !funcao) return alert('Preencha Setor e Função!');
  
  const riscosSelecionados = [];
  document.querySelectorAll('.chk-risco:checked').forEach(cb => {
    riscosSelecionados.push(cb.value);
  });
  
  if (riscosSelecionados.length === 0) return alert('Selecione pelo menos um tipo de risco!');
  
  const risco = { setor, funcao, riscos: riscosSelecionados, medidas };
  await db.collection('riscos').add(risco);
  
  document.querySelectorAll('.chk-risco').forEach(cb => cb.checked = false);
  document.getElementById('risco-setor').value = '';
  document.getElementById('risco-funcao').value = '';
  document.getElementById('risco-medidas').value = '';
  
  carregarRiscos();
  alert('✅ Risco adicionado!');
}

async function carregarRiscos() {
  const snap = await db.collection('riscos').get();
  listaRiscos = [];
  snap.forEach(doc => {
    listaRiscos.push({ id: doc.id, ...doc.data() });
  });
  
  const lista = document.getElementById('lista-riscos');
  lista.innerHTML = listaRiscos.map(r => `
    <div class="item-lista">
      <div>
        <strong>${r.setor} — ${r.funcao}</strong><br>
        ${r.riscos.join(' | ')}
      </div>
      <button class="btn-excluir" onclick="excluirRisco('${r.id}')">Excluir</button>
    </div>
  `).join('');
}

async function excluirRisco(id) {
  if (confirm('Excluir este risco?')) {
    await db.collection('riscos').doc(id).delete();
    carregarRiscos();
  }
}

// === GERAÇÃO DO PGR ===
function gerarPGR() {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  
  const pgrHTML = `
    <div class="cabecalho">
      <h2>PROGRAMA DE GERENCIAMENTO DE RISCOS — PGR</h2>
      <p>NR-1 — Segurança do Trabalho</p>
      <h3>${empresaDados.razao || 'Nome da Empresa'}</h3>
      <p>CNPJ: ${empresaDados.cnpj || ''} | ${empresaDados.endereco || ''}</p>
      <p>Data de elaboração: ${dataHoje}</p>
    </div>
    
    <div class="secao-doc">
      <h4>1. OBJETIVO</h4>
      <p>Estabelecer política de prevenção de acidentes e doenças ocupacionais, identificando, avaliando e controlando os riscos existentes nos ambientes de trabalho, em conformidade com a NR-1.</p>
    </div>
    
    <div class="secao-doc">
      <h4>2. INVENTÁRIO DE RISCOS</h4>
      ${listaRiscos.length === 0 ? '<p><em>Nenhum risco cadastrado.</em></p>' : ''}
      ${listaRiscos.map(r => `
        <p><strong>Setor:</strong> ${r.setor} | <strong>Função:</strong> ${r.funcao}</p>
        <p><strong>Riscos Identificados:</strong></p>
        <ul>${r.riscos.map(rr => `<li>${rr}</li>`).join('')}</ul>
        <p><strong>Medidas de Controle:</strong> ${r.medidas || 'A definir'}</p>
        <hr style="margin:10px 0; border:none; border-top:1px solid #ccc;">
      `).join('')}
    </div>
    
    <div class="secao-doc">
      <h4>3. PLANO DE AÇÃO</h4>
      <p>Implementar medidas preventivas conforme identificado acima, com acompanhamento periódico e revisão anual ou sempre que houver alteração nas condições de trabalho.</p>
    </div>
    
    <div class="assinaturas">
      <div class="linha-assinatura">
        ${empresaDados.responsavel || 'Responsável Legal'}<br>Responsável da Empresa
      </div>
      <div class="linha-assinatura">
        _______________________________<br>Profissional Responsável Técnico
      </div>
    </div>
  `;
  
  document.getElementById('visual-pgr').innerHTML = pgrHTML;
  alert('✅ PGR gerado! Role a página para baixo e use os botões de impressão/salvar.');
}

// === GERAÇÃO DO PCMSO ===
function gerarPCMSO() {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  
  const pcmsoHTML = `
    <div class="cabecalho">
      <h2>PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL — PCMSO</h2>
      <p>NR-7 — Saúde e Segurança do Trabalho</p>
      <h3>${empresaDados.razao || 'Nome da Empresa'}</h3>
      <p>CNPJ: ${empresaDados.cnpj || ''}</p>
      <p>Data de elaboração: ${dataHoje}</p>
    </div>
    
    <div class="secao-doc">
      <h4>1. OBJETIVO</h4>
      <p>Promover e preservar a saúde dos colaboradores, através de ações preventivas e de acompanhamento médico, vinculadas aos riscos ocupacionais identificados no PGR — Programa de Gerenciamento de Riscos.</p>
    </div>
    
    <div class="secao-doc">
      <h4>2. RISCOS OCUPACIONAIS DE REFERÊNCIA</h4>
      ${listaRiscos.length === 0 ? '<p><em>Atenção: Para um PCMSO completo, cadastre os riscos no PGR primeiro.</em></p>' : ''}
      ${[...new Set(listaRiscos.flatMap(r => r.riscos))].map(r => `<p>• ${r}</p>`).join('')}
    </div>
    
    <div class="secao-doc">
      <h4>3. EXAMES OBRIGATÓRIOS</h4>
      <p>Admissional, Periódico, Demissional, Retorno ao Trabalho, Mudança de Função — conforme NR-7 e riscos específicos de cada função.</p>
    </div>
    
    <div class="secao-doc">
      <h4>4. ACOMPANHAMENTO</h4>
      <p>Os exames serão solicitados conforme o controle interno, com emissão de ASO — Atestado de Saúde Ocupacional, arquivamento e acompanhamento de vencimentos.</p>
    </div>
    
    <div class="assinaturas">
      <div class="linha-assinatura">
        ${empresaDados.responsavel || 'Responsável Legal'}<br>Empresa
      </div>
      <div class="linha-assinatura">
        _______________________________<br>Médico do Trabalho — CRM
      </div>
    </div>
  `;
  
  document.getElementById('visual-pcmso').innerHTML = pcmsoHTML;
  alert('✅ PCMSO gerado! Pronto para imprimir ou salvar em PDF.');
}

// === EXAMES ===
async function registrarExame() {
  const colaboradorSel = document.getElementById('exame-colab');
  const clinicaSel = document.getElementById('exame-clinica');
  
  const exame = {
    colaboradorNome: colaboradorSel.options[colaboradorSel.selectedIndex]?.text || '',
    colaboradorId: colaboradorSel.value,
    tipo: document.getElementById('exame-tipo').value,
    clinicaNome: clinicaSel.options[clinicaSel.selectedIndex]?.text || '',
    clinicaId: clinicaSel.value,
    data: document.getElementById('exame-data').value,
    status: 'Pendente'
  };
  
  if (!exame.colaboradorId || !exame.data) return alert('Preencha colaborador e data!');
  
  await db.collection('exames').add(exame);
  carregarExames();
  alert('✅ Exame registrado!');
}

async function carregarExames() {
  const snap = await db.collection('exames').get();
  listaExames = [];
  snap.forEach(doc => {
    listaExames.push({ id: doc.id, ...doc.data() });
  });
  
  const lista = document.getElementById('lista-exames');
  lista.innerHTML = listaExames.map(e => `
    <div class="item-lista">
      <div>
        <strong>${e.colaboradorNome}</strong> — ${e.tipo}<br>
        ${e.clinicaNome} | ${e.data} | <span style="color:${e.status==='Pendente'?'#d97706':'#059669'}">${e.status}</span>
      </div>
      <button class="btn-principal" style="padding:4px 8px; font-size:0.8rem;" onclick="concluirExame('${e.id}')">Concluir</button>
    </div>
  `).join('');
  
  document.getElementById('qtd-pendentes').textContent = listaExames.filter(e => e.status === 'Pendente').length;
}

async function concluirExame(id) {
  await db.collection('exames').doc(id).update({ status: 'Concluído' });
  carregarExames();
}

function atualizarSelects() {
  const selColab = document.getElementById('exame-colab');
  selColab.innerHTML = '<option value="">Selecione...</option>' + 
    listaColaboradores.map(c => `<option value="${c.id}">${c.nome} — ${c.funcao}</option>`).join('');
  
  const selClin = document.getElementById('exame-clinica');
  selClin.innerHTML = '<option value="">Selecione...</option>' + 
    listaClinicas.map(c => `<option value="${c.id}">${c.razao}</option>`).join('');
}

// === IMPRESSÃO ===
function imprimirDocumento(idSecao) {
  const secao = document.getElementById(idSecao);
  if (!secao.innerHTML.trim()) {
    alert('⚠️ Gere o documento primeiro!');
    return;
  }
  window.print();
}

// === UTILITÁRIOS ===
function limparCampos(prefixo) {
  document.querySelectorAll(`[id^="${prefixo}"]`).forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
  });
}

async function carregarDados() {
  await carregarEmpresa();
  await carregarColaboradores();
  await carregarClinicas();
  await carregarRiscos();
  await carregarExames();
  atualizarSelects();
}

function atualizarPainel() {
  document.getElementById('qtd-colab').textContent = listaColaboradores.length;
  document.getElementById('qtd-clinicas').textContent = listaClinicas.length;
  document.getElementById('qtd-pendentes').textContent = listaExames.filter(e => e.status === 'Pendente').length;
}
