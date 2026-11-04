# LicitaTrack

Sistema web de gerenciamento de processos licitatórios, desenvolvido como projeto acadêmico de **Análise e Desenvolvimento de Sistemas**. A proposta é centralizar o cadastro, a consulta e o acompanhamento de processos de compras públicas de uma prefeitura.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Frontend | Angular e TypeScript |
| Backend | ASP.NET Core 10 (C#) |
| Banco de dados | MySQL 8.4 |
| Acesso aos dados | MySqlConnector e SQL parametrizado |
| Versionamento | Git e GitHub |

O frontend consome a API por HTTP. No backend, a organização é **Controller → Service → Repository → MySQL**, com **Models** e **DTOs**.

## Estrutura do projeto

A estrutura abaixo combina os diretórios já utilizados no backend com a **organização planejada para o Angular**, seguindo a separação por componentes e funcionalidades utilizada no projeto Gecoi. Diretórios do frontend são uma referência de organização e podem ser ajustados durante a implementação.

```text
licitatrack/
├── backend/
│   └── Licitatrack.Api/
│       ├── Controllers/
│       ├── DTOs/
│       ├── Models/
│       ├── Repositories/
│       ├── Services/
│       ├── Program.cs
│       ├── appsettings.json
│       └── Licitatrack.Api.csproj
├── frontend/                     # Estrutura planejada
│   └── src/
│       └── app/
│           ├── components/
│           │   ├── dashboard/
│           │   ├── processos/
│           │   ├── cadastro-processo/
│           │   ├── detalhes-processo/
│           │   └── historico-processo/
│           ├── services/
│           ├── models/
│           └── shared/
│               └── components/
│                   └── layout/
├── database/                     # Scripts SQL a versionar
├── .gitignore
└── README.md
```
## Funcionalidades

O sistema executa o gerenciamento de processos licitatórios, com cadastro, listagem, consulta de detalhes, edição, acompanhamento de situação, histórico e visão geral dos processos.
### API de processos

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/api/processos` | Retornar os processos cadastrados |
| `POST` | `/api/processos` | Cadastrar um processo licitatório |

O cadastro utiliza os campos **número, objeto, modalidade, secretaria, data de abertura e situação**. A API valida os dados e impede números de processo duplicados.

## Pré-requisitos

Para executar o **sistema completo** em Linux ou Windows, é necessário:

- **Node.js com npm** (o npm acompanha a instalação do Node.js).
- **Angular CLI**, se for utilizar diretamente o comando `ng`.
- **.NET SDK 10**
- **Acesso a um servidor MySQL 8.4** com o banco e as tabelas configurados. Pode ser local ou remoto.

**Não é necessário instalar manualmente as bibliotecas do projeto**: `npm install` e `dotnet restore` instalam as dependências declaradas nos respectivos projetos. Também não é necessário instalar MySQL no computador que executa a aplicação se já houver acesso a uma instância MySQL configurada.

Downloads oficiais: [Node.js](https://nodejs.org/), [Angular CLI](https://angular.dev/tools/cli), [.NET SDK](https://dotnet.microsoft.com/download/dotnet/10.0) e [MySQL](https://dev.mysql.com/downloads/mysql/).

## Executando o projeto

### 1. Clonar o repositório

**Linux (terminal) ou Windows (PowerShell):**

```bash
git clone https://github.com/kernel71/Licitatrack-.git
cd Licitatrack-
```

### 2. Configurar a conexão com o MySQL

A API lê a conexão pela chave `ConnectionStrings:Default`. Para desenvolvimento local, recomenda-se **.NET User Secrets**, sem salvar senhas no Git.

No terminal, entre no projeto backend:

```bash
cd backend/Licitatrack.Api
```

Configure a string de conexão (substitua os valores de exemplo pelos dados da sua instância MySQL):

```bash
dotnet user-secrets set "ConnectionStrings:Default" "Server=127.0.0.1;Port=3306;Database=licitatrack_db;User ID=SEU_USUARIO;Password=SUA_SENHA"
```

> Para um MySQL remoto, substitua `127.0.0.1` pelo endereço do servidor. 

O banco `licitatrack_db` precisa existir e conter as tabelas `processos_licitatorios` e `historico_processos`. O script SQL de preparação deve ser mantido no diretório `database/`

### 3. Iniciar o backend

**Linux ou Windows:**

```bash
# Dentro de backend/Licitatrack.Api
dotnet restore
dotnet run
```

Na configuração local usada durante o desenvolvimento, a API responde em:

```text
http://localhost:5299
```

Se a porta for diferente, use o endereço exibido pelo `dotnet run`. Para verificar a API, acesse `http://localhost:5299/api/processos` (com a porta correspondente).

### 4. Iniciar o frontend Angular

Abra outro terminal na pasta raiz do repositório:

```bash
cd frontend
npm install
npm start
```

O script `npm start`, quando configurado com o Angular CLI, inicia o servidor de desenvolvimento. Se necessário, instale a CLI globalmente:

```bash
npm install -g @angular/cli
```

O endereço padrão do servidor de desenvolvimento Angular costuma ser `http://localhost:4200`, mas confirme a URL exibida no terminal.

O frontend deve apontar para a URL da API usada no ambiente local. Caso as aplicações sejam executadas em origens diferentes, o backend precisa permitir a origem do Angular via CORS.

## Comandos úteis

| Objetivo | Comando |
| --- | --- |
| Verificar versão do .NET | `dotnet --version` |
| Compilar a API | `dotnet build` (na pasta do backend) |
| Executar a API | `dotnet run` (na pasta do backend) |
| Verificar Node.js | `node -v` |
| Verificar npm | `npm -v` |
| Verificar Angular CLI | `ng version` |
| Instalar dependências do frontend | `npm install` (na pasta do frontend) |

## Observações

- O projeto não contém credenciais de banco no código-fonte; a conexão é configurada por ambiente.
- Para reproduzir a aplicação completa, o banco de dados e o frontend precisam estar configurados.
- A documentação será atualizada para refletir os caminhos e comandos definitivos à medida que os componentes forem implementados.
