// ======================================================
// SST Pro — Sistema Completo
// PGR • PCMSO NR-7 • NR-09 • Colaboradores • Clínicas
// Portaria MTP nº 426/2021
// ======================================================

let empresaDados = {};
let listaColaboradores = [];
let listaClinicas = [];
let listaRiscos = [];
let listaExames = [];
let listaAgentesNR09 = [];
let listaAcoesNR09 = [];
let listaRiscosPCMSO = [];
let listaCalendarioPCMSO = [];
let usuarioAtual = null;

// === INICIALIZAÇÃO FIREBASE ===
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
      msgErro.textContent = 'E-mail não cadastrado. Verifique o endereço.';
    } else if (erro.code === 'auth/invalid-email') {
      msgErro.textContent = 'E-mail inválido.';
    } else {
      msgErro.textContent = 'Erro: ' + erro.message;
    }
  }
}

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
  const secao = document.getElementById(`sec-${nome}`);
  if (secao) secao.classList.add('ativa');
  
  if (nome === 'pcmso' || nome === 'pcmso-doc') atualizarSelects();
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
  if (lista) {
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
<style>
  .doc-pagina { font-family:Arial; font-size:12pt; line-height:1.6; }
  .doc-pagina h2 { text-align:center; font-size:16pt; margin-bottom:5px; }
  .doc-pagina h4 { font-size:13pt; margin-top:20px; border-bottom:1px solid #ccc; padding-bottom:5px; }
  .assinaturas { margin-top:50px; display:flex; justify-content:space-between; }
  .linha-assinatura { border-top:1px solid #000; width:45%; text-align:center; padding-top:10px; font-size:11pt; }
  ul { margin:5px 0; padding-left:20px; }
  hr { border:none; border-top:1px solid #ddd; margin:15px 0; }
</style>
<div class="doc-pagina">
  <h2>PROGRAMA DE GERENCIAMENTO DE RISCOS — PGR</h2>
  <p style="text-align:center; font-size:11pt; margin-bottom:20px;">NR-1 — Portaria MTP nº 426/2021</p>
  <h3 style="text-align:center;">${empresaDados.razao || 'Nome da Empresa'}</h3>
  <p style="text-align:center;">CNPJ: ${empresaDados.cnpj || ''} | ${empresaDados.endereco || ''}</p>
  <p style="text-align:center; margin-bottom:20px;">Data de elaboração: ${dataHoje}</p>
  
  <h4>1. OBJETIVO</h4>
  <p>Estabelecer política de prevenção de acidentes e doenças ocupacionais, identificando, avaliando e controlando os riscos nos ambientes de trabalho, em conformidade com a NR-1 — Portaria MTP nº 426/2021.</p>
  
  <h4>2. INVENTÁRIO DE RISCOS</h4>
  ${listaRiscos.length === 0 ? '<p><em>Nenhum risco cadastrado. Preencha os dados acima.</em></p>' : ''}
  ${listaRiscos.map(r => `
    <p><strong>Setor:</strong> ${r.setor} | <strong>Função:</strong> ${r.funcao}</p>
    <p><strong>Riscos Identificados:</strong></p>
    <ul>${r.riscos.map(rr => `<li>${rr}</li>`).join('')}</ul>
    <p><strong>Medidas de Controle:</strong> ${r.medidas || 'A definir'}</p>
    <hr>
  `).join('')}
  
  <h4>3. PLANO DE AÇÃO</h4>
  <p>Implementar medidas conforme hierarquia: Eliminação → Substituição → Controles de Engenharia → Administrativos → EPI. Revisão anual ou por alteração de processo.</p>
  
  <div class="assinaturas">
    <div class="linha-assinatura">
      ${empresaDados.responsavel || '_________________________'}<br>Responsável Legal
    </div>
    <div class="linha-assinatura">
      _________________________<br>Responsável Técnico
    </div>
  </div>
</div>`;
  
  const el = document.getElementById('visual-pgr');
  if (el) el.innerHTML = pgrHTML;
  alert('✅ PGR gerado! Use Imprimir → Salvar como PDF.');
}

// === GERAÇÃO DO PCMSO — NR-7 OFICIAL ===
function gerarPCMSO() {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  
  const riscosUnicos = [...new Set(listaRiscos.flatMap(r => r.riscos))];
  
  const pcmsoHTML = `
<style>
  .doc-pagina { font-family:Arial; font-size:12pt; line-height:1.6; }
  .doc-pagina h2 { text-align:center; font-size:16pt; margin-bottom:5px; }
  .doc-pagina h4 { font-size:13pt; margin-top:20px; border-bottom:1px solid #ccc; padding-bottom:5px; }
  .assinaturas { margin-top:50px; display:flex; justify-content:space-between; }
  .linha-assinatura { border-top:1px solid #000; width:45%; text-align:center; padding-top:10px; font-size:11pt; }
  ul { margin:5px 0; padding-left:20px; }
</style>
<div class="doc-pagina">
  <h2>PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL — PCMSO</h2>
  <p style="text-align:center; font-size:11pt; margin-bottom:20px;"><strong>NR-7 — Portaria MTP nº 426, de 07 de outubro de 2021</strong></p>
  <h3 style="text-align:center;">${empresaDados.razao || 'Nome da Empresa'}</h3>
  <p style="text-align:center;">CNPJ: ${empresaDados.cnpj || ''}</p>
  <p style="text-align:center; margin-bottom:20px;">Data de elaboração: ${dataHoje}</p>
  
  <h4>1. OBJETIVO</h4>
  <p>Promover e preservar a saúde dos trabalhadores, através de ações preventivas e de acompanhamento médico, vinculadas aos riscos ocupacionais identificados no PGR — Programa de Gerenciamento de Riscos, em conformidade com a NR-7.</p>
  
  <h4>2. ABRANGÊNCIA</h4>
  <p>Aplica-se a todos os trabalhadores, estagiários, aprendizes e prestadores de serviço que atuem nas dependências da empresa.</p>
  
  <h4>3. RISCOS DE REFERÊNCIA</h4>
  ${riscosUnicos.length === 0 ? '<p><em>Cadastre os riscos no PGR primeiro para um PCMSO completo.</em></p>' : ''}
  ${riscosUnicos.map(r => `<p>• ${r}</p>`).join('')}
  
  <h4>4. TIPOS DE EXAMES</h4>
  <ul>
    <li><strong>Admissional:</strong> Antes do início das atividades</li>
    <li><strong>Periódico:</strong> Anual ou conforme risco específico</li>
    <li><strong>Retorno ao Trabalho:</strong> 1º dia após afastamento &gt; 30 dias</li>
    <li><strong>Mudança de Função:</strong> Antes da transferência</li>
    <li><strong>Demissional:</strong> Até a data do desligamento</li>
  </ul>
  
  <h4>5. ACOMPANHAMENTO</h4>
  <p>Emissão de ASO em 2 vias, arquivamento por no mínimo 20 anos após desligamento, integração com o PGR e comunicação de alterações de saúde ao responsável técnico.</p>
  
  <div class="assinaturas">
    <div class="linha-assinatura">
      ${empresaDados.responsavel || '_________________________'}<br>Responsável Legal — Empresa
    </div>
    <div class="linha-assinatura">
      _________________________<br>Médico Coordenador — CRM: _________
    </div>
  </div>
</div>`;
  
  const el = document.getElementById('visual-pcmso');
  if (el) el.innerHTML = pcmsoHTML;
  alert('✅ PCMSO NR-7 gerado! Pronto para impressão.');
}

// === NR-09 — AVALIAÇÃO DE EXPOSIÇÕES ===
function adicionarAgenteNR09() {
  const lista = document.getElementById('nr09-agentes-lista');
  if (!lista) return;
  const html = `
    <div class="card" style="margin:10px 0; padding:15px; border:1px solid #ddd; border-radius:8px;">
      <h4 style="margin:0 0 10px 0; font-size:1rem;">Agente Avaliado</h4>
      <input type="text" class="ag-nome" placeholder="Nome do agente (ex: Ruído, Poeira, Solvente)" style="width:100%; margin-bottom:8px; padding:8px;">
      <input type="text" class="ag-tipo" placeholder="Tipo: Físico / Químico / Biológico" style="width:100%; margin-bottom:8px; padding:8px;">
      <input type="text" class="ag-valor" placeholder="Valor medido (ex: 85 dB(A))" style="width:100%; margin-bottom:8px; padding:8px;">
      <input type="text" class="ag-limite" placeholder="Limite de exposição (ex: 85 dB(A))" style="width:100%; margin-bottom:8px; padding:8px;">
      <input type="text" class="ag-situacao" placeholder="Situação: Dentro / Acima do limite" style="width:100%; margin-bottom:8px; padding:8px;">
      <button onclick="this.parentElement.remove()" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">Remover</button>
    </div>`;
  lista.insertAdjacentHTML('beforeend', html);
}

function adicionarAcaoNR09() {
  const lista = document.getElementById('nr09-acoes-lista');
  if (!lista) return;
  const html = `
    <div class="card" style="margin:10px 0; padding:15px; border:1px solid #ddd; border-radius:8px;">
      <h4 style="margin:0 0 10px 0; font-size:1rem;">Medida de Controle</h4>
      <input type="text" class="ac-prioridade" placeholder="Prioridade: Alta / Média / Baixa" style="width:100%; margin-bottom:8px; padding:8px;">
      <input type="text" class="ac-descricao" placeholder="Descrição da medida a implementar" style="width:100%; margin-bottom:8px; padding:8px;">
      <input type="text" class="ac-prazo" placeholder="Prazo (ex: 30 dias)" style="width:100%; margin-bottom:8px; padding:8px;">
      <input type="text" class="ac-responsavel" placeholder="Responsável" style="width:100%; margin-bottom:8px; padding:8px;">
      <button onclick="this.parentElement.remove()" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">Remover</button>
    </div>`;
  lista.insertAdjacentHTML('beforeend', html);
}

function gerarDocumentoNR09() {
  const dados = {
    razao: document.getElementById('nr09-razao')?.value || empresaDados.razao || '________________',
    fantasia: document.getElementById('nr09-fantasia')?.value || empresaDados.fantasia || '________________',
    cnpj: document.getElementById('nr09-cnpj')?.value || empresaDados.cnpj || '________________',
    endereco: document.getElementById('nr09-endereco')?.value || empresaDados.endereco || '________________',
    cidade: document.getElementById('nr09-cidade')?.value || '________________',
    respLegal: document.getElementById('nr09-resp-legal')?.value || empresaDados.responsavel || '________________',
    respTecnico: document.getElementById('nr09-resp-tecnico')?.value || '________________',
    dataElab: document.getElementById('nr09-data-elab')?.value || new Date().toLocaleDateString('pt-BR')
  };

  const agentes = document.querySelectorAll('#nr09-agentes-lista .card');
  let tabelaAgentes = '';
  agentes.forEach(ag => {
    const nome = ag.querySelector('.ag-nome')?.value || '';
    const tipo = ag.querySelector('.ag-tipo')?.value || '';
    const valor = ag.querySelector('.ag-valor')?.value || '';
    const limite = ag.querySelector('.ag-limite')?.value || '';
    const sit = ag.querySelector('.ag-situacao')?.value || '';
    if (nome) {
      tabelaAgentes += `<tr><td>${nome}</td><td>${tipo}</td><td>${valor}</td><td>${limite}</td><td>${sit}</td></tr>`;
    }
  });

  const acoes = document.querySelectorAll('#nr09-acoes-lista .card');
  let tabelaAcoes = '';
  acoes.forEach(ac => {
    const prio = ac.querySelector('.ac-prioridade')?.value || '';
    const desc = ac.querySelector('.ac-descricao')?.value || '';
    const prazo = ac.querySelector('.ac-prazo')?.value || '';
    const resp = ac.querySelector('.ac-responsavel')?.value || '';
    if (desc) {
      tabelaAcoes += `<tr><td>${prio}</td><td>${desc}</td><td>${prazo}</td><td>${resp}</td></tr>`;
    }
  });

  const docHTML = `
<style>
  .pagina-nr09 { font-family:Arial; font-size:12pt; line-height:1.6; color:#000; }
  .pagina-nr09 h1 { text-align:center; font-size:18pt; margin-bottom:5px; }
  .pagina-nr09 h2 { font-size:14pt; margin-top:25px; border-bottom:1px solid #ccc; padding-bottom:5px; }
  .pagina-nr09 table { width:100%; border-collapse:collapse; margin:12px 0; }
  .pagina-nr09 th, .pagina-nr09 td { border:1px solid #333; padding:8px; font-size:11pt; }
  .pagina-nr09 th { background:#eee; font-weight:bold; text-align:left; }
  .assinatura { margin-top:60px; display:flex; justify-content:space-between; }
  .assinatura div { border-top:1px solid #000; width:45%; text-align:center; padding-top:10px; }
</style>
<div class="pagina-nr09">
  <h1>NR-09 — AVALIAÇÃO E CONTROLE DAS EXPOSIÇÕES OCUPACIONAIS</h1>
  <p style="text-align:center; font-size:11pt; margin-bottom:30px;">Portaria MTP nº 426, de 07 de outubro de 2021</p>

  <h2>1. DADOS DA EMPRESA</h2>
  <table>
    <tr><th style="width:35%">Razão Social</th><td>${dados.razao}</td></tr>
    <tr><th>Nome Fantasia</th><td>${dados.fantasia}</td></tr>
    <tr><th>CNPJ</th><td>${dados.cnpj}</td></tr>
    <tr><th>Endereço</th><td>${dados.endereco}</td></tr>
    <tr><th>Cidade/UF</th><td>${dados.cidade}</td></tr>
    <tr><th>Responsável Legal</th><td>${dados.respLegal}</td></tr>
    <tr><th>Responsável Técnico</th><td>${dados.respTecnico}</td></tr>
    <tr><th>Data de Elaboração</th><td>${dados.dataElab}</td></tr>
  </table>

  <h2>2. OBJETIVO</h2>
  <p>Estabelecer procedimentos para avaliação, controle e monitoramento das exposições ocupacionais a agentes físicos, químicos e biológicos, em conformidade com a NR-09 — Portaria MTP nº 426/2021, visando à preservação da saúde e integridade dos trabalhadores.</p>

  <h2>3. AVALIAÇÃO DAS EXPOSIÇÕES</h2>
  <table>
    <tr><th>Agente</th><th>Tipo</th><th>Valor Medido</th><th>Limite de Exposição</th><th>Situação</th></tr>
    ${tabelaAgentes || '<tr><td colspan="5"><em>Sem dados — preencha os agentes acima</em></td></tr>'}
  </table>

  <h2>4. PLANO DE AÇÃO — MEDIDAS DE CONTROLE</h2>
  <p><strong>Hierarquia:</strong> Eliminação → Substituição → Controles de Engenharia → Administrativos → EPI</p>
  <table>
    <tr><th>Prioridade</th><th>Medida a Implementar</th><th>Prazo</th><th>Responsável</th></tr>
    ${tabelaAcoes || '<tr><td colspan="4"><em>Sem ações registradas</em></td></tr>'}
  </table>

  <h2>5. DISPOSIÇÕES FINAIS</h2>
  <p>Revisão anual ou sempre que houver alteração de processos, instalações ou legislação. Integração com o PGR e PCMSO.</p>

  <div class="assinatura">
    <div>
      ${dados.respLegal}<br>
      <strong>Responsável Legal</strong>
    </div>
    <div>
      ${dados.respTecnico}<br>
      <strong>Responsável Técnico</strong>
    </div>
  </div>
</div>`;

  const el = document.getElementById('nr09-documento-final');
  if (el) {
    el.innerHTML = docHTML;
    el.style.display = 'block';
  }
  alert('✅ NR-09 gerado! Use Imprimir → Salvar como PDF.');
}

function imprimirNR09() {
  const doc = document.getElementById('nr09-documento-final');
  if (!doc || doc.style.display === 'none') {
    alert('⚠️ Gere o documento primeiro!');
    return;
  }
  window.print();
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
  if (lista) {
    lista.innerHTML = listaExames.map(e => `
      <div class="item-lista">
        <div>
          <strong>${e.colaboradorNome}</strong> — ${e.tipo}<br>
          ${e.clinicaNome} | ${e.data} | <span style="color:${e.status==='Pendente'?'#d97706':'#059669'}">${e.status}</span>
        </div>
        <button class="btn-principal" style="padding:4px 8px; font-size:0.8rem;" onclick="concluirExame('${e.id}')">Concluir</button>
      </div>
    `).join('');
  }
  
  const qtdPend = document.getElementById('qtd-pendentes');
  if (qtdPend) qtdPend.textContent = listaExames.filter(e => e.status === 'Pendente').length;
}

async function concluirExame(id) {
  await db.collection('exames').doc(id).update({ status: 'Concluído' });
  carregarExames();
}

function atualizarSelects() {
  const selColab = document.getElementById('exame-colab');
  if (selColab) {
    selColab.innerHTML = '<option value="">Selecione...</option>' + 
      listaColaboradores.map(c => `<option value="${c.id}">${c.nome} — ${c.funcao}</option>`).join('');
  }
  
  const selClin = document.getElementById('exame-clinica');
  if (selClin) {
    selClin.innerHTML = '<option value="">Selecione...</option>' + 
      listaClinicas.map(c => `<option value="${c.id}">${c.razao}</option>`).join('');
  }
}

// === IMPRESSÃO GERAL ===
function imprimirDocumento(idSecao) {
  const secao = document.getElementById(idSecao);
  if (!secao || !secao.innerHTML.trim()) {
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
