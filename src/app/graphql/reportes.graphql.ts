import { gql } from 'apollo-angular';

export const REPORTE_VENTAS = gql`
  query ReporteVentas($fechaInicio: String!, $fechaFin: String!) {
    resumenVentas(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      totalBoletos
      totalIngresos
      viajesHoy
      ocupacionPromedio
    }
  }
`;

export const BOLETOS_REPORTE = gql`
  query BoletosReporte($page: Int, $limit: Int) {
    boletos(page: $page, limit: $limit) {
      items {
        id
        fechaVenta
        precioPagado
        estado
        asiento { numeroAsiento }
        cliente { nombre ci }
        viaje { id fecha horario { horaSalida ruta { origen { nombre } destino { nombre } } } }
      }
      total
    }
  }
`;

export const INGRESOS_POR_RUTA = gql`
  query IngresosPorRuta($fechaInicio: String!, $fechaFin: String!) {
    ingresosPorRuta(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      ruta { origen { nombre } destino { nombre } }
      totalBoletos
      totalIngresos
    }
  }
`;

export const INGRESOS_POR_DIA = gql`
  query IngresosPorDia($fechaInicio: String!, $fechaFin: String!) {
    ingresosPorDia(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      fecha
      totalIngresos
      totalBoletos
    }
  }
`;

export const OCUPACION_POR_RUTA_QUERY = gql`
  query OcupacionPorRutaQuery($fechaInicio: String!, $fechaFin: String!, $rutaId: ID!) {
    ocupacionPorRuta(fechaInicio: $fechaInicio, fechaFin: $fechaFin, rutaId: $rutaId) {
      fecha
      porcentaje
      vendidos
      capacidad
    }
  }
`;

export const REPORTE_INTELIGENTE = gql`
  query ReporteInteligente($pregunta: String!) {
    reporteInteligente(pregunta: $pregunta) {
      pregunta
      explicacion
      columnas
      filas
      totalFilas
      error
    }
  }
`;
