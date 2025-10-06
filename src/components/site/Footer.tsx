import Link from 'next/link';
import {FaYoutube, FaInstagram, FaTiktok, FaFacebook, FaSpotify, FaApple} from 'react-icons/fa6';

const SOCIALS = [
  {label: 'YouTube', href: 'https://www.youtube.com/@dicapijoy', Icon: FaYoutube},
  {label: 'Instagram', href: 'https://www.instagram.com/capijoy/', Icon: FaInstagram},
  {label: 'TikTok', href: 'https://www.tiktok.com/@capijoyoficial', Icon: FaTiktok},
  {label: 'Facebook', href: 'https://www.facebook.com/CapiJoyOficial/', Icon: FaFacebook},
  {label: 'Spotify', href: 'https://open.spotify.com/intl-pt/artist/6l2XVPCSpXi3oKheB3UvKI', Icon: FaSpotify},
  {label: 'Apple Music', href: 'https://music.apple.com/br/artist/cap%C3%AD-joy/1831439555', Icon: FaApple}
] as const;

export default function Footer() {
  return (
    <footer className="mt-10 border-t py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center">
        <p className="text-sm opacity-80">© Capí Joy 2025 — Todos os direitos reservados.</p>
        <ul className="ml-auto flex items-center gap-3 text-xl text-neutral-600 transition dark:text-neutral-400">
          {SOCIALS.map(({label, href, Icon}) => (
            <li key={label}>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex hover:opacity-80"
              >
                <Icon aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
