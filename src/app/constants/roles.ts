// `tsconfig.app.json` tiene habilitado `erasableSyntaxOnly`, por lo que no se
// permiten `enum`. Usamos objetos `as const` (mismos valores en runtime).
export const Roles = {
  PLAYERO: "PLAYERO",
  CAJERO: "CAJERO",
  SUPERVISOR: "SUPERVISOR",
  SISTEMAS: "SISTEMAS",
} as const;

export type Rol = (typeof Roles)[keyof typeof Roles];

export const RolesNames = {
  PLAYERO: "PLAYERO",
  CAJERO: "CAJERO",
  SUPERVISOR: "SUPERVISOR",
  SISTEMAS: "SISTEMAS",
} as const;

export type RolName = (typeof RolesNames)[keyof typeof RolesNames];

export const RolesNamesPlural = {
  PLAYEROS: "PLAYEROS",
  CAJEROS: "CAJEROS",
  SUPERVISORES: "SUPERVISORES",
  SISTEMAS: "SISTEMAS",
} as const;

export const RolesNamesPluralLowerCase = {
  PLAYEROS: "playeros",
  CAJEROS: "cajeros",
  SUPERVISORES: "supervisores",
  SISTEMAS: "sistemas",
} as const;
