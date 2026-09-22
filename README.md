# Sistema SST Gestão

Sistema web de gestão de Segurança e Saúde no Trabalho: PGR (NR-1/NR-9), PCMSO (NR-7), ASO, clínicas, colaboradores e inventário de riscos. Responsivo (celular e computador), 100% em um único arquivo HTML.

## Como usar

Basta abrir o arquivo `index.html` em qualquer navegador — não precisa de servidor nem de instalação. Ao ser publicado em um site (GitHub Pages, Cloudflare Pages etc.), os dados ficam salvos no navegador de cada pessoa que acessa (armazenamento local), então não sincronizam automaticamente entre diferentes usuários. Use **Configurações → Exportar backup** para salvar os dados e **Restaurar backup** para carregá-los em outro navegador.

## Publicar no Cloudflare Pages

1. Crie a conta e faça login em https://dash.cloudflare.com
2. Vá em **Workers e Pages → Criar → Pages → Conectar ao Git**
3. Selecione este repositório no GitHub
4. Em "Build settings": deixe o comando de build **vazio** e o diretório de saída como `/` (raiz)
5. Clique em **Salvar e implantar**

O site fica no ar em poucos segundos, em um endereço como `https://sst-gestao.pages.dev`.
