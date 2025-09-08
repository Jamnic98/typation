import { useMemo, useState } from 'react'

import { Character } from 'components'
import {
  CursorStyles,
  SpaceSymbols,
  TypedStatus,
  type TypingWidgetSettings as InterfaceSettings,
} from 'types'
import { DEFAULT_SESSION_DURATION } from 'utils'

export type TypingWidgetUIFlags = {
  showBigKeyboard: boolean
  // keystrokeEffectEnabled: boolean
  showCurrentLetter: boolean
  characterAnimationEnabled: boolean
}

export type ComponentSettings = InterfaceSettings &
  TypingWidgetUIFlags & {
    testDuration: number
  }

const DEFAULTS: ComponentSettings = {
  // UI flags
  showBigKeyboard: true,
  // keystrokeEffectEnabled: true,
  showCurrentLetter: true,
  characterAnimationEnabled: true,
  // Font-related
  cursorStyle: CursorStyles.BLOCK,
  spaceSymbol: SpaceSymbols.DOT,
  testDuration: DEFAULT_SESSION_DURATION,
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
      {/* Duration Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Test Duration</h3>
        <select
          className="rounded border px-2 py-1 text-sm"
          value={settings.testDuration}
          onChange={(e) => setSettings((s) => ({ ...s, testDuration: Number(e.target.value) }))}
        >
          <option value={1}>1 second</option>
          <option value={30}>30 seconds</option>
          <option value={60}>60 seconds</option>
          <option value={120}>2 minutes</option>
          <option value={300}>5 minutes</option>
        </select>
      </section>

      {/* Keyboard Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Keyboard</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-700">Show Big Keyboard</span>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, showBigKeyboard: !s.showBigKeyboard }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showBigKeyboard ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showBigKeyboard ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Display Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Display</h3>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-700">Show Current Letter</span>
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, showCurrentLetter: !s.showCurrentLetter }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.showCurrentLetter ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showCurrentLetter ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-700">Enable Character Animation</span>
          <button
            type="button"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                characterAnimationEnabled: !s.characterAnimationEnabled,
              }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.characterAnimationEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.characterAnimationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Font Settings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">Font</h3>
        <div className="flex flex-col gap-4">
          {/* Cursor Style */}
          <div className="flex flex-col gap-2">
            <label className="text-sm">Cursor Style</label>
            <div className="flex items-center gap-4">
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

              {/* Live preview */}
              <div className="flex items-center gap-2 border rounded px-2 py-1 bg-neutral-50">
                <Character
                  char="A"
                  isActive={true} // force show cursor
                  typedStatus={TypedStatus.NONE}
                  typingWidgetSettings={{
                    ...settings,
                    cursorStyle: settings.cursorStyle,
                  }}
                />
                <span className="text-xs text-neutral-500">Preview</span>
              </div>
            </div>
          </div>

          {/* Space Symbol */}
          <div className="flex flex-col gap-2">
            <label className="text-sm">Space Symbol</label>
            <div className="flex items-center gap-4">
              <select
                className="rounded border px-2 py-1 text-sm"
                value={settings.spaceSymbol}
                onChange={handleSpaceSymbol}
              >
                <option value={SpaceSymbols.UNDERSCORE}>Underscore</option>
                <option value={SpaceSymbols.DOT}>Dot</option>
                <option value={SpaceSymbols.NONE}>None</option>
              </select>

              {/* Live preview */}
              <div className="flex items-center gap-2 border rounded px-2 py-1 bg-neutral-50">
                <Character
                  char=" "
                  isActive={false}
                  typedStatus={TypedStatus.NONE}
                  typingWidgetSettings={{
                    ...settings,
                    spaceSymbol: settings.spaceSymbol,
                    characterAnimationEnabled: false,
                  }}
                />
                <span className="text-xs text-neutral-500">Preview</span>
              </div>
            </div>
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
