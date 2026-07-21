# Mini Gerador de Roteiro — Teste Técnico FHT

Aplicação web simples que gera um mini-roteiro de vendas a partir de três campos preenchidos pelo usuário: **nome da oferta**, **resultado prometido** e **público**. O frontend envia os dados em JSON para o backend, que monta e devolve o roteiro.

## Tecnologias

- **Node.js** (sem frameworks e sem dependências externas — apenas os módulos nativos `http` e `fs`)
- **HTML + CSS + JavaScript puro** no frontend
- **node:test** (runner de testes nativo do Node) para os testes automatizados

## Como rodar

Pré-requisito: Node.js 18 ou superior instalado.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd mini-gerador-fht

# 2. Inicie o servidor (não há dependências para instalar)
npm start

# 3. Abra no navegador
# http://localhost:3000
```

Para usar outra porta: `PORT=8080 npm start`

## Como rodar os testes

```bash
npm test
```

## Estrutura do projeto

```
mini-gerador-fht/
├── public/
│   └── index.html             # Frontend: formulário + fetch + exibição do 
├── test/
│   └── gerarRoteiro.test.js   # Testes automatizados (node --test)
├── gerarRoteiro.js            # Regra de negócio: geração do roteiro + validação 
├── package.json               # Scripts npm (start / test), sem dependências
├── server.js                  # Backend: servidor HTTP, rota POST /api/gerar e 
└── README.md
```

A regra de negócio (`gerarRoteiro.js`) fica separada do servidor de propósito: ela não conhece nada de HTTP, o que permite testá-la isoladamente — é exatamente o que os testes automatizados fazem.

## API

**`POST /api/gerar`**

Corpo (JSON):

```json
{
  "nomeOferta": "Curso de Marketing Digital",
  "resultado": "dobrar suas vendas em 90 dias",
  "publico": "pequenos empreendedores"
}
```

Resposta de sucesso (`200`):

```json
{ "roteiro": "Conheça Curso de Marketing Digital — feito sob medida para pequenos empreendedores.\n..." }
```

Resposta de erro (`400`), quando algum campo está ausente ou vazio:

```json
{ "erro": "Preencha todos os campos.", "camposFaltando": ["publico"] }
```

## Parte B — O bug e a correção

**Causa:** a função original chamava `dados.publico.toLowerCase()` sem verificar se o campo existia. Quando `publico` chegava vazio ou não era enviado, `dados.publico` era `undefined`, e a chamada lançava `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`, quebrando a geração.

**Correção:** os três campos agora são validados antes da montagem do roteiro (função `validarDados`, que também rejeita strings só com espaços). Se algo estiver faltando, o backend responde `400` com uma mensagem clara em vez de quebrar. Como defesa extra, o campo usa fallback para string vazia: `(dados.publico || "").trim().toLowerCase()`.

O caso do bug está coberto pelo teste `"não quebra quando 'publico' não é enviado"` em `test/gerarRoteiro.test.js`. A função corrigida vive em `gerarRoteiro.js`.

## Parte C — Melhoria do prompt (bônus)

Optei pela segunda alternativa do enunciado: melhorar o prompt base, sem chamada a um modelo externo (o que mantém o projeto sem dependências e sem necessidade de chave de API).

**Prompt base do enunciado:**

> "Escreva um roteiro de vendas com base nestes dados: oferta, resultado e público."

**Prompt melhorado:**

> Você é um copywriter especializado em textos curtos de venda.
> Escreva um roteiro de vendas de 3 a 4 linhas, em português do Brasil,
> com tom direto e persuasivo, terminando com uma chamada para ação.
>
> Use exatamente estes dados, sem inventar informações extras:
> - Oferta: {nomeOferta}
> - Resultado prometido: {resultado}
> - Público-alvo: {publico}
>
> Responda apenas com o roteiro, sem título e sem comentários.

**O que mudou e por quê:**

1. **Papel definido** ("Você é um copywriter...") — modelos respondem melhor quando recebem uma persona; direciona vocabulário e estilo para o domínio certo.
2. **Formato explícito** (3 a 4 linhas, português do Brasil, chamada para ação no final) — o prompt original não definia tamanho nem estrutura, o que gera respostas de comprimento imprevisível.
3. **Dados rotulados um a um** (`- Oferta: {nomeOferta}`) — o original citava os campos de forma abstrata ("oferta, resultado e público") sem indicar onde os valores entram; rotular elimina ambiguidade sobre qual valor é qual.
4. **Restrição anti-alucinação** ("sem inventar informações extras") — impede o modelo de criar preços, prazos ou garantias que não foram fornecidos.
5. **Instrução de saída** ("responda apenas com o roteiro") — evita preâmbulos como "Claro! Aqui está...", importante se a resposta for consumida por um sistema.

## Decisões e tratamento de erros

- **Validação dupla:** o frontend valida antes de enviar (feedback imediato ao usuário) e o backend valida de novo (nunca confiar apenas no cliente).
- **Erros sempre em JSON** com status HTTP adequado: `400` para dados inválidos, `404` para rota inexistente, `500` para erro interno.
- **Frontend resiliente:** se o servidor estiver fora do ar ou responder com erro, o usuário vê uma mensagem amigável em vez de uma tela quebrada.
- **Sem dependências externas:** para um escopo tão pequeno, Node puro mantém o projeto simples de rodar e de revisar.
- **Escopo calibrado:** o enunciado pede algo enxuto, então a estrutura é mínima — mas com a separação que importa: regra de negócio isolada do servidor, testável sem HTTP.