// Shared visual pieces for the login/signup pages: the blurred blue gradient
// background, the circular icon badge, the underlined input fields, and the
// line-icon set, matching the provided reference design.

export function AuthBackground({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#1b3a6b]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-sky-400/40 blur-[110px]" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-blue-600/50 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 w-[28rem] h-[28rem] rounded-full bg-indigo-500/40 blur-[120px]" />
      </div>
      {children}
    </div>
  );
}

export function AuthIconBadge({ children }) {
  return (
    <div className="w-20 h-20 rounded-full bg-[#0b2654] border border-white/20 flex items-center justify-center mb-5 shadow-lg">
      {children}
    </div>
  );
}

export function AuthTitle({ children }) {
  return <h1 className="text-white/90 text-lg tracking-[0.25em] font-light mb-8">{children}</h1>;
}

export function AuthButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full mt-8 bg-[#0b2654] hover:bg-[#0f3270] text-white tracking-[0.2em] text-sm font-medium py-3 transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function FormField({ icon, value, onChange, placeholder, type }) {
  return (
    <div className="flex items-end gap-3 border-b border-white/40 pb-2">
      <span className="text-white/80">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="flex-1 bg-transparent text-white placeholder-white/60 focus:outline-none text-[15px]"
      />
    </div>
  );
}

export function UserIcon({ small }) {
  const size = small ? 18 : 34;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
