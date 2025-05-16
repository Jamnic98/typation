import type { Meta, StoryObj } from '@storybook/react'

import { TypingWidgetText /* , TypingWidgetTextProps */ } from 'components'
import { CursorStyles, SpaceSymbols } from 'types/global'

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
    fetchNewString: async () => {
      return 'The quick brown fox jumps over the lazy dog'
    },
    fontSettings: {
      spaceSymbol: SpaceSymbols.MIDDLE_DOT,
      cursorStyle: CursorStyles.UNDERSCORE,
    },
  },
}
