export default function Footer() {
  return (
    <footer className="py-2 text-center text-white bg-sky-700">
      <p className="text-xs">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">
          Department of Environment and Natural Resources – Region I
          (Environmental Management Bureau)
        </span>
        . All rights reserved.
      </p>
    </footer>
  );
}
