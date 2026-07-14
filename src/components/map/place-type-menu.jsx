import { PLACE_STATUS } from "@/lib/places";

function stopMapEvent(event) {
  event.stopPropagation();
}

export function PlaceTypeMenu({ onSelect, onCancel, loading }) {
  function handleCancel(event) {
    stopMapEvent(event);
    onCancel();
  }

  function handleSelect(event, value) {
    stopMapEvent(event);
    onSelect(value);
  }

  return (
    <div
      className="min-w-[180px] space-y-2"
      onClick={stopMapEvent}
      onMouseDown={stopMapEvent}
    >
      <p className="text-sm font-semibold text-zinc-900">¿Qué es este lugar?</p>
      <div className="flex flex-col gap-2">
        {Object.entries(PLACE_STATUS).map(([value, option]) => (
          <button
            key={value}
            type="button"
            disabled={loading}
            onClick={(event) => handleSelect(event, value)}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:border-rose-200 hover:bg-rose-50 disabled:opacity-60"
          >
            <span
              className="h-3 w-3 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: option.mapColor }}
            />
            {option.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={handleCancel}
        className="w-full rounded-xl px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
      >
        Cancelar
      </button>
    </div>
  );
}
