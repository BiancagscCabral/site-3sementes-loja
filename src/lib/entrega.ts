// Onde a entrega por motoboy (Uber Flash) é oferecida.
//
// São os 14 municípios da Região Metropolitana do Recife. É só uma lista:
// se você passar a entregar em outra cidade, ou parar de entregar em alguma,
// é só mexer aqui.
const CIDADES_UBER_FLASH = [
  "Abreu e Lima",
  "Araçoiaba",
  "Cabo de Santo Agostinho",
  "Camaragibe",
  "Igarassu",
  "Ilha de Itamaracá",
  "Ipojuca",
  "Itapissuma",
  "Jaboatão dos Guararapes",
  "Moreno",
  "Olinda",
  "Paulista",
  "Recife",
  "São Lourenço da Mata",
];

export const UBER_FLASH = {
  id: "uber-flash",
  nome: "Uber Flash (motoboy)",
  descricao: "Combinamos o valor e o horário pelo WhatsApp depois do pedido",
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export function aceitaUberFlash(cidade: string, estado: string) {
  if (normalizar(estado) !== "pe") return false;
  const alvo = normalizar(cidade);
  return CIDADES_UBER_FLASH.some((nome) => normalizar(nome) === alvo);
}
