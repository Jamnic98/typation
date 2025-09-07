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
    textToType: 'Testing! 123',
    typingWidgetSettings: {
      spaceSymbol: SpaceSymbols.DOT,
      cursorStyle: CursorStyles.UNDERSCORE,
      showBigKeyboard: false,
      showCurrentLetter: false,
      characterAnimationEnabled: true,
      testDuration: 60,
    },
    onStart: () => {},
    onComplete: async () => {},
    onType: () => {},
    reset: () => {},
    typable: true,
  },
}
