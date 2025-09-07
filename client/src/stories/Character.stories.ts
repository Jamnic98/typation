import type { Meta, StoryObj } from '@storybook/react'

import { Character } from 'components'
import { CursorStyles, FontSizes, TypedStatus } from 'types'

const meta = {
  title: 'Character',
  component: Character,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    char: {
      control: 'text',
      description: 'The character to display',
      defaultValue: 'a',
    },
    isActive: {
      control: 'boolean',
      description: 'Whether the character is isActive',
      defaultValue: false,
    },
    typedStatus: {
      control: 'select',
      options: Object.values(TypedStatus),
      description: 'The status of the character (miss, hit, none)',
      defaultValue: TypedStatus.NONE,
    },
    typingWidgetSettings: {
      control: 'object',
      description: 'Font settings for the character',
      defaultValue: {
        cursorStyle: CursorStyles.BLOCK,
        fontSize: FontSizes.MD,
      },
    },
  },

  tags: ['autodocs'],
} satisfies Meta<typeof Character>

export default meta

type Story = StoryObj<typeof meta>

export const Miss: Story = {
  args: {
    char: 'm',
    isActive: false,
    typedStatus: TypedStatus.MISS,
  },
}

export const Hit: Story = {
  args: {
    char: 'h',
    isActive: false,
    typedStatus: TypedStatus.HIT,
  },
}

export const Space: Story = {
  args: {
    char: ' ',
    isActive: false,
    typedStatus: TypedStatus.NONE,
  },
}

export const Highlighted: Story = {
  args: {
    char: 'H',
    isActive: true,
    typedStatus: TypedStatus.NONE,
  },
}
