import type { Meta, StoryObj } from '@storybook/react'

import { TypingWidgetText } from 'components'
import { SpaceSymbol, TypedStatus } from 'types'

const displayText = [
  { char: 'T', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'h', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'e', highlighted: false, typedStatus: TypedStatus.MISS },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.MISS,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 'q', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'u', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'i', highlighted: false, typedStatus: TypedStatus.MISS },
  { char: 'c', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'k', highlighted: false, typedStatus: TypedStatus.HIT },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 'b', highlighted: false, typedStatus: TypedStatus.MISS },
  { char: 'r', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'o', highlighted: false, typedStatus: TypedStatus.MISS },
  { char: 'w', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'n', highlighted: false, typedStatus: TypedStatus.HIT },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 'f', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'o', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'x', highlighted: false, typedStatus: TypedStatus.HIT },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 'j', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'u', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'm', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'p', highlighted: false, typedStatus: TypedStatus.MISS },
  { char: 's', highlighted: false, typedStatus: TypedStatus.HIT },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.MISS,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 'o', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'v', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'e', highlighted: false, typedStatus: TypedStatus.MISS },
  { char: 'r', highlighted: false, typedStatus: TypedStatus.MISS },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 't', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'h', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'e', highlighted: false, typedStatus: TypedStatus.HIT },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 'l', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'a', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'z', highlighted: false, typedStatus: TypedStatus.HIT },
  { char: 'y', highlighted: false, typedStatus: TypedStatus.HIT },
  {
    char: ' ',
    highlighted: false,
    typedStatus: TypedStatus.HIT,
    spaceSymbol: SpaceSymbol.MIDDLE_DOT,
  },
  { char: 'd', highlighted: false, typedStatus: TypedStatus.MISS },
  { char: 'o', highlighted: true },
  { char: 'g', highlighted: false },
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
