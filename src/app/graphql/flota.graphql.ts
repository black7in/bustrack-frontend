import { gql } from 'apollo-angular';

export const BUSES = gql`
  query Buses($estado: EstadoBus) {
    buses(estado: $estado) {
      id
      placa
      marca
      modelo
      anio
      numeroCarriles
      estadoMecanico
      fotoUrl
    }
  }
`;

export const BUS_POR_ID = gql`
  query BusPorId($id: ID!) {
    bus(id: $id) {
      id
      placa
      marca
      modelo
      anio
      numeroCarriles
      estadoMecanico
      fotoUrl
    }
  }
`;

export const CREAR_BUS = gql`
  mutation CrearBus($input: CrearBusInput!) {
    crearBus(input: $input) {
      id
      placa
    }
  }
`;

export const ACTUALIZAR_BUS = gql`
  mutation ActualizarBus($id: ID!, $input: ActualizarBusInput!) {
    actualizarBus(id: $id, input: $input) {
      id
      placa
    }
  }
`;

export const CREAR_CHOFER = gql`
  mutation CrearChofer($input: CrearChoferInput!) {
    crearChofer(input: $input) {
      id
      nombre
    }
  }
`;

export const GENERAR_URL_SUBIDA = gql`
  mutation GenerarUrlSubida($tipo: TipoArchivo!, $entidadId: ID!, $extension: String) {
    generarUrlSubida(tipo: $tipo, entidadId: $entidadId, extension: $extension) {
      uploadUrl
      s3Key
    }
  }
`;

export const GUARDAR_FOTO_CHOFER = gql`
  mutation GuardarFotoChofer($id: ID!, $s3Key: String!, $tipo: TipoArchivo!) {
    guardarFotoChofer(id: $id, s3Key: $s3Key, tipo: $tipo) {
      id
      fotoPerfilUrl
      fotoFacialUrl
    }
  }
`;

export const CHOFERES = gql`
  query Choferes($estado: EstadoChofer) {
    choferes(estado: $estado) {
      id
      nombre
      ci
      licenciaCategoria
      licenciaNumero
      licenciaVence
      telefono
      estado
      fotoPerfilUrl
    }
  }
`;

export const CHOFER_POR_ID = gql`
  query ChoferPorId($id: ID!) {
    chofer(id: $id) {
      id
      nombre
      ci
      licenciaCategoria
      licenciaNumero
      licenciaVence
      telefono
      estado
      fotoPerfilUrl
      fotoFacialUrl
      usuario { id email }
    }
  }
`;
