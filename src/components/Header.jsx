import logo from "../assets/logo1.svg";

export default function Header() {
  return (
    <header className="bg-white border-b-1 text-sky-700">
      <div className="container px-2 py-1">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="DENR-EMB Logo"
              className="object-contain w-12 h-12 md:w-12 md:h-14"
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-lg font-bold md:text-lg">
              Integrated Establishment Regulatory Management System
            </h1>
            <h1 className="text-xs font-semibold md:text-sm">
              Environmental Management Bureau Region I
            </h1>
            <h2 className="text-xs italic font-semibold tracking-wide md:text-xs">
              Department of Environmental and Natural Resources
            </h2>
          </div>
        </div>
      </div>
    </header>
  );
}
