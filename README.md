# IFAL-Espacos

## Guia de instalação e execução

### 1. Instalar Node.js

Se ainda não tiver o Node.js instalado, baixe e instale a versão mais recente em:

- https://nodejs.org/

Após a instalação, feche e reabra o terminal para garantir que `node` e `npm` estejam disponíveis.

### 2. Abrir o projeto

Abra o terminal na pasta do projeto:

```bash
cd c:\Users\marce\IFAL-Espacos
```

### 3. Instalar dependências

Execute:

```bash
npm install
```

Isso irá baixar todas as dependências necessárias para o projeto.

### 4. Criar o arquivo `.env`

Na raiz do projeto, crie ou atualize o arquivo `.env` com o conteúdo abaixo:

```env
VITE_BASE44_APP_ID=6a314a669e89ca5fe5dbf631
VITE_BASE44_APP_BASE_URL=https://ifallocal.ifalsi.app
VITE_BASE44_FUNCTIONS_VERSION=prod
```

### 5. Rodar o projeto

Execute:

```bash
npm run dev
```

### 6. Acessar no navegador

Abra o endereço:

- http://localhost:5173

### Observações

- Se `npm install` falhar, verifique se o Node.js foi instalado corretamente e se o terminal está usando a versão correta.
- Caso tenha problemas de permissão no Windows, abra o terminal como administrador ou use o PowerShell.
