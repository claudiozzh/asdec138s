/* ============================================================
   esquema.js — Contrato de datos compartido
   Sistema Padrón Nominal Ilo — v2/v3
   Se carga junto a common.js en cada módulo (<script src="esquema.js"></script>)
   ============================================================ */

/* ---------- 1. Constantes ---------- */

const MODULOS = {
  BAJAS_ALTAS: "BAJAS_ALTAS",
  REUBICADOS: "REUBICADOS",
  BANDEJA_RECIBIDOS: "BANDEJA_RECIBIDOS",
  LLAMADAS: "LLAMADAS",
  SISFOH: "SISFOH",
  VISITAS_DOMICILIARIAS: "VISITAS_DOMICILIARIAS",
  TRANSITO: "TRANSITO",
  RECIEN_NACIDOS: "RECIEN_NACIDOS",
  NO_ENCONTRADOS: "NO_ENCONTRADOS",
};

const CARPETAS_ONEDRIVE = {
  REPORTES_DIARIOS: "01_REPORTES_DIARIOS",
  BASE_MAESTRA: "02_BASE_MAESTRA",
  FICHAS_SEGUIMIENTO: "03_FICHAS_SEGUIMIENTO",
  TRANSITOS: "04_TRANSITOS",
  NINOS_BAJA_ALTA: "05_NINOS_BAJA_ALTA",
  REUBICADOS: "06_REUBICADOS",
  BANDEJA_RECIBIDOS: "07_BANDEJA_RECIBIDOS",
  REPORTES_GENERADOS: "08_REPORTES_GENERADOS",
  LLAMADAS: "09_LLAMADAS",
  SISFOH: "10_SISFOH",
  VISITAS_DOMICILIARIAS: "11_VISITAS_DOMICILIARIAS",
  HOMOLOGACION_IPF: "12_HOMOLOGACION_IPF",
  HOMOLOGACION_EESS: "13_HOMOLOGACION_EESS",
  ESTADISTICA_MENSUAL: "14_ESTADISTICA_MENSUAL",
  GESTIONES: "15_GESTIONES",
  RECIEN_NACIDOS: "16_RECIEN_NACIDOS",
  NO_ENCONTRADOS: "17_NO_ENCONTRADOS",
};

// Perfiles de quién registra. CLAUDIO queda con los datos vacíos a propósito —
// complétalo tú antes de usar esto en producción.
const REGISTRADORES = {
  CLAUDIO: { dni: "72389107", nombres: "CLAUDIO AARON", apellidos: "MAMANI PADILLA", celular: "981619032" },
  LUIS: { dni: "61084058", nombres: "LUIS EDUARDO JAVIER", apellidos: "FIGUEROA OCSA", celular: "951384264" },
};

/* ---------- 2. Identidad de quien registra (sisfoh, llamadas, visitas) ---------- */

function obtenerRegistradorActual() {
  const guardado = localStorage.getItem("REGISTRADOR_ACTUAL");
  return guardado ? JSON.parse(guardado) : null;
}

function definirRegistradorActual(clave) {
  const registrador = REGISTRADORES[clave];
  if (!registrador) return null;
  localStorage.setItem("REGISTRADOR_ACTUAL", JSON.stringify(registrador));
  return registrador;
}

/* ---------- 2b. Id único (respaldo si crypto.randomUUID no está disponible) ---------- */

// crypto.randomUUID() requiere "contexto seguro" — puede fallar si el archivo se abre
// con doble clic en vez de por un servidor local. Usar esto en vez de crypto.randomUUID()
// directo en cualquier módulo.
function idUnico() {
  return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ---------- 3. Ficha base del niño ---------- */

// Convierte un objeto con nombres de campo antiguos/variados (de cualquiera de los
// 6 módulos) al esquema estándar del contrato.
function normalizarNino(raw) {
  return {
    documento: String(raw.documento || raw.dni || raw.cui || raw.cnv || "").trim(),
    cnv: raw.cnv ? String(raw.cnv).trim() : "",
    codigoPadron: raw.codigoPadron || raw.codigoPadronAnterior || "",
    apellidoPaterno: raw.apellidoPaterno || "",
    apellidoMaterno: raw.apellidoMaterno || "",
    nombres: raw.nombres || "",
    fechaNacimiento: raw.fechaNacimiento || "",
    direccionActual: raw.direccionActual || raw.direccion || raw.direccionSisfoh || "",
    seguro: raw.seguro || raw.tipoSeguro || "",
    eess: raw.eess || "",
    jurisdiccion: raw.jurisdiccion || "",
  };
}

function nombreCompleto(obj, prefijo = "") {
  const apPat = obj[`${prefijo}apellidoPaterno`] || obj.apellidoPaterno || "";
  const apMat = obj[`${prefijo}apellidoMaterno`] || obj.apellidoMaterno || "";
  const nom = obj[`${prefijo}nombres`] || obj.nombres || "";
  const apellidos = [apPat, apMat].filter(Boolean).join(" ");
  return [apellidos, nom].filter(Boolean).join(", ");
}

/* ---------- 4. Persona vinculada (madre / padre / responsable) ---------- */

// alias permite mapear nombres de campo viejos, ej:
// normalizarPersona(raw, { documento: "dniMadre", nombres: "" }) para bajas-altas
function normalizarPersona(raw, alias = {}) {
  return {
    documento: raw[alias.documento] || raw.documentoMadre || raw.docMadre || raw.documento || "",
    apellidoPaterno: raw[alias.apellidoPaterno] || raw.apellidoPaterno || "",
    apellidoMaterno: raw[alias.apellidoMaterno] || raw.apellidoMaterno || "",
    nombres: raw[alias.nombres] || raw.nombres || "",
    celular: raw[alias.celular] || raw.celular || raw.celularMadre || "",
    celularesExtra: raw.celularesExtra || [],
  };
}

/* ---------- 5. Teléfonos ---------- */

// Agrega un número al array celularesExtra solo si no existe ya (ni como celular
// principal ni entre los extra). Devuelve la persona modificada.
function agregarTelefonoUnico(persona, numero, origen) {
  if (!numero) return persona;
  const num = String(numero).trim();
  if (!num) return persona;
  const yaExiste = persona.celular === num || (persona.celularesExtra || []).some(c => c.numero === num);
  if (!yaExiste) {
    persona.celularesExtra = [...(persona.celularesExtra || []), { numero: num, origen }];
  }
  return persona;
}

// Cruza la lista de niños ya cargados con las filas de REGISTRO_RN (por CNV) y
// agrega los teléfonos nuevos a la madre de cada niño. No pisa nada existente.
// filasRegistroRN: [{ cnv: "", telefono: "cel1/cel2" }, ...]
function fusionarTelefonosRN(ninos, filasRegistroRN) {
  const mapaRN = new Map();
  filasRegistroRN.forEach((fila) => {
    const cnv = String(fila.cnv || "").trim();
    if (!cnv) return;
    const telefonos = String(fila.telefono || "").split("/").map((t) => t.trim()).filter(Boolean);
    mapaRN.set(cnv, telefonos);
  });

  return ninos.map((nino) => {
    const telefonos = mapaRN.get(String(nino.cnv || "").trim());
    if (!telefonos || !telefonos.length) return nino;
    let madre = nino.madre ? { ...nino.madre } : { documento: "", celular: "", celularesExtra: [] };
    telefonos.forEach((t) => {
      madre = agregarTelefonoUnico(madre, t, "REGISTRO_RN");
    });
    return { ...nino, madre };
  });
}

/* ---------- 6. Intercambio JSON con Luis (sisfoh, llamadas, visitas) ---------- */

function exportarJSON(data, nombreArchivo) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

function importarJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      callback(null, data);
    } catch (err) {
      callback(err, null);
    }
  };
  reader.readAsText(file);
}

// Combina lo local con lo importado sin duplicar (por id, crypto.randomUUID()).
// Usar en sisfoh (una vía) y en llamadas/visitas (donde luego se vuelve a
// exportar el resultado para dárselo de vuelta a Luis).
function mezclarPorId(listaLocal, listaImportada) {
  const idsExistentes = new Set(listaLocal.map((r) => r.id));
  const nuevos = (listaImportada || []).filter((r) => !idsExistentes.has(r.id));
  return [...listaLocal, ...nuevos];
}

/* ---------- 7. Detección asistida de duplicados (Base Maestra) ---------- */

// Similitud simple por palabras compartidas entre dos nombres completos.
// 1 = idéntico, 0 = nada en común.
function similitudNombre(a, b) {
  const na = (a || "").toUpperCase().trim();
  const nb = (b || "").toUpperCase().trim();
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const palabrasA = na.split(/\s+/);
  const palabrasB = nb.split(/\s+/);
  const comunes = palabrasA.filter((p) => palabrasB.includes(p)).length;
  return comunes / Math.max(palabrasA.length, palabrasB.length);
}

// Agrupa por (documento de la madre + fecha de nacimiento) y devuelve candidatos
// a duplicado con una prioridad sugerida. NUNCA decide por sí solo — siempre
// requiere confirmación manual antes de generar una solicitud de baja.
function detectarCandidatosDuplicado(ninos) {
  const grupos = new Map();
  ninos.forEach((n) => {
    const docMadre = (n.madre && n.madre.documento) || "";
    const clave = `${docMadre}|${n.fechaNacimiento || ""}`;
    if (!docMadre || !n.fechaNacimiento) return;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(n);
  });

  const candidatos = [];
  grupos.forEach((lista) => {
    if (lista.length < 2) return;
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const score = similitudNombre(nombreCompleto(lista[i]), nombreCompleto(lista[j]));
        candidatos.push({
          nino1: lista[i],
          nino2: lista[j],
          similitudNombres: Math.round(score * 100) / 100,
          prioridad: score >= 0.7 ? "ALTA — probable duplicado real" : "BAJA — revisar, podría ser mellizo/a",
        });
      }
    }
  });
  return candidatos;
}

// Arma el objeto listo para empujar al array de "bajas" del módulo bajas-altas,
// una vez que TÚ confirmaste manualmente cuál de los dos registros es el duplicado.
function generarSolicitudBajaPorDuplicado(codigoPadronADarDeBaja, codigoPadronQueQueda, registradoPor) {
  return {
    id: crypto.randomUUID(),
    codigoPadron: codigoPadronADarDeBaja,
    motivo: "DUPLICADO",
    referenciaCruzada: codigoPadronQueQueda,
    fechaSolicitud: new Date().toISOString().slice(0, 10),
    estado: "PENDIENTE",
    registradoPor,
  };
}

/* ---------- 7b. Campo "correo de la madre" del padrón — a veces trae celulares ---------- */

// La columna oficial "DIRECCION DE CORREO ELECTRONICO DE LA MADRE" en la práctica
// también trae números de celular sueltos (o mezclados con el correo). Esto se
// queda solo con los números de 9 dígitos y descarta cualquier email.
function extraerCelularDeCorreo(valor) {
  if (!valor) return "";
  const numeros = String(valor).match(/\d{9}/g);
  return numeros ? [...new Set(numeros)].join(" / ") : "";
}

/* ---------- 8. Edad (formato estándar "0a 00m 00d") ---------- */

function calcularEdad(nacimiento, referencia) {
  let y = referencia.getFullYear() - nacimiento.getFullYear();
  let m = referencia.getMonth() - nacimiento.getMonth();
  let d = referencia.getDate() - nacimiento.getDate();
  if (d < 0) { m--; d += new Date(referencia.getFullYear(), referencia.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  if (y < 0) { y = 0; m = 0; d = 0; }
  return { y, m, d };
}
function formatEdad(e) { const p = n => String(n).padStart(2, "0"); return `${e.y}a ${p(e.m)}m ${p(e.d)}d`; }

/* ---------- 9. Modelo de eventos (para la v3 — fichas automáticas) ---------- */

function crearEvento(documento, modulo, tipo, estado, detalle, registradoPor) {
  return {
    id: crypto.randomUUID(),
    documento,
    modulo,
    tipo,
    fecha: new Date().toISOString().slice(0, 10),
    estado,
    detalle: detalle || {},
    registradoPor: registradoPor || obtenerRegistradorActual() || {},
  };
}

/* ============================================================
   10. CONTRATO DE GESTIÓN (llamadas y visitas) — v1
   ============================================================
   Una gestión es CUALQUIER contacto o intento de contacto con la familia
   de un niño: una llamada o una visita domiciliaria.

   DECISIÓN DE DISEÑO: existe UNA SOLA bodega de gestiones compartida.
   Los módulos NO guardan sus propias llamadas/visitas por separado:
     - registro-llamadas       lee y escribe gestiones tipo LLAMADA
     - visitas-domiciliarias   lee y escribe gestiones tipo VISITA
     - recien-nacidos          escribe ambos tipos, y los otros dos los ven
                               automáticamente porque leen la misma bodega
   Así "que se refleje en los otros sistemas" no requiere sincronizar nada:
   es el mismo archivo.

   El campo `moduloOrigen` deja constancia de desde dónde se registró, para
   que en llamadas/visitas puedas distinguir lo que entró desde otro módulo.
   ============================================================ */

// Versión del formato de gestión. Si algún día cambia la estructura, se sube
// este número y `migrarGestion()` se encarga de los registros antiguos.
const GESTION_VERSION = 1;

const TIPOS_GESTION = {
  LLAMADA: "LLAMADA",
  VISITA: "VISITA",
};

// Resultados posibles. Se mantienen separados por tipo porque no significan
// lo mismo: "no contesta" es de llamada, "casa cerrada" es de visita.
const RESULTADOS_LLAMADA = [
  "CONTACTADO",
  "NO CONTESTA",
  "NUMERO EQUIVOCADO",
  "NUMERO APAGADO O FUERA DE SERVICIO",
  "CORTO LA LLAMADA",
  "SE COMPROMETE A REGULARIZAR",
  "OTRO",
];

const RESULTADOS_VISITA = [
  "ENCONTRADO",
  "NO ENCONTRADO - CASA CERRADA",
  "NO ENCONTRADO - CAMBIO DE DOMICILIO",
  "NO ENCONTRADO - DIRECCION NO EXISTE",
  "NO ENCONTRADO - NO CONOCEN AL NIÑO",
  "SE COMPROMETE A REGULARIZAR",
  "OTRO",
];

// Resultados que cuentan como contacto efectivo con la familia.
// Útil para estadística mensual y para no volver a llamar al mismo el mismo día.
const RESULTADOS_EFECTIVOS = [
  "CONTACTADO",
  "ENCONTRADO",
  "SE COMPROMETE A REGULARIZAR",
];

function resultadosPorTipo(tipo) {
  return tipo === TIPOS_GESTION.VISITA ? RESULTADOS_VISITA : RESULTADOS_LLAMADA;
}

function esGestionEfectiva(gestion) {
  return RESULTADOS_EFECTIVOS.includes(String(gestion.resultado || "").toUpperCase());
}

/* ---------- 10.1 Crear una gestión ---------- */

// Único constructor válido de gestiones. Cualquier módulo que registre una
// llamada o visita DEBE pasar por aquí, para que los tres guarden lo mismo.
//
//   crearGestion({
//     tipo: TIPOS_GESTION.LLAMADA,
//     documento: "12345678",
//     codigoPadron: "15935557",
//     nombreNino: "COILA PORTUGAL, ENZO FERRAN",
//     moduloOrigen: MODULOS.RECIEN_NACIDOS,
//     resultado: "NO CONTESTA",
//     numeroMarcado: "981619032",
//     observacion: "SE INTENTARA MAÑANA POR LA TARDE",
//   })
function crearGestion(datos) {
  const ahora = new Date();
  const tipo = datos.tipo === TIPOS_GESTION.VISITA
    ? TIPOS_GESTION.VISITA
    : TIPOS_GESTION.LLAMADA;

  return {
    // --- identidad ---
    id: idUnico(),
    version: GESTION_VERSION,

    // --- a quién ---
    documento: String(datos.documento || "").trim().toUpperCase(),
    codigoPadron: String(datos.codigoPadron || "").trim(),
    nombreNino: String(datos.nombreNino || "").trim().toUpperCase(),

    // --- qué ---
    tipo,
    fecha: datos.fecha || fechaHoyPeru(),
    hora: datos.hora || ahora.toTimeString().slice(0, 5),
    resultado: String(datos.resultado || "").trim().toUpperCase(),
    observacion: String(datos.observacion || "").trim().toUpperCase(),

    // --- específico de LLAMADA ---
    numeroMarcado: String(datos.numeroMarcado || "").trim(),

    // --- específico de VISITA ---
    direccionVisitada: String(datos.direccionVisitada || "").trim().toUpperCase(),
    acompanante: String(datos.acompanante || "").trim().toUpperCase(),

    // --- trazabilidad ---
    moduloOrigen: datos.moduloOrigen || "",
    registradoPor: datos.registradoPor || obtenerRegistradorActual() || {},
    creadoEn: ahora.toISOString(),
  };
}

/* ---------- 10.2 Migración de gestiones antiguas ---------- */

// Lee una gestión guardada en CUALQUIER versión anterior y la devuelve en el
// formato actual. Los módulos deben pasar por aquí SIEMPRE al leer del archivo,
// nunca usar el objeto crudo. Así el HTML se puede seguir editando sin miedo:
// los registros viejos se adaptan solos al leerse.
function migrarGestion(raw) {
  if (!raw) return null;
  const v = raw.version || 0;
  let g = { ...raw };

  // v0 -> v1: registros creados antes de que existiera este contrato, cuando
  // llamadas y visitas guardaban con nombres de campo propios.
  if (v < 1) {
    g = {
      id: raw.id || idUnico(),
      version: 1,
      documento: String(raw.documento || raw.dni || raw.documentoNino || "").trim().toUpperCase(),
      codigoPadron: String(raw.codigoPadron || raw.codPadron || "").trim(),
      nombreNino: String(raw.nombreNino || raw.nombre || raw.nombreCompleto || "").trim().toUpperCase(),
      tipo: (raw.tipo || (raw.numeroMarcado || raw.telefono ? "LLAMADA" : "VISITA")).toUpperCase(),
      fecha: raw.fecha || raw.fechaLlamada || raw.fechaVisita || "",
      hora: raw.hora || raw.horaLlamada || "",
      resultado: String(raw.resultado || raw.estado || raw.motivo || "").trim().toUpperCase(),
      observacion: String(raw.observacion || raw.observaciones || raw.detalle || "").trim().toUpperCase(),
      numeroMarcado: String(raw.numeroMarcado || raw.telefono || raw.celular || "").trim(),
      direccionVisitada: String(raw.direccionVisitada || raw.direccion || "").trim().toUpperCase(),
      acompanante: String(raw.acompanante || "").trim().toUpperCase(),
      moduloOrigen: raw.moduloOrigen || raw.modulo || "",
      registradoPor: raw.registradoPor || {},
      creadoEn: raw.creadoEn || raw.timestamp || "",
    };
  }

  return g;
}

// Aplica migrarGestion a una lista completa y descarta lo que no sea utilizable.
function migrarGestiones(lista) {
  return (lista || []).map(migrarGestion).filter(g => g && g.documento);
}

/* ---------- 10.3 Validación ---------- */

// Devuelve [] si la gestión es válida, o una lista de errores legibles.
// Se usa ANTES de guardar, para no meter basura al archivo compartido.
function validarGestion(g) {
  const errores = [];
  if (!g.documento && !g.codigoPadron) errores.push("Falta documento o código de padrón del niño");
  if (!Object.values(TIPOS_GESTION).includes(g.tipo)) errores.push("Tipo de gestión inválido");
  if (!g.fecha) errores.push("Falta la fecha");
  if (!g.resultado) errores.push("Falta el resultado");
  if (g.resultado && !resultadosPorTipo(g.tipo).includes(g.resultado)) {
    errores.push(`Resultado "${g.resultado}" no corresponde a una gestión de tipo ${g.tipo}`);
  }
  if (g.tipo === TIPOS_GESTION.LLAMADA && !g.numeroMarcado) {
    errores.push("Falta el número marcado");
  }
  return errores;
}

/* ---------- 10.4 Archivo compartido en OneDrive ---------- */

// Las gestiones se guardan en archivos MENSUALES para que ningún archivo crezca
// sin control (un año entero de llamadas en un solo JSON se vuelve lento de
// leer y de guardar en cada cambio).
//   .../15_GESTIONES/gestiones-2026-08.json
//
// Al abrir un módulo se cargan el mes actual y el anterior — suficiente para
// ver el historial reciente sin descargar años de datos. Para reportes
// mensuales o estadística se leen los meses que se necesiten explícitamente.
const CARPETA_GESTIONES = "15_GESTIONES";

function archivoGestionesDelMes(fecha) {
  const f = fecha || fechaHoyPeru();          // "yyyy-mm-dd"
  const periodo = String(f).slice(0, 7);      // "yyyy-mm"
  return `${CARPETA_GESTIONES}/gestiones-${periodo}.json`;
}

/* ---------- 10.5 Consultas de apoyo ---------- */

// Todas las gestiones de un niño, más recientes primero.
function gestionesDeNino(gestiones, documento, codigoPadron) {
  const doc = String(documento || "").trim().toUpperCase();
  const cod = String(codigoPadron || "").trim();
  return (gestiones || [])
    .filter(g => (doc && g.documento === doc) || (cod && g.codigoPadron === cod))
    .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
}

// Última gestión registrada de un niño (o null). Útil para mostrar en las
// listas "último contacto: 05/08/2026 - NO CONTESTA".
function ultimaGestion(gestiones, documento, codigoPadron) {
  const lista = gestionesDeNino(gestiones, documento, codigoPadron);
  return lista.length ? lista[0] : null;
}

// Cuántos intentos se han hecho sin lograr contacto efectivo desde el último
// contacto exitoso. Sirve para priorizar visitas: si ya se llamó 4 veces sin
// respuesta, toca ir a la casa.
function intentosSinExito(gestiones, documento, codigoPadron) {
  const lista = gestionesDeNino(gestiones, documento, codigoPadron);
  let cuenta = 0;
  for (const g of lista) {          // ya viene de más reciente a más antigua
    if (esGestionEfectiva(g)) break;
    cuenta++;
  }
  return cuenta;
}

// Evita registrar dos veces la misma gestión (doble clic, o que el mismo niño
// se cargue desde dos módulos a la vez). Mismo niño + mismo tipo + misma fecha
// + mismo resultado se considera repetido.
function esGestionDuplicada(gestiones, nueva) {
  return (gestiones || []).some(g =>
    g.documento === nueva.documento &&
    g.tipo === nueva.tipo &&
    g.fecha === nueva.fecha &&
    g.resultado === nueva.resultado &&
    g.numeroMarcado === nueva.numeroMarcado
  );
}
