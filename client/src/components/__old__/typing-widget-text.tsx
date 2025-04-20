// import { Character } from 'components'
// import './typing-widget-text.css'

const ID = 'typing-widget-text'

// interface TypingWidgetTextProps {
//   displayText: { character: string; typedStatus: string; highlighted: boolean }[]
// }

const TypingWidgetText = (/* props: TypingWidgetTextProps */) => {
  // const { displayText } = props

  // index of the first space char halfway past the middle of the display text
  // const spaceIndex =
  //   displayText
  //     .map((charObj) => {
  //       return charObj.character
  //     })
  //     .indexOf(' ', Object.values(displayText).length / 2) + 1

  return (
    <div id={ID} data-testid={ID}>
      {/* {displayText.slice(0, spaceIndex).map((charObj, index) => (
        <Character key={index} charObj={charObj} />
      ))}
      <wbr />
      {displayText.slice(spaceIndex, Object.values(displayText).length).map((charObj, index) => (
        <Character key={index} charObj={charObj} />
      ))} */}
    </div>
  )
}

export default TypingWidgetText
