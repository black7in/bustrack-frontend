import { gql } from 'apollo-angular';

export const VIAJES = gql`
  query Viajes($fecha: String, $estado: EstadoViaje, $rutaId: ID, $page: Int, $limit: Int) {
    viajes(fecha: $fecha, estado: $estado, rutaId: $rutaId, page: $page, limit: $limit) {
      items {
        id
        fecha
        estado
        carrilAsignado
        horario { horaSalida ruta { id origen { nombre } destino { nombre } } }
        bus { id placa }
        choferTitular { id nombre }
        totalVendidos
        totalLibres
      }
      total
    }
  }
`;

export const VIAJE_DETALLE = gql`
  query ViajeDetalle($id: ID!) {
    viaje(id: $id) {
      id
      fecha
      estado
      carrilAsignado
      horario { horaSalida ruta { id origen { nombre } destino { nombre } } }
      bus { id placa marca modelo }
      choferTitular { id nombre }
      choferAuxiliar { id nombre }
      totalVendidos
      totalLibres
      horaLlegadaReal
      horaSalidaReal
    }
  }
`;

export const BOLETOS_POR_VIAJE = gql`
  query BoletosPorViaje($viajeId: ID!) {
    boletos(viajeId: $viajeId) {
      items {
        id
        estado
        precioPagado
        asiento { numeroAsiento }
        cliente { nombre ci }
      }
    }
  }
`;

export const CREAR_VIAJE = gql`
  mutation CrearViaje($input: CrearViajeInput!) {
    crearViaje(input: $input) { id }
  }
`;

export const ACTUALIZAR_VIAJE = gql`
  mutation ActualizarViaje($id: ID!, $input: ActualizarViajeInput!) {
    actualizarViaje(id: $id, input: $input) { id }
  }
`;

export const INICIAR_VIAJE = gql`
  mutation IniciarViaje($id: ID!) {
    iniciarViaje(id: $id) { id estado }
  }
`;

export const FINALIZAR_VIAJE = gql`
  mutation FinalizarViaje($id: ID!) {
    finalizarViaje(id: $id) { id estado }
  }
`;

export const GENERAR_VIAJES_DEL_DIA = gql`
  mutation GenerarViajesDelDia($fecha: String!) {
    generarViajesDelDia(fecha: $fecha) {
      id
      fecha
      estado
      horario {
        horaSalida
        ruta { origen { nombre } destino { nombre } }
      }
    }
  }
`;

export const CANCELAR_BOLETO = gql`
  mutation CancelarBoleto($id: ID!) {
    cancelarBoleto(id: $id) {
      estado
      montoDevuelto
      fechaCancelacion
    }
  }
`;

export const CANCELAR_VIAJE = gql`
  mutation CancelarViaje($id: ID!) {
    cancelarViaje(id: $id) { id estado }
  }
`;
