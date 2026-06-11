import { gql } from 'apollo-angular';

export const VERIFICAR_FACTURA = gql`
  query VerificarFactura($hash: String!) {
    verificarFactura(hash: $hash) {
      existe
      autentica
      numeroFactura
      monto
      txHash
      blockNumber
      fechaRegistro
      urlExplorador
    }
  }
`;
