export const TypingWidgetSettings = () => {
  const handleClickSubmit: any = () => {}

  return (
    <div className="space-y-6 p-4 mt-4">
      {/* Keyboard Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Keyboard</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input type="checkbox" className="rounded" /> Hide Big Keyboard
          </label>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-700">Keystroke Effect</label>
            <select className="rounded border px-2 py-1 text-sm outline-none">
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </section>

      {/* Display Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Display</h3>
        <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
          <input type="checkbox" className="rounded cursor-pointer" /> Show Current Letter
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
          <input type="checkbox" className="rounded cursor-pointer" /> Enable Character Animation
        </label>
      </section>

      {/* Font Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Font</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Cursor Style</label>
            <select className="rounded border px-2 py-1 text-sm">
              <option value="UNDERSCORE">Underscore</option>
              <option value="BLOCK">Block</option>
              <option value="OUTLINE">Outline</option>
              <option value="PIPE">Pipe</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">Space Symbol</label>
            <select className="rounded border px-2 py-1 text-sm">
              <option value="UNDERSCORE">Underscore</option>
              <option value="DOT">Dot</option>
              <option value="NONE">None</option>
            </select>
          </div>

          {/* <div className="flex flex-col gap-1">
            <label className="text-sm">Font Size</label>
            <select className="rounded border px-2 py-1 text-sm">
              <option value="sm">Small</option>
              <option value="base">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">Font Family</label>
            <input
              type="text"
              placeholder="e.g. 'Inter'"
              className="rounded border px-2 py-1 text-sm"
            />
          </div> */}
        </div>
      </section>

      <button
        type="submit"
        className="bg-blue-600 rounded-sm text-white p-2 cursor-pointer mt-2"
        onClick={handleClickSubmit()}
      >
        Save Settings
      </button>
    </div>
  )
}
