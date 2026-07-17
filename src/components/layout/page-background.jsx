export function PageBackground({ children }) {
  return (
    <div
      className="relative min-h-screen flex-1 bg-cover bg-[85%_40%] bg-no-repeat md:bg-center"
      style={{ backgroundImage: "url('/background-proyecto.jpeg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-rose-50/70 to-indigo-50/80" />
      <div className="relative">{children}</div>
    </div>
  );
}
