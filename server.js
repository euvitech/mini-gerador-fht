const http = require("http");
const fs = require("fs");
const path = require("path");
const { gerarRoteiro, validarDados } = require("./gerarRoteiro");

// Porta configurável por variável de ambiente, com 3000 como padrão.
const PORT = process.env.PORT || 3000;

/*
  Envia uma resposta JSON com o status HTTP informado.
  @param {object} res - Resposta do Node.
  @param {number} status - Código HTTP (200, 400, 404...).
  @param {object} corpo - Objeto que será serializado em JSON.
 */
function responderJson(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

/*
  Lê o corpo da requisição e o interpreta como JSON.
  O corpo chega em pedaços ("chunks"), então acumulamos até o evento 'end'.
 
  @param {object} req - Requisição do Node.
  @returns {Promise<object>} Objeto já parseado.
  @throws {Error} Se o corpo não for um JSON válido.
 */
function lerCorpoJson(req) {
  return new Promise((resolve, reject) => {
    let corpo = "";
    req.on("data", (p) => (corpo += p));
    req.on("end", () => {
      try {
        // Corpo vazio vira "{}" para a validação tratar como campos ausentes.
        resolve(JSON.parse(corpo || "{}"));
      } catch {
        reject(new Error("JSON inválido."));
      }
    });
    req.on("error", reject);
  });
}

const servidor = http.createServer(async (req, res) => {
  // Rota da API: recebe os dados do formulário e devolve o roteiro.
  if (req.method === "POST" && req.url === "/api/gerar") {
    let dados;
    try {
      dados = await lerCorpoJson(req);
    } catch (e) {
      return responderJson(res, 400, { erro: e.message });
    }

    // Valida no backend mesmo já validando no frontend:
    // dados vindos do cliente nunca são confiáveis.
    const faltando = validarDados(dados);
    if (faltando.length > 0) {
      return responderJson(res, 400, {
        erro: "Preencha todos os campos.",
        camposFaltando: faltando,
      });
    }

    return responderJson(res, 200, { roteiro: gerarRoteiro(dados) });
  }

  // Serve o frontend na raiz.
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const html = fs.readFileSync(path.join(__dirname, "public", "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // Qualquer outra coisa: 404, também em JSON para manter o padrão da API.
  responderJson(res, 404, { erro: "Rota não encontrada." });
});

servidor.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));