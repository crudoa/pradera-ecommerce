// Configuración de proveedores de pago para Perú
export const PAYMENT_PROVIDERS = {
  // Culqi - Líder en Perú
  culqi: {
    name: "Culqi",
    country: "PE",
    methods: ["card", "yape", "plin"],
    currencies: ["PEN"],
    fees: {
      card: 3.59, // % + 0.30 PEN
      yape: 2.99,
      plin: 2.99,
    },
    limits: {
      min: 100, // 1 PEN en céntimos
      max: 500000, // 5000 PEN en céntimos
    },
  },

  // Niubiz - Visa Perú
  niubiz: {
    name: "Niubiz",
    country: "PE",
    methods: ["card"],
    currencies: ["PEN", "USD"],
    fees: {
      card: 3.5, // % + comisión fija
    },
    limits: {
      min: 100,
      max: 1000000, // 10,000 PEN
    },
  },

  // PagoEfectivo
  pagoefectivo: {
    name: "PagoEfectivo",
    country: "PE",
    methods: ["cash", "bank"],
    currencies: ["PEN"],
    fees: {
      cash: 2.95,
      bank: 1.95,
    },
    limits: {
      min: 100,
      max: 300000, // 3,000 PEN
    },
  },

  // Billeteras digitales peruanas
  yape: {
    name: "Yape",
    country: "PE",
    methods: ["qr"],
    currencies: ["PEN"],
    fees: {
      qr: 0, // Gratis para usuarios
    },
    limits: {
      min: 100, // 1 PEN
      max: 50000, // 500 PEN por transacción
    },
  },

  plin: {
    name: "Plin",
    country: "PE",
    methods: ["qr"],
    currencies: ["PEN"],
    fees: {
      qr: 0,
    },
    limits: {
      min: 100,
      max: 50000,
    },
  },

  // Transferencia bancaria
  transfer: {
    name: "Transferencia Bancaria",
    country: "PE",
    methods: ["bank_transfer"],
    currencies: ["PEN"],
    fees: {
      bank_transfer: 0, // Sin comisión para el comercio
    },
    limits: {
      min: 1000, // 10 PEN mínimo
      max: 10000000, // 100,000 PEN
    },
  },
} as const

// Métodos de pago disponibles por región
export const PAYMENT_METHODS_BY_COUNTRY = {
  PE: {
    primary: ["culqi", "niubiz"],
    digital: ["yape", "plin"],
    traditional: ["transfer", "pagoefectivo"],
    international: ["stripe"],
  },
  GLOBAL: {
    primary: ["stripe"],
    digital: [],
    traditional: ["transfer"],
    international: ["stripe"],
  },
} as const

// Configuración de documentos por país
export const DOCUMENT_TYPES = {
  PE: [
    { code: "DNI", name: "DNI", length: 8, required: true },
    { code: "CE", name: "Carnet de Extranjería", length: 12, required: true },
    { code: "RUC", name: "RUC", length: 11, required: false },
  ],
} as const

// Empresas de envío peruanas
export const SHIPPING_COMPANIES = {
  olva: {
    name: "Olva Courier",
    logo: "/images/shipping/olva.png",
    description: "Entrega a Domicilio Lima 1-5 días y Provincias 1-7 Aprox",
    coverage: ["lima", "provincias"],
    pricing: {
      lima: 15,
      provincias: 25,
      express: 35,
    },
    trackingUrl: "https://www.olvacourier.com/tracking",
  },
  shalom: {
    name: "Shalom",
    logo: "/images/shipping/shalom.png",
    description: "Recojo en Agencia 1 a 4 días",
    coverage: ["lima", "provincias"],
    pricing: {
      lima: 12,
      provincias: 20,
    },
    trackingUrl: "http://agencias.shalom.com.pe",
  },
  cruz_del_sur: {
    name: "Cruz del Sur",
    logo: "/images/shipping/cruz-del-sur.png",
    description: "Pago de Envío en Destino PROVINCIAS Recojo en Agencia",
    coverage: ["provincias"],
    pricing: {
      provincias: 18,
    },
    trackingUrl: "https://www.cruzdelsur.com.pe/cargo",
  },
  marvisur: {
    name: "Marvisur",
    logo: "/images/shipping/marvisur.png",
    description: "Pago de Envío en Destino PROVINCIAS Recojo en Oficina Cobertura",
    coverage: ["provincias"],
    pricing: {
      provincias: 16,
    },
    trackingUrl: "https://www.expresomarvisur.com/sucursales",
  },
} as const

// Bancos peruanos para transferencias
export const PERUVIAN_BANKS = [
  { code: "BCP", name: "Banco de Crédito del Perú", cci: "002" },
  { code: "BBVA", name: "BBVA Continental", cci: "011" },
  { code: "SCOTIABANK", name: "Scotiabank Perú", cci: "009" },
  { code: "INTERBANK", name: "Interbank", cci: "003" },
  { code: "BIF", name: "Banco Interamericano de Finanzas", cci: "038" },
] as const
