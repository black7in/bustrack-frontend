# Resumen de Implementacion — BusTrack BO Frontend

---

## Paso 1: Setup Inicial

**Fecha:** 22 Mayo 2026

### 1.1 Proyecto Angular
- **Comando:** `ng new bustrack-frontend --routing --style=scss --standalone --ssr=false`
- **Versiones:** Angular 21.2.14, TypeScript 5.9.3, Node 24.15.0
- **Package manager:** npm 11.12.1

### 1.2 Dependencias instaladas
| Paquete | Version |
|---|---|
| @angular/material | 21.2.12 |
| @angular/cdk | 21.2.12 |
| @apollo/client | 7.x (latest) |
| apollo-angular | 7.x (latest) |
| graphql | latest |
| echarts | latest |
| ngx-echarts | latest |

### 1.3 Estructura de carpetas creada

```
src/app/
├── core/
│   ├── auth/          # auth.service.ts, auth.guard.ts, role.guard.ts
│   ├── graphql/       # graphql.service.ts (manejo de token en sessionStorage)
│   └── theme/         # theme.service.ts (toggle claro/oscuro)
├── shared/
│   ├── components/    # sidebar/, header/, stat-card/, data-table/, etc.
│   ├── pipes/         # currency-bob.pipe.ts (pendiente)
│   └── layout/        # main-layout/ (shell autenticado)
├── features/          # Modulos lazy: auth, dashboard, ventas, viajes, flota, choferes, rutas, horarios, tarifas, clientes, reportes
├── graphql/           # Queries centralizadas (pendientes por modulo)
├── app.routes.ts      # Rutas principales con lazy loading
├── app.config.ts      # Providers: Apollo, HttpClient, Animations, Router
└── app.ts             # Componente raiz (standalone)
```

### 1.4 Tema y estilos

**Archivos creados en `src/styles/`:**

- `_variables.scss` — 80+ variables CSS extraidas del prototipo (colores brand, accent, ink, semaforo, espaciados, radios, sombras, tipografia)
- `_theme.scss` — Tema Angular Material M2 (light + dark) con paletas personalizadas
- `_dark-theme.scss` — Overrides para `[data-theme="dark"]`
- `styles.scss` — Entry point con Google Fonts (Plus Jakarta Sans + JetBrains Mono), reset CSS, scrollbars

**Colores del prototipo implementados:**
- Primario: `#0B2942` (brand-800)
- Acento: `#E89220` (accent-500)
- Fondo: `#F7F8FA` (claro) / `#0B1120` (oscuro)
- Texto, bordes, shadows, radios, espaciados: fiel al prototipo

### 1.5 ThemeService
- Persiste preferencia en `localStorage` (key: `bustrack-theme`)
- Detecta `prefers-color-scheme` del SO como fallback
- Aplica `data-theme="dark"` en `<html>` al hacer toggle

### 1.6 Autenticacion y Apollo

**AuthService:**
- Signal `usuario` con tipo `Usuario | null`
- Metodo `login()` que llama mutation GraphQL
- `handleLoginSuccess()` guarda token en sessionStorage y redirige por rol
- `logout()` limpia token y redirige a `/login`

**GraphQLService:**
- Wrapper para get/set token en `sessionStorage`

**AuthGuard:** Protege rutas `/app/*`, redirige a `/login` si no hay token

**RoleGuard:** Factory `RoleGuard.forRoles(['ADMIN'])` que protege por rol

**Apollo Client (en app.config.ts):**
- URI: `${environment.apiUrl}/graphql`
- `withCredentials: true`
- ErrorLink: detecta 401 y redirige a `/login`
- AuthLink: agrega header `Authorization: Bearer <token>`

### 1.7 Rutas configuradas

| Ruta | Modulo | Lazy | Roles |
|---|---|---|---|
| `/` | redirect a `/login` | — | publico |
| `/login` | LoginComponent | eager | publico |
| `/app` | MainLayoutComponent | eager | AuthGuard |
| `/app/dashboard` | Dashboard | lazy | ADMIN |
| `/app/ventas` | Ventas | lazy | ADMIN, VENDEDOR |
| `/app/viajes` | Viajes | lazy | ADMIN |
| `/app/flota` | Flota | lazy | ADMIN |
| `/app/choferes` | Choferes | lazy | ADMIN |
| `/app/rutas` | Rutas | lazy | ADMIN |
| `/app/horarios` | Horarios | lazy | ADMIN |
| `/app/tarifas` | Tarifas | lazy | ADMIN |
| `/app/clientes` | Clientes | lazy | ADMIN, VENDEDOR |
| `/app/reportes` | Reportes | lazy | ADMIN |

Cada feature tiene su propio archivo `routes.ts` + componente placeholder que carga lazy.

### 1.8 Environments

- `environment.ts` — `apiUrl: 'http://localhost:3000'`
- `environment.prod.ts` — `apiUrl: 'https://ms-core.tu-dominio.com'`

### 1.9 Build

- Compilacion exitosa (solo warning de budget por Angular Material + Apollo)
- Budget ajustado a 800kB warning / 1.2MB error

---

## Paso 2: Auth — Login, Guards, Servicios

**Fecha:** 22 Mayo 2026

### 2.1 LoginComponent (`features/auth/login/`)

Componente standalone con 3 archivos: `.ts`, `.html`, `.scss`

**Template:**
- Layout split: formulario (izquierda) + panel visual (derecha)
- Logo BusTrack BO con SVG inline (bus)
- Formulario reactivo con Angular Material
- Campos: email, password con validacion (required, email, minLength)
- Toggle visibilidad de password (mat-icon-button)
- Checkbox "Mantener sesion iniciada"
- Boton submit con spinner durante carga
- Footer con copyright, terminos, privacidad, soporte
- Panel derecho: gradiente brand, lineas topograficas, testimonio, stats

**Logica:**
- `FormBuilder` con ReactiveFormsModule
- Signals: `loading`, `hidePassword`, `errorMessage`
- `onSubmit()`: llama `AuthService.login()` → suscripcion con `next`/`error`
- `next`: extrae `data.login.token` y `data.login.usuario`, llama `handleLoginSuccess()`
- `error`: extrae mensaje de GraphQL errors, muestra snackbar
- Redireccion automatica si ya hay token (constructor)
- Pre-computa `topoPaths` SVG en el componente para evitar `Math` en template

**Estilos:**
- Fiel al prototipo (`screen-login.jsx` + `styles.css`)
- CSS Grid split layout, responsive (mobile: oculta panel derecho)
- Variables CSS del tema (cero colores hardcodeados)

### 2.2 AuthService (`core/auth/auth.service.ts`)

- Signal `usuario` con tipo `Usuario` (`id`, `nombre`, `email`, `rol`)
- `login(email, password)`: mutation GraphQL `Login`
- `handleLoginSuccess(token, usuario)`: guarda token en sessionStorage, guarda usuario, redirige (`ADMIN` → `/app/dashboard`, `VENDEDOR` → `/app/ventas`)
- `logout()`: limpia token y usuario, redirige a `/login`
- `getToken()`: delega a `GraphQLService`

### 2.3 GraphQLService (`core/graphql/graphql.service.ts`)

- Wrapper para get/set token en `sessionStorage` (`bustrack-token`)
- El token se persiste solo en `sessionStorage` (se pierde al cerrar pestana)
- Usuario se persiste en `sessionStorage` (`bustrack-user`)

### 2.4 Guards

**AuthGuard:** `canActivate` verifica `auth.getToken()`, redirige a `/login` si es null

**RoleGuard:** Factory estatico `RoleGuard.forRoles(['ADMIN'])` que verifica `usuario.rol` contra la lista permitida

### 2.5 Apollo Client (app.config.ts)

- `ErrorLink` de `@apollo/client/link/error` (API v7: usa `CombinedGraphQLErrors.is(error)`)
- `AuthLink` con `setContext` que agrega `Authorization: Bearer <token>`
- `httpLink` con `withCredentials: true`
- Cache: `InMemoryCache` con defaults `network-only`

### 2.6 Ajustes de build

- Google Fonts movidos de `@import` en SCSS a `<link>` en `index.html` (evita error de inlining en prod)
- Budget de estilos por componente aumentado a 20kB/40kB

### 2.7 Credenciales de prueba (configuradas en el componente)

- **ADMIN:** `admin@bustrack.com` (password por ingresar: `admin123`)
- **VENDEDOR:** se debe crear desde el Playground de MS-Core con la mutation `crearUsuario`

---

## Paso 3: Layout — MainLayout, Sidebar, Header

**Fecha:** 22 Mayo 2026

### 3.1 SidebarComponent (`shared/components/sidebar/`)

**Archivos:** `sidebar.component.ts`, `.html`, `.scss`

- Logo BusTrack BO con SVG inline (mismo del login)
- Campo de busqueda visual con shortcut `Ctrl+K`
- Nav items agrupados en **OPERACION** (Dashboard, Ventas, Viajes, Flota, Choferes) y **CATALOGO** (Rutas, Tarifas, Reportes)
- Items filtrados por rol: VENDEDOR solo ve "Venta de Boletos"
- Indicador de item activo: barra naranja izquierda + fondo highlight
- Iconos de Angular Material (`mat-icon`)
- Tarjeta "Plan Empresa" al pie con gradiente acento
- Soporte para modo colapsado: solo iconos (64px de ancho)
- Inputs: `activeRoute`, `userRole`, `collapsed` / Output: `navigate`

### 3.2 HeaderComponent (`shared/components/header/`)

**Archivos:** `header.component.ts`, `.html`, `.scss`

- Breadcrumbs dinamicos con separador `>`
- Titulo + subtitulo
- Boton toggle de tema (sol/luna) con tooltip
- Campana de notificaciones con dot rojo
- Avatar del usuario (iniciales sobre fondo primary)
- Nombre + rol del usuario
- Boton de logout
- Responsive: oculta subtitulo e info de usuario en mobile, muestra hamburguesa
- Inputs: `title`, `subtitle`, `breadcrumbs`, `userName`, `userRole`, `userInitials`, `isDark`, `collapsed`
- Outputs: `toggleTheme`, `toggleSidebar`, `logout`, `navigate`

### 3.3 MainLayoutComponent (`shared/layout/main-layout/`)

**Archivos:** `main-layout.component.ts`, `.html`, `.scss`

- Grid CSS: `sidebar(248px) + header(64px) | main`
- Compone Sidebar + Header + RouterOutlet
- Conecta con `AuthService` para datos del usuario y logout
- Conecta con `ThemeService` para toggle claro/oscuro
- Detecta ruta activa del `Router.url` y mapea a titulos/breadcrumbs
- 10 pantallas mapeadas con metadata (dashboard, ventas, viajes, flota, choferes, rutas, horarios, tarifas, clientes, reportes)

### 3.4 Guards refactorizados

- `AuthGuard` y `RoleGuard` convertidos a **guards funcionales** (`CanActivateFn`)
- `RoleGuard` es ahora `roleGuard(roles: string[])` que retorna un `CanActivateFn`
- Eliminado el patron de clase factory que causaba error `NG0201`

### 3.5 Fixes adicionales

- Agregada fuente **Material Icons** al `index.html` (el `mat-icon` no renderizaba)
- Instalado `zone.js` y agregado como polyfill en `angular.json`
- Eliminados todos los colores hardcodeados: agregados `--brand-800-rgb`, `--accent-500-rgb`, `--ok-600-rgb`, `--white-rgb` para usar en `rgba()`

---

## Paso 4: Shared Components

**Fecha:** 22 Mayo 2026

### 4.1 StatCardComponent (`shared/components/stat-card/`)

Componente standalone inline (template + estilos en el `.ts`):
- Icono en caja redondeada (brand-050 fondo)
- Badge de tendencia con flecha (verde arriba, rojo abajo)
- Valor grande en mono font, label, unit opcional
- Texto de comparacion (ej. "vs ayer")
- Inputs: `label`, `value`, `unit`, `icon`, `trend`, `trendLabel`
- Cero colores hardcodeados, todo via variables CSS

### 4.2 DataTableComponent (`shared/components/data-table/`)

Tabla generica con Angular Material Table:
- `MatTable` + `MatSort` + `MatPaginator`
- Columnas configurables via input `columns: DataTableColumn<T>[]`
- Templates por tipo: `default`, `mono`, `money`, `badge`
- Busqueda inline con debounce (output `search`)
- Slots para filtros (`[filters]`) y acciones (`[actions]`)
- Estado vacio con icono
- Paginacion opcional (`paginated` input)
- Estilos de tabla fieles al prototipo (th uppercase, hover rows)

### 4.3 StatusBadgeComponent (`shared/components/status-badge/`)

- Badge con dot de color + texto
- 5 variantes: `ok` (verde), `warn` (ambar), `err` (rojo), `info` (azul), `neutral` (gris)
- Inputs: `label`, `variant: BadgeVariant`
- Estilos: pill shape, dot coloreado, fondos semaforo

### 4.4 ConfirmDialogComponent (`shared/components/confirm-dialog/`)

Modal de confirmacion basado en `MatDialog`:
- Titulo, mensaje configurable
- Botones Confirmar / Cancelar
- Color del boton configurable (`primary` o `warn`)
- Retorna `true`/`false` via `MatDialogRef`
- Inputs: `title`, `message`, `confirmLabel`, `cancelLabel`, `confirmColor`

### 4.5 CurrencyBobPipe (`shared/pipes/`)

Pipe standalone para formatear moneda boliviana:
- `value | currencyBob` → `Bs 1,500`
- Usa `toLocaleString('es-BO')`
- Maneja valores nulos (retorna `Bs 0`)

### 4.6 Fix: Font inlining

- Agregado `"optimization": { "fonts": false }` en `angular.json` para evitar que el build de produccion intente descargar Google Fonts sin internet

---

## Paso 5: Dashboard

**Fecha:** 22 Mayo 2026 — **Estado: pendiente revision**

### 5.1 DashboardComponent (`features/dashboard/`)

- **Selector de periodo:** dropdown (Hoy / Ultimos 7 dias / Este mes) vía btn-outline + mat-menu
- **Rangos de fecha:** Hoy=today, Semana=lunes→today, Mes=1ro→ultimo dia del mes
- **`effect()` reactivo:** al cambiar el periodo recalcula fechas y re-ejecuta queries
- **KPIs:** 4 `app-stat-card` desde `resumenVentas(fechaInicio, fechaFin)` → campos: totalBoletos, totalIngresos, viajesHoy, ocupacionPromedio
- **Ocupacion por ruta:** top 5 calculado desde los viajes
- **Tabla viajes del dia:** siempre consulta HOY, usa `app-status-badge` para estado
- **Cero datos mock**
- **Sin botones no funcionales**

### 5.2 Queries contra MS-Core

Query `viajes` corregida según schema real:
- `horario { horaSalida, ruta { origen { nombre }, destino { nombre } } }`
- `bus { placa }`
- `choferTitular { nombre }`
- `totalVendidos`, `asientos` (antes `asientosVendidos`/`asientosTotales`)
- Campo `eta` y `codigo` no existen en MS-Core → eliminados

### 5.3 Pendiente

- Grafica ECharts no implementada (query `ingresosPorDia` no documentada en el plan)
- Boton Exportar sin funcionalidad
- Verificar que query `resumenVentas` retorne datos reales para periodos Semana y Mes

---

## Paso 6: Ventas + SeatMap

**Fecha:** 22 Mayo 2026

### VentasComponent
- Busqueda: Origen (select, solo ADMIN) + Destino + Fecha + Pasajeros
- Lista de viajes disponibles con placa, chofer, asientos libres, precio (desde `tarifaActual`)
- SeatMap: bus 2 pisos horizontal, asientos 3 columnas (2 juntos + 1 solo), colores LIBRE/OCUPADO/SELECCIONADO
- CI con debounce 500ms: autocomplete `clientePorCi`, campos readonly si encontrado
- Formulario pasajero: CI primero, nombre/apellidos, celular, correo, metodo de pago
- `venderBoleto` mutation con `crearCliente` si es nuevo
- Modal de exito con resumen + descarga PDF (via HttpClient con JWT)
- Precio desde `tarifaActual.precioBase`

### Queries ventas
- `rutas(activa:true)`, `viajesDisponibles(rutaId, fecha)`, `viaje(id)`, `clientePorCi(ci)`
- `tarifaActual(rutaId, fecha)`, `crearCliente`, `venderBoleto`

---

## Paso 7: Clientes

**Fecha:** 22 Mayo 2026

- Busqueda por CI/nombre con debounce 400ms
- Tabla: CI, nombre, telefono, email
- Panel lateral: contacto (telefono, email) + historial de boletos (`boletos(clienteId)`)
- Sidebar: item "Clientes" en CATALOGO

---

## Paso 8: Flota y Choferes

**Fecha:** 22 Mayo 2026

### FlotaComponent
- Stats cards filtrables (total, operativo, mantenimiento, garaje)
- Tabla: placa, marca/modelo, ano, capacidad, carriles, estado
- Modal crear bus: placa, marca, modelo, ano, capacidad, carriles + upload foto
- Foto: `generarUrlSubida(tipo: FOTO_BUS, id)` → HTTP PUT a S3

### ChoferesComponent
- Stats cards (total, disponible, en viaje, licencias por vencer)
- Tabla: nombre, CI, licencia, categoria, vencimiento (alerta rojo <30d), estado
- Modal crear chofer: nombre, CI, celular, licencia, toggle "Crear cuenta" (emailUsuario, passwordUsuario) + upload foto
- Foto: `generarUrlSubida(tipo: FOTO_CHOFER, id)` → HTTP PUT a S3

### Mutations
- `generarUrlSubida(tipo: TipoArchivo!, entidadId: ID!, extension: String)` → `{ uploadUrl, s3Key }`
- Extension extraida del archivo: `file.name.split('.').pop()`

---

## Paso 9: Rutas, Horarios, Tarifas

**Fecha:** 23 Mayo 2026

### Rutas (`/app/rutas`)
- Lista con origen → destino (link a detalle), distancia, duracion, estado
- Acciones: editar (modal), activar/desactivar
- Modal crear/editar: terminal origen, terminal destino (excluye origen), distancia, duracion

### Detalle de ruta (`/app/rutas/:id`)
- Tabs: **Horarios** | **Tarifas**
- Horarios: tabla con hora, dias (badges), activo. Form inline: time picker + checkboxes Lun-Dom
- Tarifas: tabla con tipo, precio, vigencia. Form inline: tipo dia (LUNES_JUEVES, VIERNES_DOMINGO, FERIADO, TEMPORADA_ALTA), precio, fecha

### Sidebar actualizado
- "Horarios" y "Tarifas" eliminados del sidebar (ahora son tabs dentro de Rutas)

### Queries
- `rutas`, `ruta(id)`, `horarios(rutaId)`, `tarifas(rutaId)`, `terminales`
- `crearRuta`, `actualizarRuta`, `crearHorario`, `crearTarifa`

---

**Proximo paso:** Paso 10 — Viajes (gestion: lista, crear, detalle, cancelar, finalizar)
