import { gql } from 'apollo-angular';

export const RUTAS = gql`
  query Rutas($activa: Boolean) {
    rutas(activa: $activa) {
      id
      origen { id nombre ciudad }
      destino { id nombre ciudad }
      distanciaKm
      duracionEstimadaMin
      activa
    }
  }
`;

export const RUTA_POR_ID = gql`
  query RutaPorId($id: ID!) {
    ruta(id: $id) {
      id
      origen { id nombre ciudad }
      destino { id nombre ciudad }
      distanciaKm
      duracionEstimadaMin
      activa
    }
  }
`;

export const HORARIOS_POR_RUTA = gql`
  query HorariosPorRuta($rutaId: ID!) {
    horarios(rutaId: $rutaId) {
      id
      horaSalida
      diasSemana
      activo
    }
  }
`;

export const TARIFAS_POR_RUTA = gql`
  query TarifasPorRuta($rutaId: ID!) {
    tarifas(rutaId: $rutaId) {
      id
      tipoDia
      precioBase
      vigenteDesde
      vigenteHasta
    }
  }
`;

export const TERMINALES = gql`
  query Terminales {
    terminales {
      id
      nombre
      ciudad
    }
  }
`;

export const CREAR_RUTA = gql`
  mutation CrearRuta($input: CrearRutaInput!) {
    crearRuta(input: $input) { id }
  }
`;

export const ACTUALIZAR_RUTA = gql`
  mutation ActualizarRuta($id: ID!, $input: ActualizarRutaInput!) {
    actualizarRuta(id: $id, input: $input) { id }
  }
`;

export const CREAR_HORARIO = gql`
  mutation CrearHorario($input: CrearHorarioInput!) {
    crearHorario(input: $input) { id }
  }
`;

export const CREAR_TARIFA = gql`
  mutation CrearTarifa($input: CrearTarifaInput!) {
    crearTarifa(input: $input) { id }
  }
`;

export const ACTUALIZAR_TARIFA = gql`
  mutation ActualizarTarifa($id: ID!, $input: ActualizarTarifaInput!) {
    actualizarTarifa(id: $id, input: $input) { id }
  }
`;

export const CREAR_TERMINAL = gql`
  mutation CrearTerminal($input: CrearTerminalInput!) {
    crearTerminal(input: $input) { id nombre ciudad }
  }
`;

export const ACTUALIZAR_TERMINAL = gql`
  mutation ActualizarTerminal($id: ID!, $input: ActualizarTerminalInput!) {
    actualizarTerminal(id: $id, input: $input) { id nombre ciudad }
  }
`;
