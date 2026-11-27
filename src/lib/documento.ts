// CPF e CNPJ: formatação e conferência.
//
// A SuperFrete exige o documento da destinatária para gerar a etiqueta. Se
// ele vier errado, o erro só aparece na hora de postar, quando a peça já está
// embalada e a loja já perdeu a viagem. Por isso conferimos na hora de
// digitar, com a conta de verificação que o próprio documento carrega.
//
// Isto não diz que o documento EXISTE, só que os dígitos fecham. Para evitar
// erro de digitação, que é o caso real, basta.

export function soDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function ehCPF(valor: string) {
  const d = soDigitos(valor);
  if (d.length !== 11) return false;
  // 111.111.111-11 e parecidos passam na conta, mas não são documento.
  if (/^(\d)\1{10}$/.test(d)) return false;

  for (const [tamanho, posicao] of [
    [9, 10],
    [10, 11],
  ]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(d[i]) * (posicao - i);
    }
    const resto = (soma * 10) % 11;
    const digito = resto === 10 ? 0 : resto;
    if (digito !== Number(d[tamanho])) return false;
  }
  return true;
}

export function ehCNPJ(valor: string) {
  const d = soDigitos(valor);
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;

  const conferir = (ate: number) => {
    // Os pesos vão de 2 a 9 e recomeçam, lidos de trás para frente.
    let soma = 0;
    let peso = 2;
    for (let i = ate - 1; i >= 0; i--) {
      soma += Number(d[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return conferir(12) === Number(d[12]) && conferir(13) === Number(d[13]);
}

export function documentoValido(valor: string) {
  const d = soDigitos(valor);
  if (d.length === 11) return ehCPF(d);
  if (d.length === 14) return ehCNPJ(d);
  return false;
}

// Vai pontuando conforme a pessoa digita, sem travar o que ela escreve.
export function formatarDocumento(valor: string) {
  const d = soDigitos(valor).slice(0, 14);

  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}
