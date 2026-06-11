import { gql } from 'apollo-angular';

export const CLIENTES = gql`
  query Clientes($busqueda: String) {
    clientes(busqueda: $busqueda) {
      id
      ci
      nombre
      telefono
      email
    }
  }
`;

export const CLIENTE_POR_ID = gql`
  query ClientePorId($id: ID!) {
    cliente(id: $id) {
      id
      ci
      nombre
      telefono
      email
    }
  }
`;

export const BOLETOS_POR_CLIENTE = gql`
  query BoletosPorCliente($clienteId: ID!) {
    boletos(clienteId: $clienteId) {
      items {
        id
        fechaVenta
        precioPagado
        estado
        asiento { numeroAsiento }
        viaje { id fecha horario { horaSalida ruta { origen { nombre } destino { nombre } } } }
      }
    }
  }
`;

export const ACTUALIZAR_CLIENTE = gql`
  mutation ActualizarCliente($id: ID!, $input: ActualizarClienteInput!) {
    actualizarCliente(id: $id, input: $input) {
      id
      ci
      nombre
      telefono
      email
    }
  }
`;
