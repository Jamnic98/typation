import { useState } from 'react'
import { Keyboard, Type, Play, BarChart, Settings2 } from 'lucide-react'

import { ComponentSettings, TypingWidgetSettings, WordLengthSlider } from 'components'

type QuickSettingsBarProps = {
  settings: ComponentSettings
  onChange: (next: ComponentSettings) => void
}

export const Toolbar = ({ settings, onChange }: QuickSettingsBarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localSlider, setLocalSlider] = useState<[number, number]>([
    settings.minWordLength,
    settings.maxWordLength,
  ])

  const toggle = (key: keyof ComponentSettings) => {
    onChange({ ...settings, [key]: !settings[key] })
  }

  const handleSliderChange = (min: number, max: number) => {
    // update local slider immediately for smooth dragging
    setLocalSlider([min, max])
  }

  const handleSliderCommit = () => {
    // commit final values to the main settings when dragging ends
    onChange({ ...settings, minWordLength: localSlider[0], maxWordLength: localSlider[1] })
  }

  return (
    <>
      <div className="flex items-center gap-4 bg-white rounded-md shadow-sm py-1 px-2">
        {/* Min/Max slider */}
        <div className="flex-1 px-2 min-w-42">
          <WordLengthSlider
            min={localSlider[0]}
            max={localSlider[1]}
            size="small"
            onChange={handleSliderChange}
            onCommit={handleSliderCommit}
          />
        </div>

        {/* Quick toggles */}
        <div className="space-x-2">
          {/* Big Letter */}
          <button
            onClick={() => toggle('showCurrentLetter')}
            title="Show Current Letter"
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              settings.showCurrentLetter ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'
            }`}
          >
            <Type size={14} />
          </button>

          <button
            onClick={() => toggle('characterAnimationEnabled')}
            title="Character Animation"
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              settings.characterAnimationEnabled
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-500'
            }`}
          >
            <Play size={14} />
          </button>

          {/* Show Keyboard */}
          <button
            onClick={() => toggle('showBigKeyboard')}
            title="Show Big Keyboard"
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              settings.showBigKeyboard ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'
            }`}
          >
            <Keyboard size={14} />
          </button>

          {/* Progress bar */}
          <button
            onClick={() => toggle('showProgressBar')}
            title="Show Progress Bar"
            className={`p-2 rounded-md transition-colors cursor-pointer  ${
              settings.showProgressBar ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'
            }`}
          >
            <BarChart size={14} />
          </button>
        </div>

        {/* Full settings button */}
        <button
          onClick={() => setIsModalOpen(true)}
          title="Full Settings"
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 cursor-pointer"
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* Full settings modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/30 mb-0">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full relative shadow-2xl">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:bg-gray-100 rounded-md w-8 h-8"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-2">Typing Settings</h2>
            <TypingWidgetSettings
              initial={settings}
              onSave={(next) => {
                onChange(next)
                setIsModalOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
