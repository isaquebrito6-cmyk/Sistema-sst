# Sistema SST Gestão

Sistema web de gestão de Segurança e Saúde no Trabalho: PGR (NR-1/NR-9), PCMSO (NR-7), ASO, clínicas, colaboradores e inventário de riscos. Responsivo (celular e computador), em um único arquivo `index.html`.

## Como funciona

- **Login** por e-mail e senha (Firebase Authentication). Perfis: administrador, empresa, clínica e colaborador.
- **Dados** no Firestore. Cada perfil só consulta o que pode ver, e o servidor garante isso pelas regras de `firestore.rules`.
- Sem conexão com o Firebase (por exemplo, abrindo o arquivo direto no computador), o sistema funciona em **modo local**: os dados ficam só naquele navegador. Use **Configurações → Exportar backup** para guardá-los.

## Publicar no Cloudflare Pages

1. Em https://dash.cloudflare.com vá em **Workers e Pages → Criar → Pages → Conectar ao Git**.
2. Selecione este repositório. Comando de build **vazio** e diretório de saída `/`.
3. Em **Firebase → Authentication → Settings → Authorized domains**, adicione o endereço `*.pages.dev` do site.

## Regras de segurança do Firestore (obrigatório)

O arquivo `firestore.rules` define quem pode ler e gravar cada coleção. Ele **não é publicado automaticamente** com o site. Para ativar:

1. Faça o deploy desta versão do site (o código novo já consulta só o que cada perfil pode ver).
2. Entre como administrador e abra **Configurações → Perfis de acesso → Atualizar permissões de acesso** (uma vez; é seguro repetir). Isso libera para cada clínica os dados das solicitações que já existem, identifica de quem é cada arquivo de ASO já enviado e **move as respostas do checklist psicossocial** para uma área que a empresa não lê.
3. No Firebase Console, abra **Firestore Database → Regras**, cole o conteúdo de `firestore.rules` e clique em **Publicar**.
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

## Observações

- **Checklist psicossocial:** as respostas individuais ficam na coleção `psico` (uma por solicitação) e só o colaborador, a clínica e o administrador as leem. A empresa vê apenas a data em que foi respondido. Se uma solicitação antiga ainda aparecer com as respostas para a empresa, falta rodar "Atualizar permissões de acesso".
- A clínica passa a enxergar o colaborador, a empresa e os riscos quando uma solicitação é criada para ela (campo `clinicaIds`). Quando a solicitação é excluída, ou trocada para outra clínica, a clínica deixa de ver o colaborador, a empresa e os riscos, a menos que ainda exista outra solicitação dela que justifique o acesso.
- Arquivos de ASO continuam guardados no Firestore (limite de 3 MB), para manter o sistema no plano gratuito. Fotos grandes são reduzidas automaticamente antes do envio; PDFs acima de 3 MB precisam ser reduzidos por quem envia. O Firebase Storage exigiria o plano pago Blaze.
- Senhas criadas ou trocadas pelo sistema precisam ter 10 caracteres ou mais, com letras e números. A redefinição por e-mail ("Esqueci minha senha") usa a página do próprio Firebase e aceita o mínimo dele (6 caracteres).
- A verificação em duas etapas do Firebase exige o plano pago (Identity Platform); por isso não está ativada.
- Dados de saúde são sensíveis pela LGPD: crie acessos só para quem precisa.
