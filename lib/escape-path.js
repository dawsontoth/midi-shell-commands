export function escapePath(p) {
  // Simple shell escaping for spaces
  if (p.includes(' ')) {
    return `'${p.replace(/'/g, '\'\\\'\'')}'`;
  }
  return p;
}
