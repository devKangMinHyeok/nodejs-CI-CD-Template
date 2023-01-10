import {add} from './functions/add';
import {sub} from './functions/sub';

export const main = (a, b) => {
  return add(a, b) + sub(a, b);
};
