export default function Footer(){
  return (
    <footer className="border-t border-neutral-800/60 py-10 mt-20">
      <div className="container text-sm text-neutral-400">
        © Capi Joy {new Date().getFullYear()} — Todos os direitos reservados.
      </div>
    </footer>
  );
}
