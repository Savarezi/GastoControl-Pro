# 💰 GastoControl-Pro

O **GastoControl-Pro** é uma aplicação moderna de gestão financeira pessoal, desenvolvida para ajudar você a assumir o controle total das suas finanças, organizar gastos fixos e planejar seus sonhos através de metas claras.

---

## 🚀 Funcionalidades

- **Dashboard Inteligente**  
  Visualização em tempo real do saldo livre com alertas visuais baseados na sua saúde financeira.

- **Gestão de Gastos**  
  Registro e histórico detalhado de despesas variáveis e contas fixas mensais.

- **Controle de Metas**  
  Criação de metas com barra de progresso para acompanhar a realização dos seus objetivos.

- **Autenticação Segura**  
  Login rápido e seguro utilizando a conta do Google via Supabase.

- **Design Moderno**  
  Interface responsiva e otimizada com Tailwind CSS v4.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/) com [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Autenticação**: [Supabase](https://supabase.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: [Motion](https://motion.dev/)
- **Deploy**: [Vercel](https://vercel.com/)

---

## ⚙️ Configuração e Deploy

### 1️⃣ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```
###
2️⃣ Ajustes de Autenticação (CRUCIAL para Deploy)

Para que o login do Google funcione corretamente na Vercel:

Acesse Authentication > URL Configuration no painel do Supabase.

No campo Site URL, coloque o link gerado pela Vercel.

Adicione o link da Vercel em Redirect URLs.

Sem isso o OAuth quebra. E não é bug — é configuração mesmo 😅
###


## 📂 Estrutura do Projeto

### 🧠 Camada de Aplicação (Core)

| Caminho | Responsabilidade |
|---------|------------------|
| 📁 [src](./src) | Diretório principal do código-fonte |
| 📄 [src/App.tsx](./src/App.tsx) | Componente raiz e orquestração da aplicação |

---

### 🔐 Camada de Serviços e Integrações

| Caminho | Responsabilidade |
|---------|------------------|
| 📄 [src/lib/supabase.ts](./src/lib/supabase.ts) | Configuração e conexão com Supabase (Auth + Database) |

---

### 🎨 Camada de Interface e Estilização

| Caminho | Responsabilidade |
|---------|------------------|
| 📄 [index.css](./index.css) | Estilos globais e configuração do Tailwind CSS v4 |
| 📄 [index.html](./index.html) | Estrutura HTML base da aplicação |

---

### ⚙️ Camada de Configuração e Build

| Caminho | Responsabilidade |
|---------|------------------|
| 📄 [package.json](./package.json) | Dependências, scripts e metadados do projeto |
| 📄 [tailwind.config.js](./tailwind.config.js) | Configuração do Tailwind |
| 📄 [postcss.config.js](./postcss.config.js) | Configuração do PostCSS |
| 📄 [vite.config.ts](./vite.config.ts) | Configuração do Vite (build e dev server) |
| 📄 [tsconfig.json](./tsconfig.json) | Configuração do TypeScript |

---

### 📦 Outros Arquivos

| Caminho | Responsabilidade |
|---------|------------------|
| 📄 [.gitignore](./.gitignore) | Arquivos e pastas ignorados pelo Git |
| 📄 [LICENSE](./LICENSE) | Licença do projeto |
| 📄 [metadata.json](./metadata.json) | Metadados da aplicação |


####


---

## 🏗️ Arquitetura Técnica

O **GastoControl-Pro** segue uma arquitetura baseada em separação de responsabilidades:

- **UI (Interface)** → Componentes React responsáveis pela renderização e interação.
- **Camada de Serviço** → Integração com Supabase (autenticação e banco de dados).
- **Persistência** → Dados armazenados e gerenciados via Supabase.
- **Build & Deploy** → Vite para build otimizada e Vercel para deploy contínuo.

Fluxo simplificado:

Usuário → Interface React → Serviços (Supabase) → Banco de Dados → Atualização em tempo real na UI

---

## 🌐 Deploy

A aplicação pode ser publicada facilmente na Vercel.

```bash
npm install
npm run build
