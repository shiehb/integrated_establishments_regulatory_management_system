export default function Footer() {
  return (
    <footer className="py-2 text-center text-white bg-sky-900">
      <p className="text-xs">
        © {new Date().getFullYear()} DENR-Environmental Management Bureau |
        Region 1. All rights reserved.
      </p>
    </footer>
  );
}
