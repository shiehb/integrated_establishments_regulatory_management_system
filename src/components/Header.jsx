import logo from "../assets/logo1.svg";

export default function Header() {
  return (
    <header className="py-2 bg-white shadow-md text-sky-700">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="DENR-EMB Logo"
              className="object-contain w-14 h-14 md:w-16 md:h-16"
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-xl font-bold md:text-xl">
              Department of Environmental and Natural Resources
            </h1>
            <h1 className="text-sm italic font-semibold md:text-base">
              Environmental Management Bureau
            </h1>
            <h2 className="text-sm font-semibold tracking-wide md:text-sm">
              Integrated Establishment Regulatory Management System
            </h2>
          </div>
        </div>
      </div>
    </header>
  );
}
