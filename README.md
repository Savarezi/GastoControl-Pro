# 💰 GastoControl-Pro

O **GastoControl-Pro** é uma aplicação moderna de gestão financeira pessoal, desenvolvida para ajudar você a assumir o controle total das suas finanças, organizar gastos fixos e planejar seus sonhos através de metas claras.

---

<img width="915" height="440" alt="image" src="https://github.com/user-attachments/assets/408cd91d-c1ec-4e03-8708-66a1caff2848" />


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
# 🏦 GastoControl - Arquitetura de Dados

Este repositório contém a lógica e a estrutura de banco de dados do **GastoControl**, um sistema inteligente de gestão financeira pessoal.

---

## 🏗️ Modelagem de Dados (DER)

O diagrama abaixo representa a estrutura de Entidade-Relacionamento do sistema. Ele foi desenhado seguindo uma estética moderna para facilitar a visualização das conexões entre as tabelas.

## 🎨 Padrão Visual do Diagrama

Para manter a clareza técnica, utilizamos a seguinte convenção visual no **draw.io**:

* **PK (Primary Key):** Destacadas em **Amarelo**, representam a identidade única de cada registro.
* **FK (Foreign Key):** Destacadas em **Azul**, representam os pontos de união (relacionamentos) entre as tabelas.
* **Relacionamento 1:N:** As linhas neon indicam que **um** usuário pode possuir **múltiplos** registros em todas as outras tabelas.
* **Tema Dark:** Fundo escuro com alto contraste para facilitar a leitura de desenvolvedores.


<img src="https://github.com/user-attachments/assets/24755bd9-5045-4628-b63c-4033e2a8cc60" width="450" align="center" style="display: block; margin: 0 auto;">

### 📑 Glossário das Tabelas

#### 1. `auth.users` (Entidade Principal)
É a tabela nativa de autenticação do Supabase. Todos os dados do sistema orbitam ao redor do usuário autenticado.
* **PK `id` (Amarelo):** Identificador único universal (UUID) do usuário.
* **email:** Endereço de e-mail utilizado para o login.

#### 2. `expenses` (Gastos Variáveis)
Tabela destinada aos registros de consumo diário.
* **PK `id`:** Identificador único do lançamento.
* **FK `user_id` (Azul):** Chave estrangeira que vincula o gasto ao usuário.
* **description:** Nome ou descrição da despesa.
* **amount:** Valor monetário do registro.
* **date:** Data em que o gasto foi realizado.

#### 3. `fixed_expenses` (Contas Fixas)
Gerencia os custos recorrentes que não variam mês a mês.
* **description:** Nome do compromisso financeiro (ex: Aluguel).
* **amount:** Valor fixo mensal.
* **category:** Classificação para organização de balanços.

#### 4. `monthly_salaries` (Planejamento de Renda)
Permite que o sistema calcule o "Saldo Livre" baseado no aporte financeiro de cada mês específico.
* **month:** Referência temporal (ex: "2026-03").
* **amount:** Total de proventos recebidos no mês.

#### 5. `goals` (Gestão de Metas e Sonhos)
Tabela focada em objetivos de médio e longo prazo.
* **title:** Nome do objetivo (ex: Reserva de Emergência).
* **target_amount:** Valor alvo para conclusão da meta.
* **deadline:** Data prevista para a realização do sonho.
* **status:** Estado atual (Não iniciada, Em andamento ou Concluída).

---

## 🌐 Para rodar install npm 
```bash
npm install
npm run dev
