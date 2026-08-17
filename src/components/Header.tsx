import { m } from "@/paraglide/messages";

export default function Header() {
  return (
    <header className="bg-linear-to-b from-slate-300 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-black dark:text-white">
      <div className="mx-auto w-180 max-w-full px-4 py-8">
        <h1 className="text-4xl font-bold">{m.homeHeader()}</h1>
        <p className="text-slate-800 dark:text-slate-300 mb-0">{m.homeDescription()}</p>
      </div>
    </header>
  );
}
