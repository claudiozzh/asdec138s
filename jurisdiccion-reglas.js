// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO COMPARTIDO: REGLAS DE ASIGNACIÓN DE JURISDICCIÓN (EESS) - PADRÓN NOMINAL ILO
// Usado por: sisfoh-actualizaciones-modelo.html, analisis-general-fixed-v2.html, filtros_por_agrupaciones.html
//
// IMPORTANTE: este es el ÚNICO lugar donde se deben agregar o corregir direcciones.
// Si necesitas agregar una calle/zona nueva, o corregir una jurisdicción, hazlo AQUÍ
// (en JURIS_EXACTA o en reglasRango) y se refleja automáticamente en todas las
// herramientas que lo cargan con <script src="jurisdiccion-reglas.js"></script>.
// ═══════════════════════════════════════════════════════════════════════════════

// Si necesitas agregar una calle/zona nueva, o corregir una jurisdicción, hazlo AQUÍ
// (en JURIS_EXACTA o en reglasRango) y automáticamente se reflejará en todas las
// herramientas que incluyan este archivo con <script src="jurisdiccion-reglas.js">.
// ═══════════════════════════════════════════════════════════════════════════════

function norm(str) {
  if (!str && str !== 0) return '';
  let s = String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[°]/g, '')
    .replace(/[.\-]/g, ' ')
    .replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ')
    .trim().toUpperCase();
  // Normaliza ordinales pegados a un número: 1RO, 1ERO, 2DO, 3ER, etc.
  s = s.replace(/\b(\d+)(RO|RA|DO|ERO|ER|VO|TO)\b/g, '$1');
  return s;
}

function limpiarClave(clave) {
  return clave.replace(/[°]/g, '').replace(/[.\-]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEO DE JURISDICCIONES Y CÓDIGOS
// ═══════════════════════════════════════════════════════════════════════════════
const MAPA_JURISDICCIONES = {
  'PAMPA INALAMBRICA': 'C.S. PAMPA INALAMBRICA',
  'LOS ANGELES': 'P.S. LOS ANGELES',
  'MIRAMAR': 'C.S. MIRAMAR',
  'ALTO ILO': 'C.S. ALTO ILO',
  'KENNEDY': 'P.S. KENNEDY',
  '18 DE MAYO': 'P.S. 18 DE MAYO',
  'VARADERO': 'P.S. VARADERO'
};

const MAPA_ID_JURISDICCION = {
  'C.S. PAMPA INALAMBRICA': 'CSPI',
  'P.S. LOS ANGELES': 'PSLA',
  'C.S. MIRAMAR': 'CSMir',
  'C.S. ALTO ILO': 'CSAI',
  'P.S. KENNEDY': 'PSKen',
  'P.S. 18 DE MAYO': 'PS18',
  'P.S. VARADERO': 'PSVar',
  'NO DEFINIDO': 'NODEF'
};

const COLORES_JURISDICCION = {
  'C.S. PAMPA INALAMBRICA': '#1565C0',
  'P.S. LOS ANGELES': '#42A5F5',
  'C.S. MIRAMAR': '#26A69A',
  'C.S. ALTO ILO': '#4DB6AC',
  'P.S. KENNEDY': '#80CBC4',
  'P.S. 18 DE MAYO': '#26C6DA',
  'P.S. VARADERO': '#4DD0E1',
  'NO DEFINIDO': '#B0BEC5'
};

const SECTORES = {
  'PAMPA INALAMBRICA': ['C.S. PAMPA INALAMBRICA', 'P.S. LOS ANGELES'],
  'PUERTO': ['C.S. MIRAMAR', 'C.S. ALTO ILO', 'P.S. KENNEDY', 'P.S. 18 DE MAYO', 'P.S. VARADERO']
};

// ═══════════════════════════════════════════════════════════════════════════════
// DICCIONARIO DE DIRECCIONES/ZONAS -> JURISDICCIÓN
// (agrega aquí nuevas direcciones que encuentres, en la línea de la jurisdicción que corresponda)
// ═══════════════════════════════════════════════════════════════════════════════
const JURIS_EXACTA = {
  '1 DE JUNIO':'LOS ANGELES','1 DE MAYO':'LOS ANGELES','3 DE SETIEMBRE':'LOS ANGELES',
  'APV. CARSIL':'LOS ANGELES','ASOC. LA INDEPENDENCIA':'LOS ANGELES',
  'CIUDAD DE LA JUVENTUD':'LOS ANGELES','CIUDAD UNIVERSITARIA':'LOS ANGELES',
  'LAS BRISAS V':'LOS ANGELES','LOS ANGELES':'LOS ANGELES',
  'MIRAFLORES AMPLIACION':'LOS ANGELES','MIRAFLORES':'LOS ANGELES',
  'VILLA PARAISO':'LOS ANGELES','VILLA PUERTO EL ENCANTO':'LOS ANGELES',
  'VILLA HERMOSA':'LOS ANGELES','VILLA LA LIBERTAD':'LOS ANGELES','VILLA LIBERTAD':'LOS ANGELES',
  'VILLA LAS PALMAS':'LOS ANGELES','VILLA PACIFICO':'LOS ANGELES',
  'VILLA PROGRESO':'LOS ANGELES','VILLA UNIVERSITARIA':'LOS ANGELES',
  '18 DE MAYO':'18 DE MAYO','BELLO HORIZONTE':'18 DE MAYO',
  'BELLO HORIZONTE AMPLIACION':'18 DE MAYO','ENAPU PERU':'18 DE MAYO',
  'VILLA MILITAR HERMOSA':'18 DE MAYO',
  '2 DE MARZO':'PAMPA INALAMBRICA','24 DE OCTUBRE':'PAMPA INALAMBRICA',
  '24 DE OCTUBRE AMPLIACION':'PAMPA INALAMBRICA','28 DE JULIO':'PAMPA INALAMBRICA',
  'ALTO CALIENTA NEGROS':'PAMPA INALAMBRICA','ALTO CHIRIBAYA':'PAMPA INALAMBRICA',
  'ASOC. AMAUTA':'PAMPA INALAMBRICA','ASOC. LAS CASUARINAS':'PAMPA INALAMBRICA',
  'ASOC. PACOCHA':'PAMPA INALAMBRICA','URB. PACOCHA':'PAMPA INALAMBRICA','ASOC. PEDRO HUILCA':'PAMPA INALAMBRICA',
  'AV. JOSE MALDONADO':'PAMPA INALAMBRICA','BELLAVISTA':'PAMPA INALAMBRICA',
  'LA PICUDA':'PAMPA INALAMBRICA','ENACE':'PAMPA INALAMBRICA',
  'CIUDAD DEL PESCADOR':'PAMPA INALAMBRICA','CIUDAD ENERSUR':'PAMPA INALAMBRICA',
  'COBRESUR':'PAMPA INALAMBRICA','DANIEL ALCIDES CARRION':'PAMPA INALAMBRICA',
  'EDIFICIOS AMARILLOS':'PAMPA INALAMBRICA','EDIFICIOS VERDES':'PAMPA INALAMBRICA',
  'INTEGRACION LATINOAMERICANA':'PAMPA INALAMBRICA',
  'JOSE CARLOS MARIATEGUI':'PAMPA INALAMBRICA','JOSE OLAYA':'PAMPA INALAMBRICA',
  'JUAN PABLO II':'PAMPA INALAMBRICA','LAS GLORIETAS':'PAMPA INALAMBRICA',
  'LAS GARDENIAS':'PAMPA INALAMBRICA','LOS OLIVARES':'PAMPA INALAMBRICA',
  'MIRADOR BOCA DEL SAPO':'PAMPA INALAMBRICA','MIRADOR EL PACIFICO':'PAMPA INALAMBRICA',
  'NUEVA ALIANZA':'PAMPA INALAMBRICA','NUEVA GENERACION':'PAMPA INALAMBRICA',
  'NUEVA VICTORIA':'PAMPA INALAMBRICA','NUEVO ILO':'PAMPA INALAMBRICA',
  'PARQUE INDUSTRIAL':'PAMPA INALAMBRICA','RESIDENCIAL EL OLIVAR':'PAMPA INALAMBRICA',
  'SIGLO XXI':'PAMPA INALAMBRICA','SR. DE LOS MILAGROS':'PAMPA INALAMBRICA',
  'TREN AL SUR':'PAMPA INALAMBRICA','URB. MAGISTERIO':'PAMPA INALAMBRICA',
  'URB. LIBERACION':'PAMPA INALAMBRICA','URB. LOS OLIVARES':'PAMPA INALAMBRICA',
  'URB. LUIS E. VALCARCEL':'PAMPA INALAMBRICA','URB. VILLA MARINA':'PAMPA INALAMBRICA',
  'VILLA BICENTENARIO':'PAMPA INALAMBRICA','VILLA COSTA VERDE':'PAMPA INALAMBRICA',
  'VILLA EL EDEN':'PAMPA INALAMBRICA','VILLA EL PORTENO':'PAMPA INALAMBRICA',
  'VILLA LAS LOMAS':'PAMPA INALAMBRICA','VILLA LOS ARENALES':'PAMPA INALAMBRICA',
  'VILLA METALURGICA':'PAMPA INALAMBRICA','VILLA PRIMAVERA':'PAMPA INALAMBRICA',
  'VISTA AL MAR':'PAMPA INALAMBRICA','VISTA ALEGRE':'PAMPA INALAMBRICA','VISTA AZUL':'PAMPA INALAMBRICA',
  '20 DE DICIEMBRE':'VARADERO','CALLE AYACUCHO':'VARADERO',
  'COSTA AZUL':'VARADERO','JR. 2 DE MAYO':'VARADERO','JR. CALLAO':'VARADERO','CALLE CALLAO':'VARADERO',
  'JR. GRAU':'VARADERO','JR. ILO':'VARADERO','JR. JUNIN':'VARADERO',
  'JR. MARISCAL NIETO':'VARADERO','JR. MOQUEGUA':'VARADERO',
  'JR. PICHINCHA':'VARADERO','JR. ZEPITA':'VARADERO',
  'MALATESTA':'VARADERO','MARITIMOS':'VARADERO','MONTERRICO':'VARADERO',
  'NYLON SAN PEDRO':'VARADERO','URB. SANTA ROSA':'VARADERO',
  'ALTO ILO ARENAL':'ALTO ILO','ALTO ILO CHALACA':'ALTO ILO',
  'ALTO ILO SAN FRANCISCO':'ALTO ILO','ALTO ILO SAN PEDRO':'ALTO ILO',
  'LOCAL COMUNAL CHALACA':'ALTO ILO',
  'CESAR VALLEJO':'ALTO ILO','SANTA CRUZ':'ALTO ILO',
  'CIRCUNVALACION CUAJONE':'MIRAMAR','EDIFICIOS LAM':'MIRAMAR',
  'LOS OLIVOS':'MIRAMAR','MALECON COSTERO':'MIRAMAR',
  'MIGUEL GRAU':'MIRAMAR','VILLA MILITAR TARAPACA':'MIRAMAR',
  'MIRAMAR':'MIRAMAR','MIRAMAR PARQUE INDUSTRIAL':'MIRAMAR','MIRAMAR PARTE PRIMA':'MIRAMAR',
  'SAN GERONIMO AMPLIACION':'MIRAMAR','SAN GERONIMO':'MIRAMAR',
  'URB. GARIBALDI':'MIRAMAR','URB. TUPAC AMARU':'MIRAMAR',
  'URB. VILLA DEL MAR':'MIRAMAR','VILLA 6 DE MAYO':'MIRAMAR',
  'BARRIO MEYLAN':'KENNEDY','CALLE ARICA':'KENNEDY',
  'AV. MARIANO LINO URQUIETA':'KENNEDY',
  'CALLE JUAN GASCO':'KENNEDY','CALLE MOLLENDO':'KENNEDY','JR. MOLLENDO':'KENNEDY',
  'CALLE SAN GERONIMO':'KENNEDY','JHON F. KENNEDY':'KENNEDY','JOHN F. KENNEDY':'KENNEDY',
  'JR. CUSCO':'KENNEDY','JR. PROLONGACION CALLAO':'KENNEDY',
  'URB. ADUANEROS':'KENNEDY','URB. HUASCAR':'KENNEDY',
  'URB. ILO':'KENNEDY','URB. MAGISTERIAL':'KENNEDY','VILLA NAVAL':'KENNEDY',
  '7 DE MAYO':'MIRAMAR',
  'ALTO ILO NYLON':'ALTO ILO',
  'NUEVA ESPERANZA':'ALTO ILO'
};

const CLAVES_LIMPIAS = Object.keys(JURIS_EXACTA)
  .map(original => ({ original, limpia: limpiarClave(original) }))
  .sort((a, b) => b.limpia.length - a.limpia.length);

// ═══════════════════════════════════════════════════════════════════════════════
// REGLAS POR RANGO DE MANZANA (zonas que se dividen entre 2 jurisdicciones)
// ═══════════════════════════════════════════════════════════════════════════════
function reglasRango(t) {
  let m;
  m = t.match(/(?:JR\s+)?ABTAO\s+(?:N[o]?\s*)?(\d+)/);
  if (m) {
    const n = parseInt(m[1]);
    return n <= 830 ? 'VARADERO' : (n >= 900 && n <= 1100 ? 'KENNEDY' : null);
  }
  m = t.match(/ALTO\s+ILO\s+NYLON\s+(?:MZ[A]?\s*)([A-Z])\b/);
  if (m) {
    const l = m[1];
    return 'ABCDE'.includes(l) ? '18 DE MAYO' : 'LMNOPQRS'.includes(l) ? 'ALTO ILO' : null;
  }
  m = t.match(/NUEVA\s+ESPERANZA\s+(?:MZ[A]?\s*)([A-Z])\b/);
  if (m) {
    const l = m[1];
    return 'ABCDEFGH'.includes(l) ? 'ALTO ILO' : 'IJKLMN'.includes(l) ? '18 DE MAYO' : null;
  }
  m = t.match(/(?:ASOC\s+)?7\s+DE\s+MAYO\s+(?:MZ[A]?\s*)([A-Z])\b/);
  if (m) {
    const l = m[1];
    return 'ABCDEFG'.includes(l) ? 'MIRAMAR' : 'HIJ'.includes(l) ? 'KENNEDY' : null;
  }
  // Las Brisas III: comparte numeración de manzanas con Nueva Victoria.
  // Regla acordada: Mz. 0-29 -> Pampa Inalámbrica, Mz. 30-34 -> Los Ángeles.
  // Si encuentras un caso que no calza con esta regla, avisa para ajustar el rango exacto.
  m = t.match(/LAS\s+BRISAS\s+III\s+(?:MZ[A]?\s*)?(\d+)/);
  if (m) {
    const n = parseInt(m[1]);
    return n <= 29 ? 'PAMPA INALAMBRICA' : (n >= 30 && n <= 34 ? 'LOS ANGELES' : null);
  }
  return null;
}


// ═══════════════════════════════════════════════════════════════════════════════
// CAPA DE ALIAS: variantes de escritura -> nombre canónico
//
// El padrón nominal y el padrón del Vaso de Leche escriben las mismas zonas de
// forma distinta. Sin esta capa, las reglas resuelven 99.6% del padrón pero solo
// 84.9% del VDL. Aquí se traduce la variante al nombre que sí está en
// JURIS_EXACTA, ANTES de intentar la asignación.
//
// Para agregar una variante nueva: escribe la forma como aparece (ya normalizada,
// es decir SIN tildes, SIN puntos ni guiones, en MAYÚSCULAS) y a qué equivale.
// ═══════════════════════════════════════════════════════════════════════════════
const ALIAS_ZONAS = [
  // --- abreviaturas ---
  ['PUERTO E L ENCANTO',      'VILLA PUERTO EL ENCANTO'],
  ['PUERTO EL ENCANTO',       'VILLA PUERTO EL ENCANTO'],
  ['BOCA DEL SAPO',           'MIRADOR BOCA DEL SAPO'],
  ['MIRADOR DEL PACIFICO',    'MIRADOR EL PACIFICO'],
  ['LUIS E VALCARCEL',        'URB LUIS E VALCARCEL'],
  ['JOSE C MARIATEGUI',       'JOSE CARLOS MARIATEGUI'],
  ['INT LATINO AMERICANA',    'INTEGRACION LATINOAMERICANA'],
  ['INT LATINOAMERICANA',     'INTEGRACION LATINOAMERICANA'],
  ['INT LATINOAMERICA',       'INTEGRACION LATINOAMERICANA'],
  ['CIRCUNV CUAJONE',         'CIRCUNVALACION CUAJONE'],
  ['ASOCIACION AMAUTA',       'ASOC AMAUTA'],
  ['ASOCIACION PACOCHA',      'ASOC PACOCHA'],
  ['LAS CASUARINAS',          'ASOC LAS CASUARINAS'],
  ['LOS ARENALES',            'VILLA LOS ARENALES'],
  ['SENOR DE LOS MILAGROS',   'SR DE LOS MILAGROS'],
  ['CIUDAD EL PESCADOR',      'CIUDAD DEL PESCADOR'],
  ['COBRE SUR',               'COBRESUR'],
  ['BELLA VISTA',             'BELLAVISTA'],
  ['VILLA 3 DE SEPTIEMBRE',   '3 DE SETIEMBRE'],
  ['3 DE SEPTIEMBRE',         '3 DE SETIEMBRE'],

  // --- variantes de Calienta Negros ---
  ['VILLA CALIENTA NEGRO',    'ALTO CALIENTA NEGROS'],
  ['CALIENTA NEGROS IV ETAPA','ALTO CALIENTA NEGROS'],
  ['CALIENTA NEGROS',         'ALTO CALIENTA NEGROS'],

  // --- confirmados por Claudio (09/08/2026) ---
  ['URB SAN FRANCISCO',       'ALTO ILO SAN FRANCISCO'],
  ['SIGLO XII',               'SIGLO XXI'],
  ['MIRMAR PARTE PRIMA',      'MIRAMAR PARTE PRIMA'],
  ['MIRMAR P PRIMA',          'MIRAMAR PARTE PRIMA'],
  ['MIRAMAR P PRIMA',         'MIRAMAR PARTE PRIMA'],
  ['MIRMAR',                  'MIRAMAR'],

  // --- errores de tipeo detectados en el padrón del VDL (julio 2026) ---
  ['V M PERDRO HUILCA',       'ASOC PEDRO HUILCA'],
  ['V M PEDRO HUILCA',        'ASOC PEDRO HUILCA'],
  ['PERDRO HUILCA',           'PEDRO HUILCA'],
  ['VSTA AL MAR',             'VISTA AL MAR'],
  ['VISTA ALEGRER',           'VISTA ALEGRE'],
  ['VILLA LAS PALAMAS',       'VILLA LAS PALMAS'],
  ['VILLA BICENETNARIO',      'VILLA BICENTENARIO'],
];

// Zonas que aparecen en el VDL y NO se pudieron resolver con certeza.
// Requieren confirmación de Claudio antes de agregarlas a ALIAS_ZONAS.
// Mientras estén aquí, se asignan como NO DEFINIDO y salen en la lista de revisión.
const ALIAS_POR_CONFIRMAR = {};

// ═══════════════════════════════════════════════════════════════════════════════
// ZONAS SIN JURISDICCIÓN DEFINIDA (no es un error: no hay acuerdo institucional)
// Devuelven NO DEFINIDO a propósito, con el motivo explícito, para que nadie
// las "arregle" asignándoles una jurisdicción que no les corresponde.
// ═══════════════════════════════════════════════════════════════════════════════
const ZONAS_SIN_JURISDICCION = {
  '14 DE ENERO': 'Zona nueva de Ilo. P.S. Los Ángeles y C.S. Pampa Inalámbrica '
               + 'no se ponen de acuerdo sobre a quién corresponde.',
};

// Aplica los alias sobre un texto YA normalizado.
function aplicarAlias(t) {
  let r = t;
  // Ceros a la izquierda en números de zona: "02 DE MARZO" -> "2 DE MARZO"
  r = r.replace(/\b0(\d)\b/g, '$1');
  for (const [variante, canonico] of ALIAS_ZONAS) {
    if (r.includes(variante)) {
      r = r.replace(variante, canonico);
      break; // una sola sustitución: evita encadenar alias por error
    }
  }
  return r;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL DE ASIGNACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
function asignarJurisdiccion(descripcion) {
  return asignarJurisdiccionDetalle(descripcion).jurisdiccion;
}

// Versión detallada: devuelve además CÓMO se asignó y con qué confianza.
// Úsala cuando necesites saber si el resultado es confiable o hay que revisarlo.
//   { jurisdiccion, confianza: 'ALTA'|'MEDIA'|'NULA', metodo, texto, aviso }
function asignarJurisdiccionDetalle(descripcion) {
  const original = norm(descripcion);
  if (!original) {
    return { jurisdiccion: 'NO DEFINIDO', confianza: 'NULA',
             metodo: 'VACIO', texto: '', aviso: 'Dirección vacía' };
  }

  const t = aplicarAlias(original);
  const usoAlias = t !== original;

  // ¿Es una zona que institucionalmente NO tiene jurisdicción asignada?
  for (const zona in ZONAS_SIN_JURISDICCION) {
    const re = new RegExp('(^|\\s)' + zona + '(\\s|$)');
    if (re.test(t)) {
      return { jurisdiccion: 'NO DEFINIDO', confianza: 'ALTA',
               metodo: 'SIN_JURISDICCION_ASIGNADA', texto: t,
               aviso: ZONAS_SIN_JURISDICCION[zona] };
    }
  }

  // ¿Es una de las zonas que están esperando confirmación?
  for (const zona in ALIAS_POR_CONFIRMAR) {
    if (t.includes(zona)) {
      return { jurisdiccion: 'NO DEFINIDO', confianza: 'NULA',
               metodo: 'POR_CONFIRMAR', texto: t,
               aviso: ALIAS_POR_CONFIRMAR[zona] };
    }
  }

  const r = _resolver(t);
  return {
    jurisdiccion: r.jurisdiccion,
    // Si hizo falta traducir una variante de escritura, la confianza baja:
    // el alias es una interpretación, no el texto original.
    confianza: r.jurisdiccion === 'NO DEFINIDO' ? 'NULA' : (usoAlias ? 'MEDIA' : 'ALTA'),
    metodo: r.metodo,
    texto: t,
    aviso: usoAlias ? `Se interpretó "${original}" como "${t}"` : ''
  };
}

function _resolver(t) {

  // Excepción prioritaria: Catacatas (con o sin guion/espacio: "CATACATAS", "CATA-CATAS", "CATA CATAS")
  const compacto = t.replace(/\s+/g, '');
  if (compacto.includes('CATACATAS')) {
    return { jurisdiccion: MAPA_JURISDICCIONES['18 DE MAYO'] || '18 DE MAYO',
             metodo: 'EXCEPCION_CATACATAS' };
  }

  const rango = reglasRango(t);
  if (rango !== null) {
    return { jurisdiccion: MAPA_JURISDICCIONES[rango] || rango, metodo: 'REGLA_RANGO' };
  }
  const exacta = CLAVES_LIMPIAS.find(k => k.limpia === t);
  if (exacta) {
    const ji = JURIS_EXACTA[exacta.original];
    return { jurisdiccion: MAPA_JURISDICCIONES[ji] || ji, metodo: 'COINCIDENCIA_EXACTA' };
  }
  for (const { original, limpia } of CLAVES_LIMPIAS) {
    const re = new RegExp('(^|\\s)' + limpia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)');
    if (re.test(t)) {
      const ji = JURIS_EXACTA[original];
      return { jurisdiccion: MAPA_JURISDICCIONES[ji] || ji, metodo: 'COINCIDENCIA_PARCIAL' };
    }
  }
  return { jurisdiccion: 'NO DEFINIDO', metodo: 'SIN_COINCIDENCIA' };
}

