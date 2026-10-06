// import ThemeSwitch from "#/components/ThemeSwitch";

export default function Footer() {
  return (
    <footer className="p-4 lg:p-4 flex flex-col items-center justify-center">
      {/* <ThemeSwitch expanded /> */}
      <div className="grid sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-8 max-w-xs sm:max-w-xl lg:max-w-5xl xl:max-w-400 text-xs opacity-40">
        <div className="sm:col-span-3 lg:col-span-2 self-start">
          <img
            src="/logos/datacommons-logo-white.svg"
            alt="EOSC DataCommons"
            className="invert dark:invert-0 grayscale"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1 self-start">
          <img src="/logos/logo-dans-rgb.svg" alt="DANS" className="grayscale" />
        </div>
        <div className="sm:col-span-3 flex items-start gap-4 lg:col-span-3 lg:self-start">
          <img
            src="/logos/SURF_diap.svg"
            alt="SURF"
            className="w-34 invert dark:invert-0 grayscale"
          />
          <p className="mb-0 leading-4">
            This work used the Dutch national e-infrastructure with the support of the SURF
            Cooperative using grant no. EINF-17782.
          </p>
        </div>
        <div className="sm:col-span-2 lg:col-span-2 xl:col-span-4 lg:self-start flex flex-col xl:flex-row items-start gap-4">
          <img
            src="/logos/EN_FundedbytheEU_RGB_NEG.svg"
            alt="Funded by the European Union"
            className="grayscale invert dark:invert-0 xl:w-50"
          />
          <p className="mb-0 leading-4">
            This work has received funding from the European Union’s Horizon Europe research and
            innovation programme through the EOSC Data Commons project under Grant Agreement No.
            101188179.
          </p>
        </div>
      </div>
    </footer>
  );
}
