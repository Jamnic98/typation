import { useMemo, useState } from 'react'

import { CursorStyles, SpaceSymbols, type TypingWidgetSettings as InterfaceSettings } from 'types'

export type TypingWidgetUIFlags = {
  showBigKeyboard: boolean
  // keystrokeEffectEnabled: boolean
  showCurrentLetter: boolean
  characterAnimationEnabled: boolean
}

export type ComponentSettings = InterfaceSettings & TypingWidgetUIFlags

const DEFAULTS: ComponentSettings = {
  // UI flags
  showBigKeyboard: true,
  // keystrokeEffectEnabled: true,
  showCurrentLetter: true,
  characterAnimationEnabled: true,
  // Font-related
  cursorStyle: CursorStyles.BLOCK,
  spaceSymbol: SpaceSymbols.DOT,
  // fontSize: 'base',
  // fontFamily: 'Inter, ui-sans-serif, system-ui',
  // textColor: '#111827', // neutral-900
  // fontWeight: '',
  // textAlign: '',
  // textDecoration: '',
  // textTransform: '',
  // textShadow: '',
  // textOverflow: '',
  // textIndent: '',
  // textJustify: '',
  // textLineHeight: '',
  // textLetterSpacing: '',
  // textWordSpacing: '',
}

/**
 * Controlled settings form for Typation.
 * - Accepts optional initial values and emits a single object on Save.
 * - Uses simple, accessible inputs; swap to shadcn/ui later if you like.
 */
export const TypingWidgetSettings = ({
  initial,
  onSave,
}: {
  initial?: Partial<ComponentSettings>
  onSave?: (settings: ComponentSettings) => void
}) => {
  const initialState = useMemo(() => ({ ...DEFAULTS, ...(initial ?? {}) }), [initial])
  const [settings, setSettings] = useState<ComponentSettings>(initialState)

  const handleCheckbox =
    (key: keyof TypingWidgetUIFlags) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((s) => ({ ...s, [key]: e.target.checked }))
    }

  const handleCursorStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((s) => ({ ...s, cursorStyle: Number(e.target.value) as CursorStyles }))
  }

  const handleSpaceSymbol = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((s) => ({ ...s, spaceSymbol: e.target.value as SpaceSymbols }))
  }

  const handleSubmit = () => {
    onSave?.(settings)
  }

  return (
    <div className="space-y-6 p-4 mt-4">
      {/* Keyboard Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Keyboard</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded cursor-pointer"
              checked={settings.showBigKeyboard}
              onChange={handleCheckbox('showBigKeyboard')}
            />
            Show Big Keyboard
          </label>
        </div>
      </section>

      {/* Display Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Display</h3>
        <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
          <input
            type="checkbox"
            className="rounded cursor-pointer"
            checked={settings.showCurrentLetter}
            onChange={handleCheckbox('showCurrentLetter')}
          />
          Show Current Letter
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
          <input
            type="checkbox"
            className="rounded cursor-pointer"
            checked={settings.characterAnimationEnabled}
            onChange={handleCheckbox('characterAnimationEnabled')}
          />
          Enable Character Animation
        </label>
      </section>

      {/* Font Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Font</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Cursor Style</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={settings.cursorStyle}
              onChange={handleCursorStyle}
            >
              <option value={CursorStyles.UNDERSCORE}>Underscore</option>
              <option value={CursorStyles.BLOCK}>Block</option>
              <option value={CursorStyles.OUTLINE}>Outline</option>
              <option value={CursorStyles.PIPE}>Pipe</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">Space Symbol</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={settings.spaceSymbol}
              onChange={handleSpaceSymbol}
            >
              <option value={SpaceSymbols.UNDERSCORE}>Underscore</option>
              <option value={SpaceSymbols.DOT}>Dot</option>
              <option value={SpaceSymbols.NONE}>None</option>
            </select>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="bg-blue-600 rounded-sm text-white p-2 cursor-pointer mt-2"
        onClick={handleSubmit}
      >
        Save Settings
      </button>
    </div>
  )
}
