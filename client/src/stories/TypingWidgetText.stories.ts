import type { Meta, StoryObj } from '@storybook/react'

import { TypingWidgetText /* , TypingWidgetTextProps */ } from 'components'
import { CursorStyles, SpaceSymbols } from 'types'

const meta = {
  title: 'TypingWidgetText',
  component: TypingWidgetText,
  parameters: {
    layout: 'centered',
  },

  tags: ['autodocs'],
} satisfies Meta<typeof TypingWidgetText>

export default meta

type Story = StoryObj<typeof meta>

export const TypingWidgetTextStory: Story = {
  args: {
    inputRef: null,
    lines: [],
    lineIndex: 0,
    colIndex: 0,
    textToType: 'Testing! 123',
    loadingText: false,
    widgetSettings: {
      spaceSymbol: SpaceSymbols.DOT,
      cursorStyle: CursorStyles.UNDERSCORE,
      showBigKeyboard: false,
      showCurrentLetter: false,
      characterAnimationEnabled: true,
      testDuration: 60,
      minWordLength: 1,
      maxWordLength: 10,
      showProgressBar: true,
    },
    handleKeyDown: () => {},
    useAlwaysFocus: () => {},
  },
}
