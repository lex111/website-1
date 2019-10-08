const visit = require('unist-util-visit');

const ATTRS_REGEX = /(?<attrName>\b\w+\b)\s*=["']?\s*(?<attrValue>(?:.(?!["']?\s+(?:\S+)))[^"]*[^"<>\s]?)/gi;

// /(?<attrName>\b\w+\b)\s*=\s*(?<attrValue>"[^"]*"|'[^']*'|[^"'<>\s]+)/gi;
const PREFIX = 'symfonycasts:';

/**
 * Handles the Markdown AST.
 *
 * @param {{ markdownAST }} markdownAST the Markdown abstract syntax tree.
 * @param {PluginOptions} options the options of the plugin.
 * @returns {*} the Markdown AST.
 */
// export default async
module.exports = ({ markdownAST }, options = { link: '', alt: '', caption: '' }) => {
  visit(markdownAST, 'inlineCode', node => {
    const { value: nodeValue } = node;

    if (!nodeValue.startsWith(PREFIX)) {
      return;
    }

    const attrs = nodeValue.substring(PREFIX.length).matchAll(ATTRS_REGEX);

    for (let attr of attrs) {
      let { attrName, attrValue } = attr.groups;

      options = { ...options, ...{ [attrName]: attrValue.trim() } };
    }

    console.log(options);

    const { link, alt, caption } = options;

    if (!link || !alt) {
      throw new Error(`${PREFIX} Missing link or alt`);
    }

    const captionMarkup = caption ? `<span>${caption}</span>` : '';
    const markup = `
<p class="symfonycasts"><a href="${link}" class="symfonycasts"><img src="../distribution/images/symfonycasts-player.png" alt="${alt}">${captionMarkup}</a></span></p>
    `;

    node.type = 'html';
    node.value = markup;
  });

  return markdownAST;
};
