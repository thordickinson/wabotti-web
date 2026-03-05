# Módulo 9 — Configurador de Sitios Web

## Objetivo del Módulo

Proporcionar a las empresas una interfaz para **llenar datos y configurar opciones** sobre una plantilla predefinida.
**NO es un "Web Builder"** (tipo Wix o Squarespace). El usuario **no puede** alterar el layout, mover bloques, cambiar márgenes ni diseñar la página.

Su función es alimentar el modelo de datos que el sistema de Rendering usará para inyectar contenido en un template rígido y optimizado.

---

## Filosofía del Diseño

1.  **Template-First:** Wabotti provee la estructura. El usuario provee el contenido.
2.  **Configuración, no Construcción:** Se activan/desactivan features, no se "crean bloques".
3.  **Data-Driven Visibility:** Si un elemento no tiene datos (ej: no hay testimonios), la sección desaparece automáticamente.
4.  **Consistencia:** Garantizamos que el sitio se vea bien restringiendo la libertad de diseño.

---

## Responsabilidades

- **Selección de Template:** Elegir una base visual (ej: "Salud", "Deportes", "Minimalista").
- **Llenado de Datos Estáticos:**
    - Títulos y subtítulos.
    - Imágenes de portada (Hero).
    - Textos de "Sobre Nosotros".
- **Configuración de Visibilidad (Toggles):**
    - `show_testimonials`: true/false
    - `show_faq`: true/false
    - `show_team`: true/false
- **Gestión de Branding Básico (CSS Variables):**
    - Color primario.
    - Color secundario.
    - Logo.

---

## Alcance Multi-tenant

- La configuración (`SiteConfig`) es única por `companyId`.
- El sistema de rendering selecciona el template asociado a la empresa e inyecta estos datos.

---

## Entidades Principales

### 1. Configuración de Sitio (SiteConfig)

Define qué template se usa y los parámetros globales.

**Atributos clave:**
- `companyId`
- `templateId` (ej: 'wabotti-health-v1')
- `primaryColor`
- `secondaryColor`
- `logoUrl`
- `faviconUrl`
- `domain`

---

### 2. Configuración de Secciones (SectionConfig)

Controla el estado de las secciones predefinidas por el template. **No se pueden crear secciones nuevas**, solo configurar las existentes en el modelo.

**Secciones Típicas del Modelo:**

*   **Hero:**
    *   `title`
    *   `subtitle`
    *   `backgroundImage`
    *   `ctaText`
*   **Servicios:**
    *   La lista de servicios viene del **Módulo 2**.
    *   Configuración: `serviceDisplayMode` (Grid/List).
*   **Testimonios:**
    *   Datos: Lista de reviews (manuales o importados).
    *   Toggle: Si la lista está vacía o el usuario lo desactiva, no se renderiza.
*   **FAQ:**
    *   Datos: Lista de preguntas/respuestas predefinidas.
    *   Toggle: `showFaq`.

---

## Integración con Otros Módulos

### Con Servicios & Recursos (Módulo 2)
- El configurador simplemente dice "Mostrar Servicios".
- El contenido real (nombre, precio, duración) **SIEMPRE** viene del Módulo 2.
- Si se actualiza un precio en el Módulo 2, se actualiza en la web automáticamente.

### Con Rendering (Rendering.md)
- Este módulo genera el JSON de configuración.
- El Renderer toma este JSON + Datos de Dominio (Servicios, CRM) y genera el HTML.
- **Lógica de Layout:** El template renderiza condicionalmente:
    ```html
    {% if siteConfig.showTestimonials and testimonials.length > 0 %}
      <section class="testimonials">...</section>
    {% endif %}
    ```

---

## Lo que el Usuario NO Puede Hacer

- ❌ Arrastrar y soltar elementos (Drag & Drop).
- ❌ Cambiar el tamaño de fuente o familia tipográfica manualmente (se define por theme).
- ❌ Agregar bloques de HTML arbitrario.
- ❌ Cambiar el orden de las secciones (salvo que el template tenga una opción específica predefinida).

---

## Flujos Principales

### Flujo 1 — Setup Inicial
1. Usuario elige template "Clínica Dental".
2. Sube su logo.
3. El sistema muestra una previsualización con los servicios que ya creó en el Módulo 2.

### Flujo 2 — Actualización de Contenido
1. Usuario quiere activar sección de testimonios.
2. Entra al configurador -> Sección Testimonios.
3. Agrega 3 testimonios.
4. Activa el switch "Mostrar en la web".
5. Publica.

---

## Resultado Esperado

Un panel de control aburrido pero efectivo, que impide que el usuario "rompa" el diseño, asegurando que todas las páginas de Wabotti se vean profesionales y optimizadas para conversión.
