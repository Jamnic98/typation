import type { Meta, StoryObj } from '@storybook/react'

import { TypingWidgetText } from 'components'
import { TypedStatus } from 'types'

const displayText = [
  {
    char: 'T',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
  },
  {
    char: 'e',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
  },
  {
    char: 's',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
  },
  {
    char: 't',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
  },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
  },
  {
    char: 'T',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
  },
  {
    char: 'e',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
  },
  {
    char: 'x',
    highlighted: false,
    typedStatus: TypedStatus.MISS,
  },
  {
    char: 't',
    highlighted: true,
  },
]

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
    displayText,
  },
}
