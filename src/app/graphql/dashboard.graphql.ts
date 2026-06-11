import { gql } from 'apollo-angular';

export const RESUMEN_VENTAS = gql`
  query ResumenVentas($fechaInicio: String!, $fechaFin: String!) {
    resumenVentas(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      totalBoletos
      totalIngresos
      viajesHoy
      ocupacionPromedio
    }
  }
`;

export const VIAJES_DEL_DIA = gql`
  query ViajesDelDia($fecha: String!, $page: Int, $limit: Int) {
    viajes(fecha: $fecha, estado: null, page: $page, limit: $limit) {
      items {
        id
        fecha
        estado
        horario {
          horaSalida
          ruta {
            id
            origen { nombre }
            destino { nombre }
          }
        }
        bus {
          placa
        }
        choferTitular {
          nombre
        }
        totalVendidos
        asientos
      }
      total
    }
  }
`;
