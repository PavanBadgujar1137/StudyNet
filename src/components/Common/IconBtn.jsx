export default function IconBtn({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}) {
  return (
    <button
      disabled={disabled}
      onClick={onclick}
      className={`flex items-center gap-x-2 rounded-lg px-5 py-2 font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        outline
          ? "border border-gold-500 bg-transparent text-gold-500 hover:bg-gold-500/10"
          : "bg-gold-500 text-ink-900 hover:bg-gold-300"
      } ${customClasses}`}
      type={type}
    >
      {children ? (
        <>
          <span>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  )
}