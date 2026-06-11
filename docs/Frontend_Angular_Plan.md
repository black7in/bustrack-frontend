# Frontend Angular — Plan de Implementación Técnica

> **Rol en el sistema:** Panel administrativo web para el personal interno de BusTrack BO. Consume la API GraphQL de MS-Core. Soporta dos roles: ADMIN (acceso completo) y VENDEDOR (solo venta de boletos y clientes). Incluye modo oscuro togglable por el usuario.

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Angular | 21.x |
| Lenguaje | TypeScript | 5.x |
| UI Components | Angular Material | 21.x |
| GraphQL client | Apollo Angular | 7.x |
| Gráficas | Apache ECharts (ngx-echarts) | 19.x |
| Estilos | SCSS | — |
| Theming | Angular Material Theming (M3) | — |
| Íconos | Material Icons (outline) | — |
| HTTP | Apollo Client (GraphQL) | — |
| Auth storage | httpOnly Cookie | — |
| Animaciones | Angular Animations | incluido |
| Build | Angular CLI | 21.x |
| Despliegue | Vercel | — |

---

## 2. Estructura del Proyecto

```
src/
├── app/
│   ├── core/                          # Servicios singleton, guards, interceptors
│   │   ├── auth/
│   │   │   ├── auth.service.ts        # Login, logout, manejo de cookie JWT
│   │   │   ├── auth.guard.ts          # Protege rutas autenticadas
│   │   │   └── role.guard.ts          # Protege rutas por rol
│   │   ├── graphql/
│   │   │   ├── apollo.config.ts       # Configuración Apollo Client
│   │   │   └── graphql.module.ts
│   │   └── theme/
│   │       └── theme.service.ts       # Toggle modo oscuro/claro
│   │
│   ├── shared/                        # Componentes, pipes y directivas reutilizables
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   ├── header/
│   │   │   ├── stat-card/             # Cards de KPI del dashboard
│   │   │   ├── data-table/            # Tabla genérica con paginación
│   │   │   ├── confirm-dialog/        # Modal de confirmación
│   │   │   ├── seat-map/              # Plano visual de asientos del bus
│   │   │   └── status-badge/         # Badge de estado con colores
│   │   ├── pipes/
│   │   │   └── currency-bob.pipe.ts   # Formatear moneda boliviana
│   │   └── layout/
│   │       └── main-layout/           # Layout con sidebar + header + router-outlet
│   │
│   ├── features/                      # Módulos por funcionalidad
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   ├── ventas/                    # Venta de boletos
│   │   ├── viajes/
│   │   ├── flota/                     # Gestión de buses
│   │   ├── choferes/
│   │   ├── rutas/
│   │   ├── horarios/
│   │   ├── tarifas/
│   │   ├── clientes/
│   │   └── reportes/
│   │
│   ├── graphql/                       # Queries y mutations GraphQL
│   │   ├── auth.graphql.ts
│   │   ├── viajes.graphql.ts
│   │   ├── boletos.graphql.ts
│   │   ├── flota.graphql.ts
│   │   ├── choferes.graphql.ts
│   │   ├── rutas.graphql.ts
│   │   ├── clientes.graphql.ts
│   │   └── dashboard.graphql.ts
│   │
│   ├── app.routes.ts                  # Rutas principales con lazy loading
│   ├── app.config.ts                  # Configuración global de la app
│   └── app.component.ts
│
├── styles/
│   ├── _theme.scss                    # Definición del tema Angular Material (M3)
│   ├── _variables.scss                # Variables SCSS (spacing, border-radius, etc.)
│   ├── _dark-theme.scss               # Tema oscuro
│   └── styles.scss                    # Entry point de estilos globales
│
└── environments/
    ├── environment.ts                 # Development
    └── environment.prod.ts            # Production
```

---

## 3. Sistema de Theming — Modo Claro y Oscuro

### Principio fundamental
**Cero colores hardcodeados en componentes.** Todos los colores se definen como variables CSS en el tema y se referencian desde los componentes. Cambiar el tema implica solo cambiar las variables, nada más.

### Configuración del tema Angular Material M3

En `_theme.scss` se definen dos temas usando el sistema M3 de Angular Material:

**Paleta de colores a extraer del prototipo JSX:**
Antes de implementar el tema, el agente debe revisar `docs/prototipo/` y extraer:
- Color primario (azul profundo / azul petróleo)
- Color de acento (naranja o amarillo dorado)
- Color de error
- Colores de superficie (fondos)

**Variables CSS personalizadas que deben definirse:**

```scss
// En el selector :root (modo claro)
:root {
  // Colores de marca (extraídos del prototipo)
  --color-primary: ;          // HEX del prototipo
  --color-primary-light: ;
  --color-primary-dark: ;
  --color-accent: ;
  --color-accent-light: ;

  // Superficies
  --color-background: ;       // Fondo general de la app
  --color-surface: ;          // Fondo de cards y paneles
  --color-surface-variant: ;  // Fondo de tablas, inputs

  // Texto
  --color-text-primary: ;
  --color-text-secondary: ;
  --color-text-disabled: ;

  // Bordes
  --color-border: ;
  --color-divider: ;

  // Semáforo
  --color-success: ;          // Verde — asiento libre, viaje ok
  --color-warning: ;          // Amarillo — pendiente
  --color-error: ;            // Rojo — asiento ocupado, alerta
  --color-info: ;             // Azul claro — informativo

  // Sidebar
  --sidebar-bg: ;
  --sidebar-text: ;
  --sidebar-active-bg: ;
  --sidebar-active-text: ;

  // Espaciados y forma
  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
}

// Modo oscuro — sobreescribe las variables
[data-theme="dark"] {
  --color-background: ;
  --color-surface: ;
  // ... todos los colores adaptados para oscuro
}
```

### ThemeService

El servicio maneja el toggle y persiste la preferencia del usuario:

- Al iniciar la app, lee la preferencia guardada en `localStorage` (solo la preferencia del tema, no el JWT)
- Si no hay preferencia guardada, detecta el tema del sistema operativo con `prefers-color-scheme`
- Al hacer toggle, agrega o quita el atributo `data-theme="dark"` en el `<html>`
- Guarda la preferencia en `localStorage` con key `bustrack-theme`

El componente del header tiene un botón con ícono de sol/luna que llama a `themeService.toggle()`.

---

## 4. Autenticación y Manejo de Cookie

### Flujo de login

1. El usuario ingresa email y contraseña en la pantalla de login
2. El frontend llama a la **mutation GraphQL `login`** de MS-Core
3. MS-Core retorna el JWT en el body de la respuesta
4. El frontend guarda el token en una **httpOnly cookie** mediante una llamada al propio frontend (BFF pattern simplificado) o configura el servidor para establecerla
5. En cada request de Apollo, el interceptor incluye la cookie automáticamente con `credentials: 'include'`

> **Nota práctica:** Las httpOnly cookies las establece el servidor, no JavaScript. Para simplificar en el frontend Angular, el agente puede usar una estrategia mixta: guardar el JWT en memoria (variable en AuthService) para las requests de Apollo, y en `sessionStorage` como fallback. Esto es más seguro que `localStorage` y más simple que implementar un BFF completo. El JWT nunca se guarda en `localStorage`.

### Redirección por rol al hacer login

```
ADMIN   → /dashboard
VENDEDOR → /ventas
```

### AuthGuard

Protege todas las rutas bajo `/app/*`. Si no hay token válido, redirige a `/login`.

### RoleGuard

Protege rutas específicas por rol:

| Ruta | Roles permitidos |
|---|---|
| `/app/dashboard` | ADMIN |
| `/app/ventas` | ADMIN, VENDEDOR |
| `/app/viajes` | ADMIN |
| `/app/flota` | ADMIN |
| `/app/choferes` | ADMIN |
| `/app/rutas` | ADMIN |
| `/app/horarios` | ADMIN |
| `/app/tarifas` | ADMIN |
| `/app/clientes` | ADMIN, VENDEDOR |
| `/app/reportes` | ADMIN |

### Sidebar dinámico

El sidebar muestra solo los ítems que el rol del usuario puede ver. El VENDEDOR solo ve: Venta de Boletos y Clientes.

---

## 5. Configuración Apollo Client

Apollo Client se configura en `apollo.config.ts`:

- **URI:** `${environment.apiUrl}/graphql`
- **credentials:** `include` (para enviar cookies en cada request)
- **Cache:** `InMemoryCache` con políticas de merge para listas paginadas
- **Error handling:** link de error que intercepta errores 401 (token expirado) y redirige al login automáticamente

### Organización de queries y mutations

Cada módulo tiene su archivo `.graphql.ts` con las queries y mutations tipadas usando `gql` de Apollo. No escribir queries inline en los componentes, siempre en el archivo centralizado del módulo.

Ejemplo de estructura de un archivo GraphQL:
```typescript
// viajes.graphql.ts
export const GET_VIAJES = gql`query { ... }`
export const GET_VIAJE = gql`query { ... }`
export const CREAR_VIAJE = gql`mutation { ... }`
export const CANCELAR_VIAJE = gql`mutation { ... }`
```

---

## 6. Rutas y Lazy Loading

Todas las rutas de features usan lazy loading para optimizar el bundle inicial:

```
/login                    → LoginComponent (eager, no requiere auth)
/app                      → MainLayoutComponent (requiere AuthGuard)
  /app/dashboard          → DashboardModule (lazy, solo ADMIN)
  /app/ventas             → VentasModule (lazy, ADMIN + VENDEDOR)
  /app/viajes             → ViajesModule (lazy, solo ADMIN)
  /app/flota              → FlotaModule (lazy, solo ADMIN)
  /app/choferes           → ChoferesModule (lazy, solo ADMIN)
  /app/rutas              → RutasModule (lazy, solo ADMIN)
  /app/horarios           → HorariosModule (lazy, solo ADMIN)
  /app/tarifas            → TarifasModule (lazy, solo ADMIN)
  /app/clientes           → ClientesModule (lazy, ADMIN + VENDEDOR)
  /app/reportes           → ReportesModule (lazy, solo ADMIN)
  /app/**                 → redirect a /app/dashboard
/                         → redirect a /login
```

---

## 7. Layout Principal

El `MainLayoutComponent` es el shell de la aplicación autenticada:

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Logo | Breadcrumb | Theme toggle | Usuario  │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│   SIDEBAR    │         ROUTER OUTLET                 │
│   (240px)    │         (contenido del módulo)        │
│              │                                       │
│  nav items   │                                       │
│  con íconos  │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

- El sidebar es colapsable (solo íconos en modo compacto)
- El header muestra el nombre del usuario logueado y su rol como badge
- El botón de toggle de tema (sol/luna) está en el header
- En mobile el sidebar se convierte en drawer con overlay
- Revisar el prototipo de ejemplo

---

## 8. Módulos y Pantallas

### 8.1 Login
- Formulario centrado con logo BusTrack BO
- Campos: email y contraseña con validación
- Botón de login con spinner durante la request
- Mensaje de error si credenciales incorrectas
- Redirección automática si ya está autenticado

---

### 8.2 Dashboard (solo ADMIN)

**Cards de KPI (fila superior):**
- Boletos vendidos hoy
- Ingresos del día (en BOB)
- Viajes programados hoy
- Ocupación promedio del día (%)

Cada card tiene: ícono, valor grande, label y comparación con ayer (flecha + porcentaje).

**Gráfica de ventas (ECharts):**
- Línea de ingresos por día de la última semana
- Barras de boletos vendidos por día

**Tabla de viajes del día:**
- Columnas: ruta, hora salida, bus, chofer, asientos vendidos/total, estado
- Badge de estado con color: PROGRAMADO (azul), EN_RUTA (verde), FINALIZADO (gris), CANCELADO (rojo)
- Sin paginación, máximo 10 registros

**Query GraphQL usada:**
```graphql
resumenVentasPorFecha(fecha: "HOY")
viajes(fecha: "HOY", estado: null, page: 1, limit: 10)
```

---

### 8.3 Venta de Boletos (ADMIN + VENDEDOR)

Es el módulo más importante. Flujo en 3 pasos:

**Paso 1 — Buscar viaje:**
- Selector de ruta (origen → destino)
- Date picker para la fecha
- Botón buscar
- Lista de viajes disponibles con hora, bus, precio y asientos libres
- El usuario selecciona un viaje

**Paso 2 — Seleccionar asiento:**
- Plano visual del bus (`SeatMapComponent`)
- Asientos renderizados en grid según `bus.numeroCarriles`
- Colores: verde = LIBRE, rojo = VENDIDO, amarillo = seleccionado
- El usuario hace clic en un asiento libre para seleccionarlo
- Panel lateral con resumen: ruta, fecha, hora, asiento seleccionado, precio

**Paso 3 — Datos del pasajero:**
- Campo CI con búsqueda: si el CI ya existe en el sistema, autocompleta el nombre
- Si no existe, formulario completo: CI, nombre, teléfono, email (opcional)
- Campo NIT y razón social (opcional, para factura empresarial)
- Botón confirmar venta
- Al confirmar: spinner, luego modal de éxito con opción de imprimir/descargar PDF del boleto

**Queries y mutations:**
```graphql
viajesDisponibles(rutaId, fecha)
viaje(id)  // para cargar asientos
clientePorCi(ci)  // búsqueda por CI
crearCliente(input)  // si no existe
venderBoleto(input)
```

---

### 8.4 Gestión de Viajes (solo ADMIN)

**Lista de viajes:**
- Filtros: ruta, fecha, estado
- Tabla con: fecha, ruta, hora, bus, chofer, vendidos/total, carril, estado
- Acciones: ver detalle, cancelar

**Crear viaje:**
- Formulario: seleccionar horario, fecha, bus, chofer titular, chofer auxiliar (opcional), carril
- Validación en tiempo real de disponibilidad

**Detalle de viaje:**
- Info completa del viaje
- Lista de boletos vendidos con pasajero y asiento
- Botones: iniciar viaje, finalizar viaje, cancelar viaje

---

### 8.5 Gestión de Flota — Buses (solo ADMIN)

**Lista:**
- Tabla con: foto miniatura, placa, marca, modelo, año, capacidad, estado
- Filtro por estado
- Botón crear bus

**Crear/Editar bus:**
- Formulario en panel lateral (drawer) o modal
- Campos según el plan de MS-Core
- Upload de foto: botón que llama a `generarUrlSubida` y sube directo a S3

**Acciones:**
- Cambiar estado mecánico (OPERATIVO / EN_MANTENIMIENTO / FUERA_DE_SERVICIO)
- Ver historial de viajes del bus

---

### 8.6 Gestión de Choferes (solo ADMIN)

**Lista:**
- Tabla con: foto, nombre, CI, licencia, categoría, vence licencia, estado
- Alerta visual si la licencia vence en menos de 30 días
- Filtro por estado

**Crear/Editar chofer:**
- Formulario completo
- Toggle "Crear cuenta de acceso" — si está activo muestra campos email y contraseña
- Upload de foto de perfil y foto facial (para reconocimiento IA)

---

### 8.7 Gestión de Rutas (solo ADMIN)

**Lista de rutas:**
- Tabla: origen → destino, distancia, duración estimada, estado
- Acciones: ver horarios, ver tarifas, editar, activar/desactivar

**Horarios de una ruta:**
- Lista de horarios con hora y días de la semana
- Crear/editar horario

---

### 8.8 Gestión de Tarifas (solo ADMIN)

- Tabla por ruta con los 4 tipos de día y su precio base
- Edición inline del precio o modal
- Historial de cambios de tarifa (vigente_desde / vigente_hasta)

---

### 8.9 Gestión de Clientes (ADMIN + VENDEDOR)

- Búsqueda por CI o nombre (ILIKE)
- Tabla con: CI, nombre, teléfono, email, fecha registro
- Ver historial de boletos del cliente
- Editar datos del cliente

---

### 8.10 Reportes (solo ADMIN)

**Reporte de ventas:**
- Filtro por rango de fechas y ruta
- Tabla de boletos con: fecha, ruta, pasajero, asiento, precio, vendedor
- Exportar a CSV (generado en el frontend con los datos de la query)

**Reporte de ocupación:**
- Gráfica ECharts de ocupación por ruta y fecha (query `ocupacionPorRuta`)
- Mapa de calor por hora del día y día de la semana

**Reporte de ingresos:**
- Gráfica de barras de ingresos por ruta (query `ingresosPorRuta`)
- Comparativo mes actual vs mes anterior

---

## 9. Componente SeatMap (Plano de Asientos)

Es el componente más complejo del frontend. Debe:

- Recibir como input: lista de `AsientoViaje[]` y `bus.numeroCarriles`
- Renderizar los asientos en una grilla de N columnas (según `numeroCarriles`)
- Asignar clase CSS según estado: `libre`, `vendido`, `seleccionado`
- Emitir un output `asientoSeleccionado` con el ID del asiento al hacer clic
- Solo permitir seleccionar asientos en estado `LIBRE`
- Mostrar el número de asiento dentro de cada celda
- Incluir leyenda de colores abajo del plano

**Estructura visual:**
```
[1] [2]   [3] [4]     ← fila 1 (2 columnas + pasillo + 2 columnas)
[5] [6]   [7] [8]     ← fila 2
...
```

Los colores del plano usan las variables CSS del tema para que funcionen en modo oscuro también.

---

## 10. Variables de Entorno

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',        // MS-Core
  blockchainApiUrl: 'http://localhost:3001'  // MS-Blockchain (para verificar facturas)
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://ms-core.tu-dominio.com',
  blockchainApiUrl: 'https://ms-blockchain.tu-dominio.com'
};
```

---

## 11. Manejo de Errores Global

- **401 Unauthorized:** Apollo error link detecta el error, limpia el token y redirige a `/login`
- **403 Forbidden:** Muestra snackbar de Angular Material con mensaje "No tenés permisos para esta acción"
- **500 / Network error:** Snackbar con mensaje genérico "Error de conexión, intentá nuevamente"
- **Errores de validación:** Mensajes inline en los campos del formulario con `mat-error`

---

## 12. Orden de Implementación

El agente debe implementar en este orden:

1. **Setup inicial** — proyecto Angular 21, Angular Material, Apollo Client, estructura de carpetas, configuración de tema con variables CSS (claro y oscuro), ThemeService
2. **Auth** — LoginComponent, AuthService, AuthGuard, RoleGuard, rutas principales
3. **Layout** — MainLayoutComponent, SidebarComponent, HeaderComponent con toggle de tema
4. **Shared components** — StatCard, DataTable, StatusBadge, ConfirmDialog, CurrencyBobPipe
5. **Dashboard** — cards de KPI, gráfica ECharts, tabla de viajes del día
6. **Módulo Ventas** — flujo completo de 3 pasos incluyendo SeatMapComponent
7. **Módulo Clientes** — lista y búsqueda por CI
8. **Módulo Flota** — buses y choferes
9. **Módulo Rutas** — rutas, horarios y tarifas
10. **Módulo Viajes** — lista, crear viaje, detalle
11. **Módulo Reportes** — gráficas y exportación CSV
12. **Ajustes visuales** — revisar prototipo JSX en `docs/prototipo/`, ajustar colores, tipografía y espaciados para que coincida con el diseño
13. **Despliegue** — configuración de Vercel, variables de entorno de producción

---

## 13. Consideraciones Finales para el Agente

- **Revisar `docs/prototipo/`** antes de escribir una sola línea de CSS. Extraer colores HEX, tipografía y espaciados del prototipo y configurarlos como variables CSS en `_theme.scss` antes de implementar cualquier componente.
- **Cero colores hardcodeados.** Nunca escribir `color: #1F4E79` en un componente. Siempre `color: var(--color-primary)`.
- **Standalone components.** Angular 21 usa standalone components por defecto. No crear NgModules salvo para lazy loading de features.
- **Signals.** Usar Angular Signals (`signal()`, `computed()`) para estado local de los componentes en lugar de propiedades simples donde tenga sentido.
- **Apollo con async pipe.** Usar el `async` pipe de Angular en los templates para manejar los observables de Apollo. No subscribirse manualmente en el componente salvo para mutations.
- **Tipado estricto.** Definir interfaces TypeScript para cada entidad que se recibe de GraphQL. No usar `any`.
- **El SeatMap es el componente más crítico.** Testearlo con diferentes capacidades de bus (20, 40, 50 asientos) y diferentes números de carriles (2, 4) antes de integrarlo al flujo de venta.
- **Modo oscuro en cada componente.** Al crear cualquier componente nuevo, verificar que se vea correctamente en ambos temas antes de pasar al siguiente.
- **Tipografía.** Configurar la tipografía del prototipo en `styles.scss` usando Google Fonts. Aplicarla globalmente via el tema de Angular Material.
