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

//ROTA INICIAL
app.get("/", (req, res) => {
  res.status(200).json({ msg: "API funcionando" });
});

//CADASTRA
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

//LISTA OS VEICULOS
app.get("/veiculos", (req, res) => {
  res.status(200).json({ total: VEICULOS.length, VEICULOS });
});

//MOSTRA VEICULO EM ESPECIFICO
app.get("/veiculos/:id", (req, res) => {
  const id = Number(req.params.id);
  const veiculo = VEICULOS.find((v) => v.id === id);

  if (!veiculo) return res.status(404).json({ msg: "Veículo não encontrado" });

  return res.json(veiculo);
});

//CONSULTA AS VAGAS
app.get("/vagas", (req, res) => {
  //endpoint "/vagas"
  res.status(200).json({
    capacidade: CAPACIDADE,
    ocupadas: VEICULOS.length,
    disponiveis: CAPACIDADE - VEICULOS.length,
  });
});

//CALCULA O VALOR PAGO POR HORA
function calcularValor(entrada, saida = new Date()) {
  const inicio = new Date(entrada);
  const tempoMs = saida.getTime() - inicio.getTime();

  const horas = Math.max(1, Math.ceil(tempoMs / (1000 * 60 * 60)));
  const valor = PRECO_PRIMEIRA_HORA + (horas - 1) * PRECO_HORA_ADICIONAL;

  return { horasCobradas: horas, valor };
}

//CONSULTA O VALOR
app.get("/veiculos/:id/valor", (req, res) => {
  const veiculo = VEICULOS.find((v) => v.id === Number(req.params.id));

  if (!veiculo) return res.status(404).json({ msg: "Veiculos não encontrado" });

  return res.json({
    placa: veiculo.placa,
    entrada: veiculo.entrada,
    ...calcularValor(veiculo.entrada),
  });
});

//REGISTRA A SAIDA
app.post("/veiculos/:id/saida", (req, res) => {
  const indice = VEICULOS.findIndex((v) => v.id === Number(req.params.id));

  if (indice === -1)
    return res.status(404).json({ msg: "Veiculos não encontrado" });

  const veiculo = VEICULOS[indice];
  const saida = new Date();
  const calculo = calcularValor(veiculo.entrada, saida);

  const registro = {
    ...veiculo,
    saida: saida.toString(),
    horasCobradas: calculo.horasCobradas,
    valorPago: calculo.valor,
  };

  HISTORICO.push(registro);
  VEICULOS.splice(indice, 1);

  res.status(200).json({
    msg: "Saída registrada",
    registro,
  });
});

//ATUALIZA O VEICULO
app.put("/veiculos/:id", (req, res) => {
  // put((v) => {}) = Atualiza o valor inserido
  const veiculo = VEICULOS.find((v) => v.id === Number(req.params.id));
  if (!veiculo) return res.status(404).json({ msg: "Veiculo não encontrado" });

  const { placa, modelo, cor } = req.body; // Pega o valor do body, no caso o {placa, modelo, cor}

  if (
    ![placa, modelo, cor].every(
      (campo) => typeof campo === "string" && campo.trim(), // trim() = Retira os espaços no campo
    )
  ) {
    return res
      .status(400)
      .json({ msg: "Informe a Placa, Modelo e cor valido." });
  }

  const novaPlaca = placa.trim().toUpperCase();

  if (VEICULOS.some((v) => v.placa === novaPlaca && v.id !== novaPlaca)) {
    return res.status(400).json({
      erro: "Placa já cadastrada",
    });
  }

  veiculo.placa = novaPlaca;
  veiculo.modelo = modelo.trim();
  veiculo.cor = cor.trim();

  return res.status(200).json({
    msg: "Veiculo Atualizado",
  });
});

//HITOICO DOS VEICULOS
app.get("/historico", (req, res) => {
  res.json({ total: HISTORICO.length, HISTORICO });
});

//FATURAMENTO DA LOJA
app.get("/faturamento", (req, res) => {
  const faturamento = HISTORICO.reduce(
    (total, item) => total + item.valorPago,
    0,
  );
  res.json({
    veiculosEstacionados: VEICULOS.length,
    vagasDisponiveis: CAPACIDADE - VEICULOS.length,
    saidaRealizadas: HISTORICO.length,
    faturamento: Number(faturamento.toFixed(2)),
  });
});

//INICIA O SERVIDOR
app.listen(PORTA, () => {
  console.log(`Servidor Rodando em http://localhost:${PORTA}`);
});
