import { gql } from 'apollo-angular';

export const RUTAS_ACTIVAS = gql`
  query RutasActivas {
    rutas(activa: true) {
      id
      origen { nombre }
      destino { nombre }
    }
  }
`;

export const TARIFA_ACTUAL = gql`
  query TarifaActual($rutaId: ID!, $fecha: String!) {
    tarifaActual(rutaId: $rutaId, fecha: $fecha) {
      id
      precioBase
    }
  }
`;

export const VIAJES_DISPONIBLES = gql`
  query ViajesDisponibles($rutaId: ID!, $fecha: String!) {
    viajesDisponibles(rutaId: $rutaId, fecha: $fecha) {
      id
      fecha
      estado
      horario { horaSalida }
      bus { placa numeroCarriles }
      choferTitular { nombre }
      asientos { id numeroAsiento estado }
      totalVendidos
      totalLibres
    }
  }
`;

export const VIAJE_POR_ID = gql`
  query ViajePorId($id: ID!) {
    viaje(id: $id) {
      id
      fecha
      estado
      horario { horaSalida ruta { origen { nombre } destino { nombre } } }
      bus { placa numeroCarriles }
      choferTitular { nombre }
      asientos { id numeroAsiento estado }
      totalVendidos
      totalLibres
    }
  }
`;

export const CLIENTE_POR_CI = gql`
  query ClientePorCi($ci: String!) {
    clientePorCi(ci: $ci) {
      id
      ci
      nombre
      telefono
      email
    }
  }
`;

export const CREAR_CLIENTE = gql`
  mutation CrearCliente($input: CrearClienteInput!) {
    crearCliente(input: $input) {
      id
      ci
      nombre
    }
  }
`;

export const BOLETO_POR_ID = gql`
  query BoletoPorId($id: ID!) {
    boleto(id: $id) {
      id
      estado
      precioPagado
      cliente { nombre ci }
      asiento { numeroAsiento }
      pdfUrl
      factura {
        numeroFactura
        pdfUrl
        blockchainTxHash
      }
    }
  }
`;

export const VENDER_BOLETO = gql`
  mutation VenderBoleto($input: VenderBoletoInput!) {
    venderBoleto(input: $input) {
      id
      estado
      precioPagado
      cliente { nombre ci }
      asiento { numeroAsiento }
      pdfUrl
      factura {
        numeroFactura
        pdfUrl
        blockchainTxHash
      }
    }
  }
`;
