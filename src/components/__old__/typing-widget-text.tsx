import { Character, type CharacterProps } from 'components'

const id = 'typing-widget-text'

interface TypingWidgetTextProps {
  displayText: CharacterProps[]
}

const TypingWidgetText = ({ displayText }: TypingWidgetTextProps) => {
  // index of the first space char halfway past the middle of the display text
  const spaceIndex = displayText
    .map((charObj) => {
      return charObj.char
    })
    .indexOf(' ', displayText.length / 2)

  return (
    <div id={id} data-testid={id}>
      {displayText.slice(0, spaceIndex).map((charObj, index) => (
        <Character {...charObj} key={index} />
      ))}
      <wbr />
      {displayText.slice(spaceIndex, Object.values(displayText).length).map((charObj, index) => (
        <Character {...charObj} key={index} />
      ))}
    </div>
  )
}

export default TypingWidgetText
