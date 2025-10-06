import {getRequestConfig} from 'next-intl/server';

function isSupported(l?: string): l is 'pt'|'en'|'es' {
  return l==='pt'||l==='en'||l==='es';
}

export default getRequestConfig(async ({locale}) => {
  const safe = isSupported(locale) ? locale : 'pt';
  const messages = (await import(`../messages/${safe}.json`)).default;
  return {locale: safe, messages};
});
