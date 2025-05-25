import type { Meta, StoryObj } from '@storybook/react'

import { StopWatch } from 'components'
// import { CursorStyles, FontSizes, TypedStatus } from 'types'

const meta = {
  title: 'StopWatch',
  component: StopWatch,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // char: {
    //   control: 'text',
    //   description: 'The StopWatch to display',
    //   defaultValue: 'a',
    // },
    // highlighted: {
    //   control: 'boolean',
    //   description: 'Whether the character is highlighted',
    //   defaultValue: false,
    // },
    // typedStatus: {
    //   control: 'select',
    //   options: Object.values(TypedStatus),
    //   description: 'The status of the character (miss, hit, none)',
    //   defaultValue: TypedStatus.NONE,
    // },
    // fontSettings: {
    //   control: 'object',
    //   description: 'Font settings for the character',
    //   defaultValue: {
    //     cursorStyle: CursorStyles.BLOCK,
    //     fontSize: FontSizes.MD,
    //   },
    // },
  },

  tags: ['autodocs'],
} satisfies Meta<typeof StopWatch>

export default meta

type Story = StoryObj<typeof meta>

export const StopWatchStory: Story = {
  args: {
    time: 6000,
    // setTime: (time: number) => time,
    // isRunning: false,
    // char: 'm',
    // highlighted: false,
    // typedStatus: TypedStatus.MISS,
    // fontSettings: {
    //   cursorStyle: CursorStyles.BLOCK,
    //   fontSize: FontSizes.MD,
    // },
  },
  tags: ['autodocs'],
}
