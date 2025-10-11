import Image from 'next/image';
import Link from 'next/link';
import {FaWhatsapp} from 'react-icons/fa';
import TikTokCarousel, {type TikTokVideo} from '@/components/site/TikTokCarousel';
import HomePosts from '@/components/site/HomePosts';
import type {Locale} from '@/i18n/locales';

type Params = {locale: Locale};

const MUSIC_CARDS = [
  {
    title: 'Lançamento: BASTA.',
    description:
      'Composta na década de 80, “BASTA.” ressurge com uma força impressionante para o cenário atual. Esta não é uma canção política; é um clamor da alma, um chamado para revolucionar nossos próprios corações e retornarmos aos Princípios de Deus. É um convite para dizer “basta” a tudo que nos afasta da verdade e do amor.',
    href: 'https://www.youtube.com/watch?v=6EVY-Ef8GRY',
    cta: 'Assista ao clipe ?',
    image: '/assets/capa_basta.webp',
    alt: 'Capa do single BASTA.'
  },
  {
    title: 'Quer levar uma mensagem de fé e esperança com você durante o dia?',
    description:
      'Me acompanhe no Spotify e adicione minhas músicas à sua playlist. Sua força lá é muito importante!',
    href: 'https://open.spotify.com/intl-pt/artist/6l2XVPCSpXi3oKheB3UvKI',
    cta: 'Acompanhe no Spotify ?',
    image: '/assets/capi-joy-spotify.webp',
    alt: 'Arte promocional do Capí Joy no Spotify'
  },
  {
    title: 'Para quem curte ouvir música pela Apple Music',
    description:
      'Também estamos conectados por lá! Siga meu perfil e vamos juntos nessa jornada de música e fé.',
    href: 'https://music.apple.com/br/artist/cap%C3%AD-joy/1831439555',
    cta: 'Siga na Apple Music ?',
    image: '/assets/capi-joy-apple-music.webp',
    alt: 'Arte promocional do Capí Joy na Apple Music'
  }
] as const;

const CONFERENCE_TOPICS = [
  'Mais do que um título, é uma jornada. Este projeto reúne reflexões sobre a ligação profunda entre liberdade e paz  dois estados que se completam e revelam a essência de viver de forma verdadeira. É um convite para respirar fundo, olhar para dentro e descobrir onde a encontramos descanso.',
  'O Retorno. Uma história que não deveria ter sido contada. Um relato intenso, real e transformador. “O Retorno” não é apenas uma história, é um testemunho de escolhas, sentimentos e caminhos que marcaram profundamente a vida de Capí Joy. Escrito com transparência e coragem, este projeto literário mostra que até as histórias mais difíceis podem ensinar, libertar e inspirar outros.'
] as const;

const TIKTOK_VIDEO_SOURCES = [
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7554336621676563723',
    lang: 'pt-BR',
    fallbackTitle: 'Mensagem Basta'
  },
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7548814698758540549',
    lang: 'pt-BR',
    fallbackTitle: 'Capí Joy no Spotify'
  },
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7546906338732068152',
    lang: 'pt-BR',
    fallbackTitle: 'Capí Joy inspira'
  },
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7161962857809054982',
    lang: 'pt-BR',
    fallbackTitle: 'Palavra de esperança'
  }
] as const;

interface TikTokOEmbedResponse {
  title?: string;
  thumbnail_url?: string;
}

async function getTikTokVideos(): Promise<TikTokVideo[]> {
  try {
    const results = await Promise.all(
      TIKTOK_VIDEO_SOURCES.map(async source => {
        try {
          const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(source.url)}`, {
            next: {revalidate: 3600}
          });

          if (!response.ok) {
            return {url: source.url, lang: source.lang, title: source.fallbackTitle};
          }

          const data = (await response.json()) as TikTokOEmbedResponse;

          return {
            url: source.url,
            lang: source.lang,
            title: typeof data.title === 'string' ? data.title : source.fallbackTitle,
            cover: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : undefined
          };
        } catch {
          return {url: source.url, lang: source.lang, title: source.fallbackTitle};
        }
      })
    );

    return results;
  } catch {
    return TIKTOK_VIDEO_SOURCES.map(source => ({url: source.url, lang: source.lang, title: source.fallbackTitle}));
  }
}

export default async function Page({params}: {params: Promise<Params>}) {
  const {locale} = await params;
  const tiktokVideos = await getTikTokVideos();

  return (
    <>
      <section id="topo" className="relative isolate">
        <div className="relative aspect-[5/7] w-full max-h-[85vh] sm:aspect-[16/9] sm:max-h-[70vh]">
          <Image
            src="/assets/banner-capi-joy.webp"
            alt="Capí Joy se apresentando"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="absolute inset-0">
          <div className="flex h-full items-start sm:items-center">
            <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pb-0 sm:pt-0">
              <div className="max-w-3xl space-y-5 text-white">
                <h1 className="text-3xl font-extrabold sm:text-5xl">
                  Liberdade e paz. Sem limites, sem medo, só ação. 
                </h1>
                <p className="text-base text-white/90">
                  Bem-vindo ao espaço oficial de Capí Joy. Aqui, cada palavra, canção e projeto nasce de um lugar real, humano e Deus 
Este é um refúgio para quem busca leveza, verdade e inspiração para viver com mais sentido.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="#contato" className="rounded-full border border-white/80 px-4 py-2 text-sm text-white hover:bg-white/10">
                    Ouça, leia, sinta…
                  </Link>
                  <p>E caminhe comigo nessa jornada onde a liberdade e a paz se encontram.</p>
                  <Link
                    href="https://www.youtube.com/watch?v=6EVY-Ef8GRY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/80 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Assista ao clipe “BASTA.”
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-3xl bg-black/20 p-3 aspect-[3/4] sm:max-w-[380px] sm:p-4 lg:max-w-[420px]">
          <Image
            src="/assets/retrato-capi-joy.webp"
            alt="Retrato de Capí Joy"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
        <div className="space-y-6 text-base leading-relaxed">
          <h2 className="text-3xl font-semibold">Sou Capí Joy, compositor, escritor e artista independente.</h2>
          <p>
            Gosto de transformar sentimentos e experiências em palavras e músicas. Minha arte é simples, mas nasce de um lugar profundo, onde espiritualidade, humanidade e verdade se entrelaçam.
          </p>
          <p>
            Escrevo para tocar corações, canto para libertar almas e crio para inspirar vidas mais leves e autênticas.
          </p>
          <p>
            Meu propósito é compartilhar mensagens que despertem fé, esperança e liberdade interior porque acredito que a verdadeira paz começa dentro de nós.
          </p>
        </div>
      </section>

      <section id="musicas" className="relative w-full overflow-hidden px-4 py-10">
        <div
          className="absolute inset-0 -z-20 h-full w-full bg-fixed bg-cover bg-center bg-no-repeat object-cover"
          style={{backgroundImage: "url('/assets/background-music.webp')"}}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 h-full w-full bg-black/40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl space-y-6 text-white">
          <h2 className="text-3xl font-semibold">Palco Canção BASTA</h2>
          <p className="max-w-2xl text-sm opacity-90">
            Um projeto visual e musical com energia intensa e alma livre. Imagino aqui Adalberto um palco moderno, fundo preto, luzes precisas e uma banda de rock vibrante. É assim que nasce o ambiente ideal para apresentar a canção "BASTA" — um grito de verdade e transformação. Cada detalhe foi pensado para transmitir força, emoção e autenticidade.
          </p>
          <div className="overflow-hidden rounded-3xl">
            <iframe
              width="100%"
              height="360"
              src="https://www.youtube-nocookie.com/embed/6EVY-Ef8GRY"
              title="Assista ao clipe BASTA"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {MUSIC_CARDS.map(card => (
              <article key={card.title} className="space-y-3 rounded-3xl bg-white/5 p-6">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                  <Image src={card.image} alt={card.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 30vw" />
                </div>
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="text-sm opacity-90">{card.description}</p>
                <Link href={card.href} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="conferencias" className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10">
        <h2 className="text-3xl font-semibold">LIBERDADE E PAZ — A CONEXÃO</h2>
        <p className="max-w-3xl text-sm opacity-90">
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {CONFERENCE_TOPICS.map(topic => (
            <div key={topic} className="rounded-2xl bg-white/5 px-4 py-3 text-sm leading-relaxed">
              {topic}
            </div>
          ))}
        </div>
      </section>

      <section id="blog" className="mx-auto w-full max-w-7xl space-y-4 px-4 py-10">
        <h2 className="text-3xl font-semibold">Blog / Reflexões</h2>
        <p className="text-sm opacity-90">
          Uma série devocional em três idiomas, escrita de forma prática e direta. A partir do Salmo 19, Capí Joy revela cinco chaves espirituais para viver com propósito e alcançar sucesso verdadeiro. Aquele que começa na alma e transborda na vida.
        </p>
        <HomePosts locale={locale} />
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-10">
        <h2 className="text-3xl font-semibold">Siga, curta e compartilhe nas nossas redes sociais</h2>
        <TikTokCarousel videos={tiktokVideos} />
      </section>

      <section id="contato" className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/5 p-8 text-center shadow-lg">
          <h3 className="text-lg font-semibold">Quer falar com Capí Joy?</h3>
          <p className="text-sm opacity-90">
            Use o formulário abaixo para enviar sua mensagem, convite ou testemunho. Você também pode acompanhar pelas redes sociais para ficar por dentro dos lançamentos, reflexões e eventos.
          </p>
          <form
            action="mailto:contato@capijoy.com.br"
            method="POST"
            encType="text/plain"
            className="flex w-full max-w-xl flex-col gap-3 text-left font-sans"
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white">Nome</span>
              <input
                type="text"
                name="name"
                required
                placeholder="Como devemos te chamar?"
                className="w-full rounded-lg border border-white/10 bg-white/90 px-4 py-2 text-sm font-sans text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white">E-mail</span>
              <input
                type="email"
                name="email"
                required
                placeholder="Seu e-mail"
                className="w-full rounded-lg border border-white/10 bg-white/90 px-4 py-2 text-sm font-sans text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white">Mensagem</span>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Conte um pouco do que vc precisa..."
                className="w-full rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-sm font-sans text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-sans font-semibold text-neutral-900 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
            >
              Enviar mensagem
            </button>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="font-medium">Telefone:</span>
            <Link href="tel:+5537999091340" className="underline">
              +55 (37) 99909-1340
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="font-medium">E-mail:</span>
            <Link href="mailto:contato@capijoy.com.br" className="underline">
              contato@capijoy.com.br
            </Link>
          </div>
          <Link
            href="https://api.whatsapp.com/send?phone=5537999091340"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
          >
            <FaWhatsapp className="text-lg" aria-hidden="true" />
            <span>Vamos conversar.</span>
          </Link>
        </div>
      </section>
    </>
  );
}












