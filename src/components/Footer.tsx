// import ThemeSwitch from "#/components/ThemeSwitch";

export default function Footer() {
  return (
    <footer className="p-4 md:p-8 flex flex-col items-center justify-center">
      {/* <ThemeSwitch expanded /> */}
      <div className="grid sm:grid-cols-12 gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-50 sm:max-w-400 text-xs opacity-40">
        <div className="sm:col-span-3 self-start">
          <img
            src="/logos/datacommons-logo-white.svg"
            alt="EOSC DataCommons"
            className="invert dark:invert-0 grayscale"
          />
        </div>

        <div className="sm:col-span-2 self-start">
          <img src="/logos/logo-dans-rgb.svg" alt="DANS" className="grayscale" />
        </div>

        <div className="sm:col-span-3 lg:self-start flex flex-col xl:flex-row items-start gap-4">
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

        <div className="sm:col-span-4 lg:self-start flex flex-col xl:flex-row items-start gap-4">
          <img
            src="/logos/EN_FundedbytheEU_RGB_NEG.svg"
            alt="Funded by the European Union"
            className="grayscale invert dark:invert-0 max-w-56"
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
