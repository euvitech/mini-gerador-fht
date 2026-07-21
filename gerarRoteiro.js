/*
 Verifica quais campos obrigatórios estão ausentes, vazios ou só com espaços.
 Não lança erro, ele devolve a lista para quem chama decidir o que fazer.

 @param {object} dados - Dados do formulário (entrada não confiável).
 @returns {string[]} Campos inválidos. Lista vazia = dados válidos.
*/

function validarDados(dados) {
  const camposObrigatorios = ["nomeOferta", "resultado", "publico"];
  if (!dados || typeof dados !== "object") {
    return camposObrigatorios;
  }
  return camposObrigatorios.filter(
    (campo) => typeof dados[campo] !== "string" || dados[campo].trim() === ""
  );
}

/*
 Monta o roteiro de vendas a partir dos dados do formulário.

 Correção da Parte B: a versão original chamava `dados.publico.toLowerCase()`
 sem checar se o campo existia, com `publico` ausente, isso lançava
 TypeError. Agora os campos são validados antes da montagem.

 @param {object} dados - Campos nomeOferta, resultado e publico.
 @returns {string} Roteiro de três linhas.
 @throws {Error} Se algum campo obrigatório estiver ausente ou vazio.
*/

function gerarRoteiro(dados) {
  const camposFaltando = validarDados(dados);
  if (camposFaltando.length > 0) {
    throw new Error("Campos ausentes ou vazios: " + camposFaltando.join(", "));
  }

  const publico = (dados.publico || "").trim().toLowerCase();
  const linhas = [
    "Oferta: " + dados.nomeOferta.trim(),
    "Para quem é: " + publico,
    "O que você promete: " + dados.resultado.trim(),
  ];
  return linhas.join("\n");
}

module.exports = { gerarRoteiro, validarDados };