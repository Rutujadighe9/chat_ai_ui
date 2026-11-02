export default function Brand({ className = "" }) {
  return (
    <a className={`brand ${className}`} href="#" aria-label="Nova home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>nova</span>
    </a>
  );
}
