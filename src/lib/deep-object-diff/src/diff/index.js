import { isMap, isDate, isEmpty, isObject, properObject } from '../utils/index.js';

const diff = (lhs, rhs) => {
  if (lhs === rhs) return {}; // equal return no diff

  if (!isObject(lhs) || !isObject(rhs)) return rhs; // return updated rhs

  if (isMap(rhs)) {
    if (!isMap(lhs)) return rhs;

    const diffMap = new Map();

    for (const [key, value] of rhs) {
      if (!lhs.has(key)) { // new key
        diffMap.set(key, value);
        continue;
      }

      const difference = diff(lhs.get(key), value);
      if (!isObject(difference) || !isEmpty(difference) || isDate(difference) || isMap(difference)) {
        diffMap.set(key, difference);
      }
    }

    // Find deleted keys
    for (const key of lhs.keys()) {
      if (!rhs.has(key)) {
        diffMap.set(key, undefined);
      }
    }

    return diffMap.size ? diffMap : {};
  }
  else if (isMap(lhs)) return rhs;

  const l = properObject(lhs);
  const r = properObject(rhs);

  const deletedValues = Object.keys(l).reduce((acc, key) => {
    return r.hasOwnProperty(key) ? acc : Object.assign({}, acc, { [key]: undefined });
  }, {});

  if (isDate(l) || isDate(r)) {
    if (l.valueOf() == r.valueOf()) return {};
    return r;
  }

  return Object.keys(r).reduce((acc, key) => {
    if (!l.hasOwnProperty(key)) return Object.assign({}, acc, { [key]: r[key] }); // return added r key

    const difference = diff(l[key], r[key]);

    if (isObject(difference) && isEmpty(difference) && !isDate(difference) && !isMap(difference)) return acc; // return no diff

    return Object.assign({}, acc, { [key]: difference }); // return updated key
  }, deletedValues);
};

export default diff;
