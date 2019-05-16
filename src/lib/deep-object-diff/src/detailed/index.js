import addedDiff from '../added/index.js';
import deletedDiff from '../deleted/index.js';
import updatedDiff from '../updated/index.js';

const detailedDiff = (lhs, rhs) => ({
  added: addedDiff(lhs, rhs),
  deleted: deletedDiff(lhs, rhs),
  updated: updatedDiff(lhs, rhs),
});

export default detailedDiff;
