import type { Meta, StoryObj } from '@storybook/react'

import { Character } from 'components'
import { CursorStyles, spaceSymbolMap, SpaceSymbols, TypedStatus } from 'types'

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
    characterAnimationEnabled: false,
    cursorStyle: CursorStyles.UNDERSCORE,
    spaceSymbol: spaceSymbolMap[SpaceSymbols.UNDERSCORE],
  },
}

export const Hit: Story = {
  args: {
    char: 'h',
    isActive: false,
    typedStatus: TypedStatus.HIT,
    characterAnimationEnabled: false,
    cursorStyle: CursorStyles.UNDERSCORE,
    spaceSymbol: spaceSymbolMap[SpaceSymbols.UNDERSCORE],
  },
}

export const Space: Story = {
  args: {
    char: ' ',
    isActive: false,
    typedStatus: TypedStatus.NONE,
    characterAnimationEnabled: false,
    cursorStyle: CursorStyles.UNDERSCORE,
    spaceSymbol: spaceSymbolMap[SpaceSymbols.UNDERSCORE],
  },
}

export const Highlighted: Story = {
  args: {
    char: 'H',
    isActive: true,
    typedStatus: TypedStatus.NONE,
    characterAnimationEnabled: false,
    cursorStyle: CursorStyles.UNDERSCORE,
    spaceSymbol: spaceSymbolMap[SpaceSymbols.UNDERSCORE],
  },
}
