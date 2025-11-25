# Sistema Embarcado + Backend Node + App Mobile

Projeto da disciplina que integra **sistema embarcado (ESP32)**, **backend em Node.js (microserviços + API Gateway)** e **aplicativo móvel**.  
O ESP32 lê um sensor LDR, aciona um buzzer/LED conforme a luminosidade e se comunica com o backend para **buscar configurações** e **enviar logs de leitura**.

---

## Arquitetura do Projeto

- **Sistema embarcado (ESP32)**  
  - Sensor LDR e atuador (buzzer + LED RGB).  
  - Lê configurações de funcionamento via HTTP (`GET /controle`).  
  - Envia leituras periódicas via HTTP (`POST /log`).  

- **Backend Node.js (microserviços)**  
  - **API Gateway (porta 3000)**: ponto único de acesso para ESP32 e app mobile.  
    - `/controle` → proxy para serviço de controle.  
    - `/log` → proxy para serviço de logging.  
  - **controle-service (porta 3001)**: gerencia parâmetros como `luminosidadeMin` e `luminosidadeMax`.  
  - **logging-service (porta 3002)**: recebe leituras do sensor e expõe histórico para o app.  

- **Aplicativo móvel (a desenvolver)**  
  - Configura as opções do sistema (envia para `/controle`).  
  - Lê histórico de leituras (`GET /log`) e exibe na interface.

---

## Estrutura de Pastas

embarcados-backend/
│
├── api-gateway/
│ └── index.js
│
├── controle-service/
│ └── index.js
│
└── logging-service/
└── index.js

text

O código do ESP32 (arquivo `.ino`) fica em outro repositório ou pasta separada, configurado para chamar o backend via HTTP.

---

## Requisitos

- **Backend**
  - Node.js 18+ (testado com Node 22).
  - npm.
- **Sistema embarcado**
  - Placa ESP32 (ex.: ESP32-WROOM).  
  - IDE Arduino + bibliotecas:
    - [translate:WiFi.h] (core do ESP32).
    - [translate:HTTPClient.h].
    - ArduinoJson.
- **Rede**
  - PC com backend, ESP32 e celular **na mesma rede local**.  
  - No código do ESP32, usar o **IP do PC** (ex.: `http://192.168.3.13:3000`) em vez de `localhost`. [web:50][web:152]

---

## Como executar o backend

1. Clonar o repositório:

git clone https://github.com/seu-usuario/embarcados-backend.git
cd embarcados-backend

text

2. Instalar dependências em cada serviço:

API Gateway
cd api-gateway
npm install

Serviço de controle
cd ../controle-service
npm install

Serviço de logging
cd ../logging-service
npm install

text

3. Subir os serviços (3 terminais diferentes):

Terminal 1 - controle-service
cd controle-service
node index.js

Terminal 2 - logging-service
cd logging-service
node index.js

Terminal 3 - api-gateway
cd api-gateway
node index.js

text

Portas em uso:
- Gateway: `3000`
- Controle: `3001`
- Logging: `3002`

---

## Endpoints da API

Todos os acessos externos (ESP32 e app) passam pelo **API Gateway** (`http://IP_DO_PC:3000`).  

### Serviço de Controle (configuração do sistema embarcado)

- `GET /controle`  
  - Retorna as configurações atuais.  
  - Exemplo de resposta:
    ```
    {
      "luminosidadeMin": 800,
      "luminosidadeMax": 3500
    }
    ```

- `POST /controle`  
  - Atualiza parâmetros de funcionamento (usado pelo app móvel).  
  - Corpo (JSON):
    ```
    {
      "luminosidadeMin": 900,
      "luminosidadeMax": 3200
    }
    ```
  - Resposta:
    ```
    {
      "ok": true,
      "atualizado": {
        "luminosidadeMin": 900,
        "luminosidadeMax": 3200
      }
    }
    ```

### Serviço de Logging (histórico de leituras)

- `POST /log`  
  - Usado pelo ESP32 para registrar leituras do sensor.
  - Corpo (JSON):
    ```
    {
      "valorLuz": 2500,
      "sistemaAtivado": true
    }
    ```
  - Resposta:
    ```
    { "ok": true }
    ```

- `GET /log`  
  - Retorna as últimas leituras registradas (lista de até 100 itens).
  - Exemplo de resposta:
    ```
    [
      {
        "valorLuz": 2500,
        "sistemaAtivado": true,
        "dataHora": "2025-11-25T21:10:00.000Z"
      }
    ]
    ```

---

## Como o ESP32 usa o backend

No código do ESP32:

- Definir a URL base com o IP do PC:

const char* BACKEND_BASE_URL = "http://192.168.3.13:3000";

text

- Buscar configuração periodicamente:

String url = String(BACKEND_BASE_URL) + "/controle";
http.begin(url);
int httpCode = http.GET(); // atualiza LDR_MIN_LEITURA e LDR_MAX_LEITURA a partir do JSON

text

- Enviar leituras:

String url = String(BACKEND_BASE_URL) + "/log";
http.begin(url);
http.addHeader("Content-Type", "application/json");
http.POST(corpoJsonComValorLuzESistemaAtivado);

text

O aplicativo móvel faz as mesmas chamadas HTTP, porém a partir do celular, para permitir:
- Configurar parâmetros do sistema embarcado via `/controle`.
- Ler e exibir o histórico de leituras via `/log`. [web:104][web:107]

---

## Como testar rapidamente

- Com os serviços rodando:
  - Acessar no navegador:  
    - `http://IP_DO_PC:3000/controle` → vê o JSON de configuração.  
    - `http://IP_DO_PC:3000/log` → vê o histórico (após o ESP32 enviar algo).  
- Usar ferramentas como Postman, Insomnia ou `curl` para simular o app móvel e o sistema embarcado. [web:262][web:265]
