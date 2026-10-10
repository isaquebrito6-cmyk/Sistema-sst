# Sistema SST Gestão

Sistema web de gestão de Segurança e Saúde no Trabalho: PGR (NR-1/NR-9), PCMSO (NR-7), LTCAT, PPP, ASO, clínicas, colaboradores e inventário de riscos. Responsivo (celular e computador), em um único arquivo `index.html`.

## LTCAT e PPP

- Em cada risco do inventário (Inventário de riscos → Editar), além da insalubridade (NR-15), agora dá para registrar a **periculosidade (NR-16)** — campo "Atividade ou operação perigosa", com o anexo correspondente. Os dois campos não se acumulam (o trabalhador tem direito ao mais vantajoso).
- **LTCAT** (Laudo Técnico das Condições Ambientais do Trabalho): nova minuta em "PGR, PCMSO e modelos", ao lado do PGR e do PCMSO, com o mesmo fluxo de revisões. Reaproveita o inventário de riscos e os campos de insalubridade/periculosidade para listar os agentes físicos, químicos e biológicos e o enquadramento para fins de aposentadoria especial.
- **PPP** (Perfil Profissiográfico Previdenciário): botão "Emitir PPP" na ficha de cada colaborador. Reúne os dados cadastrais, o período do vínculo (admissão/desligamento), os fatores de risco ligados à função/setor do colaborador e a caracterização de atividade especial, com os responsáveis técnicos já cadastrados no PGR/PCMSO.
- Como os dois dependem de avaliação técnica (muitas vezes com medição em campo) e de confirmação de um profissional habilitado — engenheiro de segurança do trabalho ou médico do trabalho —, ambos saem como **minuta**, com o mesmo aviso dos demais documentos do sistema, e não substituem o laudo técnico assinado nem o envio oficial pelo eSocial (evento S-2240, no caso do PPP).

## CAT e EPI

- **Acidentes (CAT)**: cadastro de acidentes e doenças ocupacionais por colaborador (data, tipo, lesão, afastamento e situação da CAT). Não emite nem transmite a CAT ao eSocial/INSS — isso continua feito à parte, com atalhos para o serviço oficial "Registrar Comunicação de Acidente de Trabalho" em gov.br ou o eSocial (evento S-2210) —, mas mantém o histórico e alimenta sozinho o número de CATs do período no relatório analítico do PCMSO.
- **EPI**: ficha de entrega e troca de Equipamento de Proteção Individual por colaborador (data, itens marcados numa lista de EPIs comuns — ou digitados em "Outros EPIs" quando não estiverem na lista —, CA, validade e se o recibo foi assinado), para ter o histórico à mão numa fiscalização.
- **Permissão de Trabalho (PT)**: registro de autorização para atividades críticas (espaço confinado NR-33, trabalho em altura NR-35, eletricidade NR-10 e outras), com responsável, medidas de controle verificadas, responsável técnico e situação (emitida/encerrada/cancelada).
- Os três aparecem no menu (para administrador e empresa) e também na ficha do colaborador, junto com os exames.
- **Aptidão para atividade crítica no ASO**: ao solicitar um exame (Exames e ASO → Nova solicitação), dá para marcar que a função exige avaliação de aptidão para trabalho em altura (NR-35), espaço confinado (NR-33) e/ou operação de máquinas e equipamentos. O pedido aparece na guia de encaminhamento enviada à clínica e já vem destacado no formulário/documento do ASO, para o médico registrar Apto/Inapto item a item — tanto no ASO preenchido quanto no modelo em branco para impressão.

## Cores (NR-26)

As cores de risco e alerta do sistema seguem a lógica de cores de segurança da NR-26: **verde** = segurança/risco baixo, **amarelo** = atenção/risco médio, **laranja** = perigo/risco alto, **vermelho** = perigo grave/risco crítico. Essa mesma paleta é usada em todo o sistema (chips de risco no inventário, distribuição de riscos, faixa de pagamento suspenso, erros e botões de exclusão), para que cada cor signifique sempre a mesma coisa, inclusive nos documentos impressos (PGR/matriz de risco).

## Como funciona

- **Login** por e-mail e senha (Firebase Authentication). Perfis: administrador (da plataforma ou de uma consultoria), empresa, clínica e colaborador.
- **Dados** no Firestore. Cada perfil só consulta o que pode ver, e o servidor garante isso pelas regras de `firestore.rules`.
- Sem conexão com o Firebase (por exemplo, abrindo o arquivo direto no computador), o sistema funciona em **modo local**: os dados ficam só naquele navegador. Use **Configurações → Exportar backup** para guardá-los.

## Publicar no Cloudflare Pages

1. Em https://dash.cloudflare.com vá em **Workers e Pages → Criar → Pages → Conectar ao Git**.
2. Selecione este repositório. Comando de build **vazio** e diretório de saída `/`.
3. Em **Firebase → Authentication → Settings → Authorized domains**, adicione o endereço `*.pages.dev` do site.

## Regras de segurança do Firestore (obrigatório)

O arquivo `firestore.rules` define quem pode ler e gravar cada coleção. Ele **não é publicado automaticamente** com o site. Para ativar:

1. Faça o deploy desta versão do site (o código novo já consulta só o que cada perfil pode ver).
2. No Firebase Console, abra **Firestore Database → Regras**, cole o conteúdo de `firestore.rules` e clique em **Publicar**.
3. Entre como administrador: no primeiro acesso depois da publicação, o sistema já libera sozinho para cada clínica os dados das solicitações existentes, identifica de quem é cada arquivo de ASO já enviado e **move as respostas do checklist psicossocial** para uma área que a empresa não lê — sem precisar clicar em nada. O botão **Configurações → Perfis de acesso → Atualizar permissões de acesso** continua disponível e é seguro repetir, caso algum dado novo precise do mesmo tratamento.
4. Teste com uma conta de cada perfil (veja abaixo).

### Roteiro de teste depois de publicar

| Entrar como | Deve conseguir | Não deve conseguir |
|---|---|---|
| Administrador | tudo | — |
| Empresa | ver seus colaboradores, riscos, ações, solicitações e documentos; criar solicitações e colaboradores; baixar ASO das suas solicitações; ver **se** o checklist psicossocial foi respondido | ver dados de outra empresa; editar riscos ou documentos; **ver as respostas do checklist psicossocial** |
| Clínica | ver as solicitações dela, os colaboradores e riscos ligados a elas; registrar o ASO e anexar o arquivo; ler e preencher o checklist psicossocial das solicitações dela | ver outras clínicas, empresas sem solicitação para ela, ações ou documentos |
| Colaborador | ver os próprios dados e exames; responder o checklist psicossocial | ver outros colaboradores ou editar outros campos |

Se algum perfil mostrar a faixa vermelha "Não foi possível carregar…", a regra daquela coleção está recusando a consulta. Anote a coleção citada na faixa.

## Auditoria (LGPD)

O menu **Auditoria** (só administrador) lista quem criou, alterou, excluiu, baixou, viu ou imprimiu dados sensíveis (colaboradores, solicitações e ASO, checklist psicossocial, documentos, empresas, clínicas e usuários) e quando cada pessoa entrou no sistema. Detalhes:

- A data, o usuário e o e-mail de cada linha vêm do servidor; as regras impedem que alguém grave em nome de outra pessoa ou edite e apague linhas pelo sistema.
- O registro guarda só quem, o quê e quando, sem copiar nomes, CPFs nem respostas do checklist.
- Operações em massa (restaurar backup, apagar tudo, carregar exemplo, atualizar permissões) geram uma única linha.
- A tela mostra as 300 linhas mais recentes; as anteriores continuam no banco. Cada ação auditada usa 1 gravação extra, o que cabe com folga na cota gratuita do Firebase.
- Para testar: entre como empresa, abra um colaborador e volte como administrador; a ação deve aparecer em **Auditoria**. Uma conta que não seja administrador não consegue ler a coleção `auditoria`.

## Multi-tenant (várias consultorias)

O sistema suporta várias consultorias de SST usando o mesmo site, com os dados totalmente isolados entre elas:

- O **e-mail fixo do super admin** (hoje `isaquebrito6@gmail.com`) sempre vê e administra todas as consultorias, e é também, por padrão, o administrador da consultoria "main" — a sua própria, que já existia antes desta funcionalidade e não precisa de nenhuma migração manual.
- No primeiro login do super admin depois de publicar esta versão, o sistema carimba automaticamente os dados já existentes com `consultoriaId: "main"` e cria o documento `consultorias/main`. Isso acontece sozinho; não é preciso clicar em nada.
- Menu **Consultorias** (só aparece para o super admin): cria uma nova consultoria com seu primeiro administrador (e-mail + senha provisória), lista as existentes e permite "Entrar" em uma delas para ver/configurar os dados daquela consultoria especificamente, ou "Ver todas" para uma visão de suporte sem filtro.
- O administrador de **uma** consultoria (perfil `admin` com `consultoriaId` preenchido) só vê e só cria usuários (empresa/clínica/colaborador) dentro da própria consultoria — isso é garantido tanto pelo código quanto pelas regras do Firestore (`firestore.rules`), então mesmo alguém adulterando o navegador não consegue ler dados de outra consultoria.
- Cada consultoria tem seus próprios dados da consultoria (nome, logotipo, responsável técnico) em **Configurações**.
- Plano e cobrança: `consultorias/{id}` tem `plano`, `statusPagamento` (`ok`/`pendente`/`suspenso`), `vencimento` e `limiteEmpresas`. O super admin edita isso em **Consultorias → Editar** e registra pagamentos manuais (Pix, boleto etc.) em **Registrar pagamento**. Uma consultoria `suspenso` não consegue cadastrar novas empresas (barrado também pelo `firestore.rules`); o limite de empresas só é avisado na tela, sem bloqueio no servidor.

## Página comercial

`comercial.html` é uma landing page para atrair novas consultorias (problema → o que o sistema cobre por NR → isolamento entre consultorias → segurança → planos → pedir demonstração). Fica separada do `index.html` (o sistema em si) de propósito: ninguém que já usa o sistema é afetado, e o link "Pedir demonstração" aponta para um `mailto:` — troque `[e-mail de contato]` pelo seu e-mail antes de divulgar. Para divulgar como página inicial do site, basta linkar `comercial.html` de onde for anunciar (ex.: redes sociais, Google); o `index.html` continua sendo a porta de entrada do sistema para quem já é cliente.

## Operação (monitoramento, backup, suporte, limites)

Como o sistema não tem servidor próprio (só o site estático + Firebase), algumas rotinas que normalmente ficariam num backend acontecem assim:

- **Erros:** se uma gravação ou leitura falhar, além do aviso vermelho na tela, fica uma linha em **Auditoria** (ação "Falha no sistema"). Não existe aviso por e-mail/push automático — vale dar uma olhada na Auditoria de vez em quando, principalmente se um cliente relatar algo estranho.
- **Backup:** em **Configurações**, se fizer mais de 30 dias desde o último "Exportar backup" feito *naquele aparelho* (ou se nunca foi feito), aparece um lembrete. É um empurrão local, guardado só no navegador — não é um backup automático agendado no servidor (o plano gratuito do Firebase não tem como agendar isso sozinho).
- **Suporte:** quem administra uma consultoria tem, em Configurações, um botão para falar com quem administra a plataforma (super admin). Quem usa uma consultoria (empresa, clínica, colaborador) vê, no menu lateral, um link para falar com a própria consultoria — usa o e-mail cadastrado em Configurações → Editar dados; se não tiver e-mail cadastrado, o link não aparece.
- **Limite do plano:** quem administra uma consultoria vê, em Configurações, quantas empresas já cadastrou em relação ao limite do plano (o super admin já via isso em **Consultorias**, para todas de uma vez). Como já registrado acima, esse limite só é avisado na tela — o bloqueio real de novas empresas quando suspenso está nas regras do Firestore, mas contar quantas empresas existem não é algo que o Firestore consiga garantir sozinho.

## Documentos legais

`termos-de-uso.html`, `politica-de-privacidade.html` e `acordo-tratamento-dados.html` são páginas estáticas (mesmo padrão visual do sistema) linkadas no rodapé do login e em Configurações → Documentos legais. São **modelos de partida**: têm campos entre `[colchetes]` para preencher com os dados reais de quem presta o serviço, e precisam de revisão por um advogado antes de valer para clientes pagantes — principalmente por tratarem dados de saúde (dado sensível pela LGPD).

## Observações

- **Checklist psicossocial:** as respostas individuais ficam na coleção `psico` (uma por solicitação) e só o colaborador, a clínica e o administrador as leem. A empresa vê apenas a data em que foi respondido. Se uma solicitação antiga ainda aparecer com as respostas para a empresa, falta rodar "Atualizar permissões de acesso".
- A clínica passa a enxergar o colaborador, a empresa e os riscos quando uma solicitação é criada para ela (campo `clinicaIds`). Quando a solicitação é excluída, ou trocada para outra clínica, a clínica deixa de ver o colaborador, a empresa e os riscos, a menos que ainda exista outra solicitação dela que justifique o acesso.
- Arquivos de ASO continuam guardados no Firestore (limite de 3 MB), para manter o sistema no plano gratuito. Fotos grandes são reduzidas automaticamente antes do envio; PDFs acima de 3 MB precisam ser reduzidos por quem envia. O Firebase Storage exigiria o plano pago Blaze.
- Senhas criadas ou trocadas pelo sistema precisam ter 10 caracteres ou mais, com letras e números. A redefinição por e-mail ("Esqueci minha senha") usa a página do próprio Firebase e aceita o mínimo dele (6 caracteres).
- A verificação em duas etapas do Firebase exige o plano pago (Identity Platform); por isso não está ativada.
- Dados de saúde são sensíveis pela LGPD: crie acessos só para quem precisa.
