export default function Tab({ tabData, field, setField }) {
  return (
    <div className="my-6 flex max-w-max gap-x-1 rounded-full border border-ink-600 bg-ink-800 p-1">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setField(tab.type)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-150 ${
            field === tab.type
              ? "bg-gold-500 text-ink-900"
              : "bg-transparent text-ink-200 hover:text-ink-100"
          }`}
        >
          {tab?.tabName}
        </button>
      ))}
    </div>
  );
}