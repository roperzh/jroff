var COMMENT = 1,
  MACRO = 2,
  IMACRO = 3,
  BREAK = 4,
  TEXT = 5,
  EMPTY = 6;

var callableMacros = [
  'Ac', 'Ao', 'Bc', 'Bo', 'Brc', 'Bro', 'Dc', 'Do', 'Ec', 'Eo', 'Fc',
  'Oc', 'Oo', 'Pc', 'Po', 'Qc', 'Qo', 'Sc', 'So', 'Xc', 'Xo', 'Aq',
  'Bq', 'Brq', 'Dq', 'Op', 'Pq', 'Ql', 'Qq', 'Sq', 'Vt', 'Ta', 'Ad',
  'An', 'Ap', 'Ar', 'At', 'Bsx', 'Bx', 'Cd', 'Cm', 'Dv', 'Dx', 'Em',
  'Er', 'Ev', 'Fa', 'Fl', 'Fn', 'Ft', 'Fx', 'Ic', 'Li', 'Lk', 'Ms',
  'Mt', 'Nm', 'Ns', 'Nx', 'Ox', 'Pa', 'Pf', 'Sx', 'Sy', 'Tn', 'Ux',
  'Va', 'Vt', 'Xr'
];

/**
 * Wrap all common regexp patterns
 *
 * @namespace
 * @alias patterns
 * @since 0.0.1
 *
 */
var patterns = {
  macro: /^\.[^\.]/,
  noWithespace: /\n|\S+/g,
  comment: /(\.\\)?\\\"/,
  arguments: /"(.*?)"|\S+/g,
  number: /[\d]/
};

var mergeObjects = function (obj1, obj2) {
  var result = {};

  for(var key in obj1) result[key] = obj1[key];
  for(var key in obj2) result[key] = obj2[key];

  return result;
};

var macros = {};
