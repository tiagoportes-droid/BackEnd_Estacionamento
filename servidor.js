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
    VEICULOS.some(
      (
        v, // retorna um metodo booleano (True, False)
      ) => v.placa === placaNormalizada,
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
    entrada: new Date().toISOString("pt-br"),
  };

  VEICULOS.push(veiculo);

  return res.status(201).json({ msg: "Entrada registrada", veiculo });
});

app.get("/veiculos", (req, res) => {
  res.status(200).json({ total: VEICULOS.length, VEICULOS });
});

app.get("/veiculos/:id", (req, res) => {
  const id = Number(req.params.id);
  const veiculo = VEICULOS.find((v) => v.id === id);

  if (!veiculo) return res.status(404).json({ msg: "Veículo não encontrado" });

  return res.json(veiculo);
});

app.get("/vagas", (req, res) => { //endpoint "/vagas"
  res.status(200).json({
    capacidade: CAPACIDADE,
    ocupadas: VEICULOS.length,
    disponiveis: CAPACIDADE - VEICULOS.length,
  });
});

function calcularValor(entrada, saida = new Date()) {
  const inicio = new Date(entrada);
  const tempoMs = saida.getTime() - inicio.getTime();

  const horas = Math.max(1, Math.ceil(tempoMs / (1000 * 60 * 60)));
  const valor = PRECO_PRIMEIRA_HORA + (horas - 1) * PRECO_HORA_ADICIONAL;


  return { horasCobradas: horas, valor };
}

app.get("/veiculos/:id/valor", (req, res) => {
    const veiculo = VEICULOS.find((v) => v.id === Number(req.params.id))

    if(!veiculo) return res.status(404).json({msg: "Veiculos não encontrado"});

    return res.json({
    placa: veiculo.placa,
    entrada: veiculo.entrada,
    ...calcularValor(veiculo.entrada)
    })
})

app.listen(PORTA, () => {
  console.log(`Servidor Rodando em http://localhost:${PORTA}`);
});
