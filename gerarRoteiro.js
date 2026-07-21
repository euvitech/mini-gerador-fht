function gerarRoteiro(dados) {
  const publico = dados.publico.toLowerCase();
  const linhas = [
    "Oferta: " + dados.nomeOferta,
    "Para quem é: " + publico,
    "O que você promete: " + dados.resultado,
  ];
  return linhas.join("\n");
}

module.exports = { gerarRoteiro };