//#region app and import
import express from "express";
const app = express();
const PORTA = 3000;
//#endregion
app.use(express.json());
//#region Configurações do Projeto
const CAPACIDADE = 20;
const PRECO_PRIMEIRA_HORA = 10;
const PRECO_HORA_ADICIONAL = 5;

let proximoId = 1;
let VEICULOS = [];
let HISTORICO = [];
//#endregion

app.get("/", (req, res) => {
  res.status(200).json({ msg: "API funcionando" });
});

app.post("/veiculos", (req, res) => {
  const { placa, modelo, cor } = req.body;

  if (
    ![placa, modelo, cor].every(
      (campo) => typeof campo === "string" && campo.trim(),
    )
  ) {
    return res.status(400).json({
      msg: "Informe a Placa, Modelo e Cor válido",
    });
  }

  const placaNormalizada = placa.trim().toUpperCase();

  if (VEICULOS.length >= CAPACIDADE) {
    return res.status(409).json({
      msg: "Capacidade maxíma atingida",
    });
  }

  if (
    VEICULOS.some((v) => // retorna um metodo booleano (True, False)
      v.placa === placaNormalizada
    )
  ) {
    return res.status(409).json({
      msg: "Veículo já estacionado",
    });
  }

  const veiculo = {
    id: proximoId++,
    placa: placaNormalizada,
    modelo: modelo.trim(),
    cor: cor.trim(),
    entrada: new Date().toLocaleDateString("pt-br"),
  };

  VEICULOS.push(veiculo);

  return res.status(201).json({ msg: "Entrada registrada", veiculo });
});

app.get("/veiculos", (req, res) => {
    res.status(200).json({total: VEICULOS.length, VEICULOS});
})

app.get("/veiculos/:id", (req, res) => {

})

app.get("/vagas", (req, res) => {

})

app.listen(PORTA, () => {
  console.log(`Servidor Rodando em http://localhost:${PORTA}`);
});
