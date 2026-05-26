# 🐾 AgendaPets

O **AgendaPets** é um sistema de gerenciamento de consultas veterinárias projetado para facilitar a comunicação entre tutores e veterinários. O sistema permite o cadastro de pets, agendamento de consultas e notificações automáticas via WhatsApp.

## 🚀 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 e JavaScript (Vanilla).
- **Backend:** Node.js com Express.
- **Banco de Dados & Autenticação:** Firebase (Firestore e Firebase Auth).
- **Notificações:** Twilio API para envio de mensagens via WhatsApp.
- **Segurança:** Autenticação via JWT (Firebase ID Tokens) e Middleware de Controle de Acesso Baseado em Funções (RBAC).

## 📋 Funcionalidades

### Para Tutores:
- Cadastro de conta e login.
- Cadastro de seus próprios Pets.
- Visualização de agendamentos realizados.
- Confirmação ou cancelamento de consultas pendentes.

### Para Veterinários:
- Cadastro de conta e login.
- Listagem de tutores e seus respectivos pets.
- Agendamento de novas consultas.
- Recebimento de status de entrega das notificações de WhatsApp.

## ⚙️ Configuração do Ambiente

### 1. Pré-requisitos
- Node.js instalado.
- Uma conta no [Firebase](https://firebase.google.com/).
- Uma conta no [Twilio](https://www.twilio.com/) (opcional para envio de mensagens).

### 2. Instalação
Clone o repositório e instale as dependências:
```bash
npm install
```

### 3. Configuração do Firebase
1. No Console do Firebase, gere uma nova chave privada em **Configurações do Projeto > Contas de Serviço**.
2. Salve o arquivo JSON na raiz do projeto.
3. No arquivo `server.js`, certifique-se de que o caminho no `require()` aponta para o seu arquivo JSON.

### 4. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
```env
PORT=3000
FIREBASE_WEB_API_KEY=Sua_Firebase_Web_API_Key

# Configurações Twilio (Opcional - Modo Simulado se vazio)
TWILIO_ACCOUNT_SID=seu_sid_da_conta
TWILIO_AUTH_TOKEN=seu_token_de_autenticacao
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 📂 Estrutura do Projeto

```text
AgendaPets/
├── middleware/
│   └── auth.js             # Validação de token e papéis (roles)
├── routes/
│   ├── agendamentos.js     # Regras de negócio de agendamento
│   ├── auth.js             # Login e registro
│   ├── pets.js             # Gestão de animais
│   ├── tutores.js          # Gestão de perfis de tutores
│   └── veterinarios.js     # Gestão de perfis de veterinários
├── services/
│   └── whatsapp.js         # Integração com a API do Twilio
├── index.html              # Interface do usuário (Single Page Application)
├── server.js               # Ponto de entrada da aplicação Express
├── style.css               # Estilização da interface
└── .env                    # Variáveis sensíveis (não commitado)
```

## 🛠️ Como Executar

Para iniciar o servidor:
```bash
npm start
```
Acesse a aplicação em: `http://localhost:3000`

## 🛡️ Segurança
A aplicação utiliza um middleware de autenticação que verifica o `idToken` do Firebase em cada requisição protegida. Além disso, as rotas são protegidas por permissões:
- Apenas **Veterinários** podem criar agendamentos e listar todos os tutores.
- **Tutores** só podem visualizar e gerenciar seus próprios pets e agendamentos.

---
Desenvolvido para facilitar o cuidado com quem você ama. 🐶🐱