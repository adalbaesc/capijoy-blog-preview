import Image from 'next/image';
import Link from 'next/link';
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
  'Superação: A Beleza de Recomeçar — Uma conversa sobre como ressignificar as perdas e usar as cicatrizes como mapa para um futuro mais forte. Falamos sobre resiliência, perdão e a força que nasce da vulnerabilidade.',
  'Propósito: Encontrando sua Voz e sua Missão — Um bate-papo prático para ajudar as pessoas a identificarem seus dons e paixões, alinhando-os a um propósito maior que vai além da carreira e toca a alma.',
  'Fé na Prática: A Confiança que Transforma a Rotina — Como sair do campo das ideias e viver uma fé real, que traz paz em meio ao caos, direção nas incertezas e força nas batalhas diárias.',
  'Liderança com Alma: Inspirando Pessoas — Uma abordagem sobre liderança baseada em valores, empatia e serviço. Para líderes que desejam construir equipes com propósito e um ambiente de trabalho mais humano.'
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
        <div className="relative aspect-[16/9] w-full max-h-[70vh]">
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
          <div className="flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-4">
              <div className="max-w-3xl space-y-5 text-white">
                <h1 className="text-3xl font-extrabold sm:text-5xl">
                  Música que toca a alma, palavras que constroem pontes
                </h1>
                <p className="text-base text-white/90">
                  Uma jornada de fé, esperança e recomeço para inspirar corações a encontrarem propósito todos os dias.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="#contato" className="rounded-full border border-white/80 px-4 py-2 text-sm text-white hover:bg-white/10">
                    Leve esta mensagem para o seu evento
                  </Link>
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
        <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl bg-black/20 p-4 sm:max-w-[360px] lg:max-w-[400px] lg:aspect-[3/4]">
          <Image
            src="/assets/retrato-capi-joy.webp"
            alt="Retrato de Capí Joy"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
        <div className="space-y-6 text-base leading-relaxed">
          <h2 className="text-3xl font-semibold">A História por Trás da Missão</h2>
          <p>
            Meu nome é Capí Joy. Sou brasileiro, pai de família, gerente Administrativo e, acima de tudo, um homem de fé e um sonhador incansável. Minha jornada não é a de alguém perfeito, mas a de alguém que encontrou no poder de Deus, na força do amor e no valor da verdade os pilares para guiar uma vida de propósito e gratidão. Carrego comigo a simplicidade das pessoas, a coragem de quem não desiste e a beleza que existe em recomeçar, mesmo depois de tudo.
          </p>
          <p>
            Minha missão é clara: usar cada experiência que vivi — na fé, no trabalho e na arte — para ser uma ponte. Uma ponte para tocar corações que se sentem sozinhos, para levantar quem caiu e para dar voz a quem se sente invisível. Em um mundo de ruídos, quero que minha música e minhas palavras sejam um abraço de Deus, um lugar de refúgio e transformação.
          </p>
          <p>
            Acredito que “Tudo volta pra Deus”, porque d’Ele vem tudo e para Ele tudo retorna. Esse é o lema que guia meus passos. Valorizo a presença de Deus agindo nas pequenas coisas, a lealdade verdadeira, a sabedoria que brota da simplicidade e a família como meu porto seguro. Aprendi que o tempo passa rápido demais e que, no fim, o que importa são as marcas de fé, música e esperança que deixamos no caminho.
          </p>
        </div>
      </section>

      <section id="musicas" className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10">
        <h2 className="text-3xl font-semibold">Canções que Nascem da Alma para Falar ao Coração</h2>
        <p className="max-w-2xl text-sm opacity-90">
          Cada canção é um pedaço da minha jornada, uma oração transformada em melodia. Ouça, compartilhe e deixe a mensagem te encontrar.
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
      </section>

      <section id="conferencias" className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10">
        <h2 className="text-3xl font-semibold">Palavras que Constroem e Transformam</h2>
        <p className="max-w-3xl text-sm opacity-90">
          Minhas conferências são mais do que palestras; são encontros, uma troca sincera de experiências sobre os desafios da vida, sempre à luz da fé. O objetivo é sair de lá com o coração mais leve e a esperança renovada. Leve essa conversa para sua empresa, sua igreja ou seu evento.
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
        <h2 className="text-3xl font-semibold">Diário de Bordo: Reflexões para a Jornada</h2>
        <p className="text-sm opacity-90">
          Um espaço para compartilhar pensamentos, histórias e experiências que nos conectam e nos lembram do que realmente importa.
        </p>
        <HomePosts locale={locale} />
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-10">
        <h2 className="text-3xl font-semibold">Siga, curta e compartilhe nas nossas redes sociais</h2>
        <TikTokCarousel videos={tiktokVideos} />
      </section>

      <section id="contato" className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-white/5 p-8 text-center shadow-lg">
          <h3 className="text-lg font-semibold">Vamos Levar esta Mensagem Juntos?</h3>
          <p className="text-sm opacity-90">
            Se você deseja levar essa mensagem para sua comunidade, evento ou igreja, vamos conversar. Juntos podemos construir pontes de esperança e inspirar pessoas a encontrarem coragem para recomeçar.
          </p>
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
            Fale pelo WhatsApp
          </Link>
        </div>
      </section>
    </>
  );
}












