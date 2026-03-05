# Internationalization (i18n) & Custom Terminology

This document defines the strategy for supporting multiple languages and client-specific terminology (e.g., "Pacientes" vs "Clientes") in the Wabotti platform.

---

## 1. Core Principles

- **Standard Translations**: Use standard i18n for base UI elements (e.g., "Save", "Cancel").
- **Custom Terminology**: Allow overriding key business concepts per company (e.g., "Professional" → "Barber").
- **Primary Language**: Spanish is the primary language for UI labels, but the system must be bilingual (ES/EN) ready.
- **Code Language**: All code (variables, comments, DB schema) remains in English.

---

## 2. Terminology System

Each company can define its own "Vocabulary" to match its business type (Medical, Beauty, Consulting, etc.).

### Standard Vocabulary Keys

| Key | Default (ES) | Example: Medical | Example: Beauty |
|:---|:---|:---|:---|
| `professional` | Profesional | Doctor/a | Barbero/a |
| `professionals` | Profesionales | Doctores | Barberos |
| `customer` | Cliente | Paciente | Cliente |
| `customers` | Clientes | Pacientes | Clientes |
| `appointment` | Cita | Consulta | Turno |
| `appointments` | Citas | Consultas | Turnos |
| `location` | Sede | Consultorio | Sucursal/Local |
| `resource` | Recurso | Sala/Equipo | Silla/Box |

---

## 3. Data Model

### Company Extension

We will store the terminology overrides in the `Company` model (via a JSON field or a related `Vocabulary` table).

```typescript
model Company {
  // ... existing fields
  language    String   @default("es")
  
  // Custom Terminology
  vocabulary  Json?    // e.g. { "professional": "Doctor", "customer": "Paciente" }
}
```

---

## 4. Implementation Strategy

### Standard i18n
We will use a library compatible with Next.js App Router (e.g., `next-intl`) to manage translation files.

```json
// messages/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "booking": {
    "success": "Tu ${appointment} con ${professional} ha sido agendada."
  }
}
```

### Context-Aware Translation Helper
We need a custom hook or utility that merges standard translations with company terminology.

**Logic:**
1. Get the standard translation for a key.
2. If the translation contains `${professional}`, `${customer}`, etc., replace them with the current company's vocabulary overrides.

**Example Usage (Pseudo-code):**
```typescript
const { t } = useWabottiTranslation();

// If company vocabulary is { "professional": "Barbero" }
// translate("Tu cita con ${professional} ha sido agendada")
// Result: "Tu cita con Barbero ha sido agendada"
```

---

## 5. Admin Interface

### Super Admin
- Interface to set the "Industry Template" for a company (e.g., "Wabotti.com template").
- Apply a preset of vocabulary terms on company creation.

### Client Admin
- Advanced settings to fine-tune their specific terminology.
- Capability to change "Sede" to "Local" if they prefer.

---

## 6. Business Rules

1. **Labels only**: Terminology changes **ONLY** affect UI text. They never change the underlying API endpoints, Prisma models, or code variables.
2. **Pluralization**: The system must handle plural forms separately (e.g., `professional` vs `professionals`).
3. **Gender**: In Spanish, gender must be considered (e.g., "el/la profesional"). We should support optional masculine/feminine variants in the vocabulary if needed.

---

## Related Documents

- [User, Company & Billing Architecture](./user-company-billing.md) - Company settings
- [Templating Engine Architecture](./templating-engine.md) - Injecting variables into public sites
