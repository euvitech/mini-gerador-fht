const { test } = require("node:test");
const assert = require("node:assert");
const { gerarRoteiro, validarDados } = require("../gerarRoteiro");

// Caminho feliz: com os três campos preenchidos, o roteiro sai completo.
test("gera o roteiro com todos os campos", () => {
  const r = gerarRoteiro({ 
    nomeOferta: "Curso", 
    resultado: "vender mais", 
    publico: "Empreendedores" 
  });
  
  assert.match(r, /Curso/);
  assert.match(r, /empreendedores/); // deve estar em minúsculas
});

// Regressão do bug da Parte B: sem 'publico', antes era TypeError.
// Agora deve lançar um erro controlado citando o campo que faltou.
test("nao quebra quando publico nao vem (caso do bug da Parte B)", () => {
  assert.throws(() => gerarRoteiro({ nomeOferta: "X", resultado: "Y" }), /publico/);
});

// Campos só com espaços contam como vazios — por isso o .trim() na validação.
test("valida campos vazios ou so com espacos", () => {
  assert.deepStrictEqual(
    validarDados({ nomeOferta: "  ", resultado: "", publico: "ok" }),
    ["nomeOferta", "resultado"]);
});