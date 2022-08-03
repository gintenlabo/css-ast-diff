'use strict';

const selectorParser = require('postcss-selector-parser');
const isPseudoClass = selectorParser.isPseudoClass;

function getSelectorTypeOrder(node) {
  switch (node.type) {
    case 'id':
      return 0;
    case 'class':
      return 1;
    case 'attribute':
      return 2;
    case 'pseudo':
      if (isPseudoClass(node)) {
        return 3;
      }
      return null;
  }
  return null;
}

function shouldBeSwappedWithNextNode(container, index) {
  if (index >= container.length - 1) {
    return false;
  }

  const node0 = container.at(index);
  const order0 = getSelectorTypeOrder(node0);
  if (order0 == null) {
    return false;
  }

  const node1 = container.at(index + 1);
  const order1 = getSelectorTypeOrder(node1);
  if (order1 == null) {
    return false;
  }

  if (order0 < order1) {
    return false;
  }
  if (order0 > order1) {
    return true;
  }
  return node0.toString() > node1.toString();
}

function swapWithNextNode(container, index) {
  if (index >= container.length - 1) {
    throw new RangeError('index out of range');
  }

  const node = container.at(index);
  const nextNode = container.at(index + 1);
  container.removeChild(nextNode);
  container.insertBefore(node, nextNode);
}

function sortContainer(container) {
  const length = container.length;
  let i = 0;
  while (i < length - 1) {
    if (shouldBeSwappedWithNextNode(container, i)) {
      swapWithNextNode(container, i);
      if (i > 0) {
        i -= 1;
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }
}

const parser = selectorParser(function (selectors) {
  selectors.each(function (container) {
    container.walkAttributes(function (attr) {
      if (attr.operator != null) {
        attr.quoteMark = "'";
        attr.quoted = true;
      }
    });
    sortContainer(container);
  });
});

module.exports = function normalizeSelector(selector) {
  return parser.processSync(selector, { lossless: false });
};
