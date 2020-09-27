import slug from 'slug';

export const getUniqueUrl = (url: string) => {
  const maxLength = 32 - 14;
  let truncateUrl = '';

  let _url = slug(url, {
    replacement: '-',
    symbols: true,
    remove: /[.]/g,
    lower: false,
    charmap: slug.charmap,
    multicharmap: slug.multicharmap,
  });

  // truncate string here
  if (_url.length <= maxLength) truncateUrl = _url;
  truncateUrl = _url.substring(0, maxLength);

  return `${truncateUrl}-${Date.now()}`;
};
