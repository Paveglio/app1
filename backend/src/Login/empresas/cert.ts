import * as forge from 'node-forge';

/**
 * Valida se o certificado PFX contem o CPF/CNPJ esperado no subject.
 *
 * OID 2.16.76.1.3.1 -> CPF
 * OID 2.16.76.1.3.3 -> CNPJ
 */
export function validarDocumentoNoCertificado(
  certificadoPfx: Buffer,
  senha: string,
  documento: string,
): boolean {
  try {
    const p12Asn1 = forge.asn1.fromDer(certificadoPfx.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    const cert = certBags[0].cert;
    const subjectAttrs = cert.subject.attributes;

    const attr = subjectAttrs.find((item) => ['2.16.76.1.3.1', '2.16.76.1.3.3'].includes(item.type));

    const valorExtraido = attr?.value?.replace(/\D/g, '');
    const docLimpo = documento.replace(/\D/g, '');

    return valorExtraido === docLimpo;
  } catch (_err) {
    return false;
  }
}
