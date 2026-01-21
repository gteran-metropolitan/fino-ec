# Módulo Delivery Flow - Documentación Educativa

## 📚 Índice

1. [Introducción](#introducción)
2. [Conceptos Clave del Negocio](#conceptos-clave-del-negocio)
3. [Estructura del Módulo](#estructura-del-módulo)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Archivos Principales](#archivos-principales)
6. [Guía de Estudio](#guía-de-estudio)
7. [Glosario](#glosario)

---

## Introducción

El módulo **Delivery Flow** (Entrega y Postcosecha) gestiona el proceso completo desde que un proveedor entrega flores hasta que se clasifican para exportación o mercado local.

### Objetivo del Módulo
- Registrar entregas de flores de proveedores
- Clasificar tallos por tamaño para exportación
- Registrar rechazos (flor local) por categorías
- Calcular precios y totales
- Hacer seguimiento del progreso de clasificación

---

## Conceptos Clave del Negocio

### 1. Entrega (ProductEntryGroup)
Una **entrega** es cuando un proveedor trae flores a la empresa. Una entrega puede contener múltiples variedades de flores.

**Ejemplo:**
```
Entrega #123
├─ Proveedor: Juan Pérez (código: JP001)
├─ Fecha: 21 de enero 2024, 08:30 AM
└─ Variedades:
   ├─ Rosa Freedom (500 tallos)
   ├─ Rosa Vendela (300 tallos)
   └─ Clavel Blanco (200 tallos)
```

### 2. Entrada de Producto (ProductEntry)
Cada **variedad** dentro de una entrega es una entrada de producto.

**Datos de una entrada:**
- Especie (ej: Rosa, Clavel, Gypsophila)
- Variedad (ej: Freedom, Vendela, Barbara)
- Cantidad recibida (ej: 500 tallos)
- Clasificación (se hace después de recibir)

### 3. Clasificación de Tallos

Los tallos se clasifican en DOS categorías principales:

#### A) Exportable (Tallos que se pueden vender al exterior)
Se clasifican por **longitud del tallo** en centímetros:
- 40cm, 50cm, 60cm, 70cm, 80cm, 90cm, 100cm, 110cm, 120cm
- **Sobrante**: tallos que no cumplen medidas estándar

**Cada tamaño tiene:**
- Cantidad de tallos
- Precio por tallo (en dólares)
- Subtotal calculado: cantidad × precio

**Ejemplo:**
```
Rosa Freedom - Exportable:
├─ 60cm: 100 tallos × $0.75 = $75.00
├─ 70cm: 150 tallos × $0.90 = $135.00
├─ 80cm: 200 tallos × $1.10 = $220.00
└─ Total: 450 tallos = $430.00
```

#### B) Flor Local (Tallos que NO se pueden exportar)
Tallos rechazados que se venden en el mercado local.

Se clasifican por **categoría de rechazo**:
- Defectos físicos
- Tamaño pequeño
- Daño mecánico
- Plagas o enfermedades
- Etc.

**Ejemplo:**
```
Rosa Freedom - Flor Local:
├─ Tamaño pequeño: 30 tallos
├─ Defectos en botón: 20 tallos
└─ Total: 50 tallos
```

### 4. Progreso de Clasificación

El sistema calcula automáticamente:

```javascript
Total Recibido = 500 tallos
Total Exportable = 450 tallos
Total Local = 50 tallos
Total Clasificado = 450 + 50 = 500 tallos
Restante = 500 - 500 = 0 ✓ (¡Completo!)
Progreso = (500 / 500) × 100 = 100%
```

**Estados posibles:**
- ✅ **Completo** (100%): Todo clasificado correctamente
- ⚠️ **En proceso** (1-99%): Faltan tallos por clasificar
- 📋 **Pendiente** (0%): No se ha empezado a clasificar
- ❌ **Excedido** (>100%): ERROR - se clasificó más de lo recibido

---

## Estructura del Módulo

```
resources/js/pages/delivery-flow/
├── 📄 _types.ts              # Tipos TypeScript (interfaces)
├── 📄 _utils.ts              # Funciones helper y constantes
├── 📄 _useCreateDelivery.ts  # Hook para crear entregas
├── 📄 _useDeliveryEntries.ts # Hook para editar entregas
│
├── 📄 index.tsx              # Lista de entregas del día
├── 📄 create.tsx             # Formulario de nueva entrega
├── 📄 show.tsx               # Ver/editar entrega existente
│
├── 📁 components/            # Componentes reutilizables
│   ├── CreateEntryCard.tsx   # Tarjeta de variedad (crear)
│   ├── EntryCard.tsx         # Tarjeta de variedad (editar)
│   ├── ProgressSummary.tsx   # Resumen de totales
│   ├── SupplierSearch.tsx    # Búsqueda de proveedor
│   ├── VarietySelector.tsx   # Selector de variedades
│   ├── DeliveryHeader.tsx    # Encabezado de entrega
│   └── index.ts              # Exportaciones
│
└── 📄 README.md              # Este archivo
```

### Convención de Nombres

**Archivos con prefijo `_`** (guion bajo):
- Son archivos **privados/internos** del módulo
- No se importan desde fuera del módulo
- Contienen lógica compartida entre las páginas del módulo

**Ejemplos:**
- `_types.ts` → Tipos compartidos
- `_utils.ts` → Funciones helper
- `_useCreateDelivery.ts` → Hook personalizado

---

## Flujo de Trabajo

### 1️⃣ Ver Lista de Entregas (`index.tsx`)

```
Usuario accede a /delivery-flow
↓
Se cargan entregas del día
↓
Se muestran con su progreso de clasificación
```

**Datos mostrados:**
- Fecha y hora de entrega
- Proveedor
- Número de variedades
- Total de tallos
- Progreso (%)
- Estado (Pendiente/En Proceso/Completo)

### 2️⃣ Crear Nueva Entrega (`create.tsx`)

```
Usuario hace clic en "Nueva Entrega"
↓
PASO 1: Buscar proveedor por código
↓
PASO 2: Seleccionar/agregar variedades
↓
PASO 3: Para cada variedad:
   ├─ Ingresar cantidad recibida
   ├─ Clasificar exportables (opcional)
   └─ Clasificar flor local (opcional)
↓
Guardar entrega completa
```

**Hook usado:** `_useCreateDelivery.ts`

### 3️⃣ Ver/Editar Entrega (`show.tsx`)

```
Usuario hace clic en una entrega
↓
Se carga la entrega con todas sus variedades
↓
Se puede:
   ├─ Agregar nuevas variedades
   ├─ Editar clasificación existente
   ├─ Ajustar cantidades
   └─ Eliminar variedades
↓
Guardar cambios
```

**Hook usado:** `_useDeliveryEntries.ts`

---

## Archivos Principales

### 📄 `_types.ts` - Definiciones de Tipos

Contiene todas las interfaces TypeScript del módulo.

**Tipos principales:**
- `Supplier` - Proveedor
- `Species` - Especie de flor
- `Variety` - Variedad de flor
- `Category` - Categoría de rechazo
- `ProductEntry` - Entrada de producto
- `ProductEntryGroup` - Grupo de entrega
- `EditableEntry` - Entrada en edición
- `EntryTotals` - Totales de una entrada
- `GlobalTotals` - Totales globales

**Ejemplo de uso:**
```typescript
import type { ProductEntry, GlobalTotals } from './_types';

const entry: ProductEntry = {
  id: 1,
  species: { id: 1, name: 'Rosa' },
  variety: { id: 5, name: 'Freedom' },
  quantity: 500,
  stem_classification: null
};
```

### 📄 `_utils.ts` - Funciones Utilidades

Funciones helper reutilizables en todo el módulo.

**Constantes importantes:**
- `STEM_SIZES` - Array con todos los tamaños de tallo disponibles

**Funciones principales:**
- `createEmptyExportable()` - Crea objeto vacío para exportables
- `createEmptyPrices()` - Crea objeto vacío para precios
- `getEntryTotals()` - Calcula totales de una entrada
- `calculateEntryTotalPrice()` - Calcula precio total
- `isValidNumber()` - Valida número entero
- `isValidPrice()` - Valida precio decimal

**Ejemplo de uso:**
```typescript
import { STEM_SIZES, getEntryTotals } from './_utils';

// Calcular totales de una entrada
const totals = getEntryTotals(entry, categories);
console.log(totals.remaining); // Tallos sin clasificar

// Iterar tamaños de tallo
STEM_SIZES.forEach(size => {
  console.log(`${size.label}${size.unit}`); // "40cm", "50cm", etc.
});
```

### 📄 `_useCreateDelivery.ts` - Hook de Creación

Hook personalizado para manejar todo el estado y lógica de crear una nueva entrega.

**Responsabilidades:**
- Búsqueda de proveedor
- Gestión de variedades
- Cálculo de totales en tiempo real
- Validación de datos
- Envío al backend

**Ejemplo de uso:**
```typescript
import { useCreateDelivery } from './_useCreateDelivery';

function CreatePage() {
  const delivery = useCreateDelivery({ categories, existingSpecies, existingVarieties });
  
  return (
    <form onSubmit={delivery.save}>
      {/* Formulario */}
    </form>
  );
}
```

### 📄 `index.tsx` - Lista de Entregas

Página principal que muestra todas las entregas del día.

**Funciones principales:**
- `calcularPorcentajeDeProgreso()` - Calcula % de clasificación
- `obtenerBadgeDeEstado()` - Retorna badge según estado
- `manejarEliminacionDeEntrega()` - Elimina una entrega

**Datos que recibe del backend:**
```php
[
  'groups' => [
    'data' => [...],
    'current_page' => 1,
    'last_page' => 3,
    // ... más datos de paginación
  ]
]
```

### 🎨 Componentes

#### `CreateEntryCard.tsx`
Tarjeta para crear/clasificar una variedad.

**Secciones:**
1. **Encabezado** - Especie, variedad, cantidad, botón eliminar
2. **Resumen** - Totales en tiempo real (exportable, local, restante)
3. **Exportable** - Grid de tamaños con cantidad y precio
4. **Flor Local** - Categorías de rechazo

#### `ProgressSummary.tsx`
Dashboard con 6 métricas clave:
1. Total Exportable
2. Total Flor Local
3. Total Clasificado
4. Restante
5. Progreso (%)
6. Total Precio ($)

---

## Guía de Estudio

### Para Principiantes

**Orden recomendado de estudio:**

1. **Empieza por los tipos** (`_types.ts`)
   - Lee cada interface con sus comentarios
   - Entiende qué representa cada tipo
   - Dibuja un diagrama de relaciones

2. **Luego las utilidades** (`_utils.ts`)
   - Estudia las funciones de cálculo
   - Prueba ejecutarlas con datos de ejemplo
   - Entiende las validaciones

3. **Después la lista** (`index.tsx`)
   - Es la página más simple
   - Solo muestra datos, no los modifica
   - Fíjate cómo calcula el progreso

4. **Luego los componentes simples**
   - `ProgressSummary.tsx` - Solo muestra totales
   - `CreateEntryCard.tsx` - Componente más complejo

5. **Finalmente los hooks**
   - `_useCreateDelivery.ts` - Lógica de creación
   - `_useDeliveryEntries.ts` - Lógica de edición

### Ejercicios Prácticos

#### Ejercicio 1: Cálculo Manual de Totales
Dada esta entrada:
```
Rosa Freedom - 500 tallos recibidos
Exportable:
  - 60cm: 100 tallos × $0.75
  - 70cm: 150 tallos × $0.90
  - 80cm: 200 tallos × $1.10
Flor Local:
  - Defectos: 50 tallos
```

Calcula:
1. Total exportable = ?
2. Total local = ?
3. Total clasificado = ?
4. Restante = ?
5. Progreso = ?
6. Precio total = ?

<details>
<summary>Ver respuestas</summary>

1. Total exportable = 100 + 150 + 200 = 450 tallos
2. Total local = 50 tallos
3. Total clasificado = 450 + 50 = 500 tallos
4. Restante = 500 - 500 = 0 tallos ✓
5. Progreso = (500 / 500) × 100 = 100%
6. Precio total = (100 × $0.75) + (150 × $0.90) + (200 × $1.10) = $75 + $135 + $220 = $430
</details>

#### Ejercicio 2: Identificar Errores
¿Qué está mal en esta clasificación?
```
Rosa Freedom - 300 tallos recibidos
Exportable: 200 tallos
Flor Local: 150 tallos
```

<details>
<summary>Ver respuesta</summary>

Total clasificado = 200 + 150 = 350 tallos
Recibido = 300 tallos

ERROR: Se clasificaron 350 tallos pero solo se recibieron 300.
Hay un exceso de 50 tallos. El sistema mostraría "Excedido (116%)" en rojo.
</details>

#### Ejercicio 3: Lectura de Código
En `_utils.ts`, encuentra la función `getEntryTotals()` y responde:
1. ¿Qué parámetros recibe?
2. ¿Qué retorna?
3. ¿Cómo calcula `totalLocal`?
4. ¿Por qué itera sobre `categories` y luego sobre `active_subcategories`?

### Conceptos de React Usados

1. **Hooks personalizados** (`use*`)
   - Encapsulan lógica reutilizable
   - Manejan estado complejo
   - Ejemplo: `useCreateDelivery`

2. **Props** (propiedades)
   - Datos que un componente padre pasa al hijo
   - Son inmutables desde el componente hijo
   - Ejemplo: `<CreateEntryCard entry={...} />`

3. **Callbacks**
   - Funciones que se pasan como props
   - Permiten comunicación hijo → padre
   - Ejemplo: `onQuantityChange={(value) => ...}`

4. **Estado derivado**
   - Cálculos basados en el estado principal
   - No se guardan en estado, se calculan
   - Ejemplo: `totals = getEntryTotals(entry)`

### Conceptos de TypeScript Usados

1. **Interfaces**
   - Definen la forma de los objetos
   - Ayudan a evitar errores
   - Ejemplo: `interface ProductEntry { ... }`

2. **Tipos opcionales** (`?`)
   - Campos que pueden existir o no
   - Ejemplo: `code?: string`

3. **Uniones** (`|`)
   - Un valor puede ser de varios tipos
   - Ejemplo: `id: number | string`

4. **Record<K, V>**
   - Objeto con keys dinámicas
   - Ejemplo: `Record<string, string>`

---

## Glosario

### Términos del Negocio

- **Tallo**: Una flor individual
- **Especie**: Tipo de flor (Rosa, Clavel, etc.)
- **Variedad**: Variante dentro de una especie (Freedom, Vendela, etc.)
- **Proveedor**: Persona/empresa que suministra flores
- **Exportable**: Tallos aptos para venta internacional
- **Flor Local**: Tallos para mercado nacional (rechazos)
- **Clasificación**: Proceso de separar tallos por calidad/tamaño
- **Postcosecha**: Procesamiento de flores después de corte
- **Entrega**: Lote de flores que llega de un proveedor
- **Sobrante**: Tallos que no cumplen medidas estándar

### Términos Técnicos

- **Hook**: Función de React que usa estado/efectos
- **Props**: Propiedades pasadas a un componente
- **Callback**: Función pasada como parámetro
- **Interface**: Definición de tipo en TypeScript
- **Estado**: Datos que pueden cambiar y causan re-render
- **Componente**: Pieza reutilizable de UI
- **Inertia**: Framework para comunicar Laravel con React
- **Validación**: Verificación de que datos sean correctos

### Convenciones de Código

- **snake_case**: Variables en PHP/database (`total_stems`)
- **camelCase**: Variables en JavaScript (`totalStems`)
- **PascalCase**: Componentes React (`CreateEntryCard`)
- **SCREAMING_CASE**: Constantes (`STEM_SIZES`)

---

## Soporte y Ayuda

Si tienes dudas sobre el código:

1. **Lee los comentarios** - Están para eso
2. **Busca en este README** - Puede tener la respuesta
3. **Revisa ejemplos** - Hay varios en la documentación
4. **Pregunta** - Es la mejor forma de aprender

---

## Notas Finales

Este módulo ha sido refactorizado con énfasis en:
- ✅ Código legible y auto-explicativo
- ✅ Comentarios educativos en español
- ✅ Nombres de variables descriptivos
- ✅ Estructura organizada y clara
- ✅ Documentación completa

**¡Disfruta estudiando y aprendiendo!** 🎓🌹
