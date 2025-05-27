import type { Meta, StoryObj } from '@storybook/react'

import { StopWatch } from 'components'
// import { CursorStyles, FontSizes, TypedStatus } from 'types'

const meta = {
  title: 'StopWatch',
  component: StopWatch,
  parameters: {
    layout: 'centered',
  },
  argTypes: {},

  tags: ['autodocs'],
} satisfies Meta<typeof StopWatch>

export default meta

type Story = StoryObj<typeof meta>

export const StopWatchStory: Story = {
  args: {
    time: 6000,
  },
  tags: ['autodocs'],
}
