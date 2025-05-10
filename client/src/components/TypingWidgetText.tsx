import { Character, type CharacterProps } from 'components'

interface TypingWidgetTextProps {
  displayText: CharacterProps[]
}

export const TypingWidgetText = ({ displayText }: TypingWidgetTextProps) => {
  // index of the first space char halfway past the middle of the display text
  // const spaceIndex =
  //   1 + displayText.map((charObj) => charObj.char).indexOf(' ', 1 + displayText.length / 2)

  // return (
  //   <div id={id} data-testid={id}>
  //     {displayText.slice(0, spaceIndex).map((characterProps, index) => (
  //       <Character {...characterProps} key={index} />
  //     ))}
  //     <wbr />
  //     {displayText
  //       .slice(spaceIndex, Object.values(displayText).length)
  //       .map((characterProps, index) => (
  //         <Character {...characterProps} key={index} />
  //       ))}
  //   </div>
  // )

  return (
    <div className="w-fit" data-testid="typing-widget-text">
      {displayText
        // .slice(spaceIndex, Object.values(displayText).length)
        .map((characterProps, index) => (
          <Character {...characterProps} key={index} />
        ))}
    </div>
  )
}
