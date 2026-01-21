# 📦 Módulo Delivery Flow

Sistema de gestión de entregas de flores, clasificación y control de calidad.

---

## 📁 Estructura de Archivos

```
delivery-flow/
│
├── 📄 PÁGINAS (Rutas de Inertia - Archivos que renderizan vistas)
│   ├── index.tsx              → /delivery-flow         → Lista todas las entregas
│   ├── create.tsx             → /delivery-flow/create  → Formulario nueva entrega
│   ├── show.tsx               → /delivery-flow/{id}    → Ver y clasificar entrega
│   └── edit.tsx               → /delivery-flow/{id}/edit → Editar entrega
│
├── 🔧 LÓGICA INTERNA (Prefijo _ = privado/interno)
│   ├── _types.ts              → Interfaces y tipos TypeScript
│   ├── _utils.ts              → Funciones helper (cálculos, validaciones)
│   ├── _useCreateDelivery.ts  → Hook: lógica para CREAR entregas
│   └── _useDeliveryEntries.ts → Hook: lógica para CLASIFICAR entregas
│
├── 📖 README.md               → Esta documentación
│
└── 🧩 components/             → Componentes reutilizables
    │
    ├── index.ts               → Exportación centralizada (importar desde aquí)
    │
    ├── 📝 forms/              → Formularios de entrada de datos
    │   ├── index.ts
    │   ├── AddVarietyForm.tsx     → Agregar especie/variedad/cantidad
    │   ├── SupplierSearch.tsx     → Buscar proveedor por código
    │   └── VarietySelector.tsx    → Dropdown de variedades con autocomplete
    │
    ├── 🎴 cards/              → Tarjetas para mostrar entradas
    │   ├── index.ts
    │   ├── CreateEntryCard.tsx    → Card en formulario de creación
    │   └── EntryCard.tsx          → Card de entrada existente
    │
    ├── 📊 classification/     → Secciones de clasificación de tallos
    │   ├── index.ts
    │   ├── ExportableSection.tsx  → Tallos exportables (por tamaño cm)
    │   └── LocalFlowerSection.tsx → Flor local/rechazos (por categoría)
    │
    ├── 💬 dialogs/            → Modales y alertas
    │   ├── index.ts
    │   ├── CreateSupplierDialog.tsx   → Crear proveedor rápido
    │   └── ExistingDeliveryDialog.tsx → Alerta entrega existente
    │
    └── 🎨 layout/             → Componentes de estructura
        ├── index.ts
        ├── DeliveryHeader.tsx     → Encabezado con info del proveedor
        └── ProgressSummary.tsx    → Barra de progreso y totales
```

---

## 🔄 Flujo del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ENTREGA                              │
└─────────────────────────────────────────────────────────────────┘

  1️⃣ BUSCAR PROVEEDOR          2️⃣ REGISTRAR ENTREGA           3️⃣ CLASIFICAR
  ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │ SupplierSearch  │    →     │ AddVarietyForm  │    →     │ ExportableSection│
  │                 │          │ CreateEntryCard │          │ LocalFlowerSection│
  └─────────────────┘          └─────────────────┘          └─────────────────┘
         │                            │                            │
         ▼                            ▼                            ▼
  ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │ Si no existe:   │          │ Guardar en BD:  │          │ Guardar en BD:  │
  │ CreateSupplier  │          │ - ProductEntry  │          │ - Classification│
  │ Dialog          │          │ - EntryGroup    │          │ - Rejections    │
  └─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

## 📄 Descripción de Archivos

### Páginas (Rutas)

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `index.tsx` | `/delivery-flow` | Lista paginada de todas las entregas con totales |
| `create.tsx` | `/delivery-flow/create` | Formulario para nueva entrega |
| `show.tsx` | `/delivery-flow/{id}` | Ver entrega y clasificar tallos |
| `edit.tsx` | `/delivery-flow/{id}/edit` | Editar entrega existente |

### Hooks Internos

| Archivo | Propósito |
|---------|-----------|
| `_useCreateDelivery.ts` | Maneja toda la lógica de crear una entrega nueva: buscar proveedor, agregar variedades, validaciones, envío al servidor |
| `_useDeliveryEntries.ts` | Maneja la clasificación de entradas existentes: exportables por tamaño, rechazos, cálculos de totales |

### Tipos

| Archivo | Contenido |
|---------|-----------|
| `_types.ts` | Todas las interfaces TypeScript del módulo |

**Tipos principales:**
- `Supplier` - Datos del proveedor
- `ProductEntry` - Entrada de producto (variedad + cantidad)
- `ProductEntryGroup` - Grupo de entregas del día
- `Classification` - Clasificación de tallos (exportables por tamaño)
- `EditableEntry` - Estado editable de una entrada
- `ExportableData` - Cantidades por tamaño (cm_40, cm_50, etc.)
- `PricesData` - Precios por tamaño

### Utilidades

| Archivo | Funciones |
|---------|-----------|
| `_utils.ts` | Funciones helper reutilizables |

**Funciones principales:**
- `createEmptyExportable()` - Crea objeto vacío para exportables
- `createEmptyPrices()` - Crea objeto vacío para precios
- `cleanNumericValue()` - Limpia valores numéricos
- `isValidNumber()` - Valida si es número
- `isValidPrice()` - Valida precio (hasta 2 decimales)
- `getEntryTotals()` - Calcula totales de una entrada
- `calculateEntryTotalPrice()` - Calcula precio total
- `STEM_SIZES` - Configuración de tamaños de tallo

---

## 🧩 Componentes

### Formularios

| Componente | Uso |
|------------|-----|
| `SupplierSearch` | Campo de búsqueda de proveedor por código |
| `AddVarietyForm` | Formulario para agregar especie/variedad/cantidad |
| `VarietySelector` | Dropdown con autocomplete de variedades |

### Cards

| Componente | Uso |
|------------|-----|
| `CreateEntryCard` | Muestra una variedad agregada en el formulario de creación |
| `EntryCard` | Muestra una entrada existente con sus secciones de clasificación |

### Secciones de Clasificación

| Componente | Uso |
|------------|-----|
| `ExportableSection` | Inputs para clasificar tallos por tamaño (40cm, 50cm, etc.) con precios |
| `LocalFlowerSection` | Inputs para rechazos por categoría (plagas, daño mecánico, etc.) |

### Diálogos

| Componente | Uso |
|------------|-----|
| `CreateSupplierDialog` | Modal para crear proveedor rápido sin salir del flujo |
| `ExistingDeliveryDialog` | Alerta si ya existe entrega del día para ese proveedor |

### Otros

| Componente | Uso |
|------------|-----|
| `DeliveryHeader` | Muestra info del proveedor y fecha de entrega |
| `ProgressSummary` | Barra de progreso y totales (entregado/clasificado/pendiente) |

---

## 📊 Modelo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    RELACIONES DE BASE DE DATOS                   │
└─────────────────────────────────────────────────────────────────┘

  Supplier (Proveedor)
      │
      │ 1:N
      ▼
  ProductEntryGroup (Grupo de entrega - 1 por día por proveedor)
      │
      │ 1:N
      ▼
  ProductEntry (Entrada - 1 por variedad)
      │
      ├── species_id → Species (Especie: Rosa, Gypsophila...)
      ├── variety_id → Variety (Variedad: Freedom, Explorer...)
      │
      │ 1:1
      ▼
  StemClassification (Clasificación de tallos)
      │
      ├── cm_40, cm_50, ... cm_120, sobrante (cantidades)
      ├── price_40, price_50, ... (precios)
      │
      │ 1:N
      ▼
  ClassificationRejection (Rechazos/Flor Local)
      │
      ├── rejection_category_id → RejectionCategory (Plagas, Daño...)
      └── rejection_subcategory_id → RejectionSubcategory (Trips, Ácaros...)
```

---

## 🎯 Ejemplo de Uso

### Crear nueva entrega

```typescript
// En create.tsx
import { useCreateDelivery } from './_useCreateDelivery';

export default function Create({ categories, existingSpecies, existingVarieties }) {
    const {
        // Estado
        currentStep,
        selectedSupplier,
        entries,
        
        // Acciones
        searchSupplier,
        addEntry,
        removeEntry,
        save,
    } = useCreateDelivery({ categories, existingSpecies, existingVarieties });
    
    // Renderizar UI...
}
```

### Clasificar entradas existentes

```typescript
// En show.tsx
import { useDeliveryEntries } from './_useDeliveryEntries';

export default function Show({ group, categories }) {
    const {
        entries,
        globalTotals,
        updateEntry,
        save,
    } = useDeliveryEntries({ group, categories });
    
    // Renderizar UI...
}
```

---

## 🔗 Endpoints del Backend

| Método | Ruta | Controlador | Descripción |
|--------|------|-------------|-------------|
| GET | `/delivery-flow` | `index()` | Lista entregas |
| GET | `/delivery-flow/create` | `create()` | Form nueva entrega |
| POST | `/delivery-flow` | `store()` | Guardar entrega |
| GET | `/delivery-flow/{id}` | `show()` | Ver/Clasificar |
| PUT | `/delivery-flow/{id}` | `update()` | Actualizar clasificación |
| DELETE | `/delivery-flow/{id}` | `destroy()` | Eliminar entrega |
| POST | `/delivery-flow/search-supplier` | `searchSupplier()` | Buscar proveedor |
| POST | `/delivery-flow/quick-supplier` | `storeQuickSupplier()` | Crear proveedor rápido |

---

## 📝 Notas Importantes

1. **Prefijo `_`**: Los archivos con `_` son internos y NO deben importarse desde fuera de esta carpeta.

2. **Hooks**: Toda la lógica compleja está en hooks para mantener los componentes limpios.

3. **Tipos**: Siempre usar los tipos de `_types.ts` para consistencia.

4. **Componentes**: Importar desde `./components` (usa el index.ts).

5. **Validaciones**: Se hacen tanto en frontend (UX) como en backend (seguridad).

