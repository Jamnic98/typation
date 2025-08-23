import { type CharacterProps } from 'components'

import { TypedStatus } from 'types'

export function resetTypedArray(text: string): CharacterProps[] {
  return text.split('').map((char) => ({
    char,
    typedStatus: TypedStatus.NONE,
    isActive: false,
  }))
}

export function applyCharInput(
  charObjArray: CharacterProps[],
  cursorIndex: number,
  key: string,
  textToType: string
) {
  const updated = [...charObjArray]
  const expected = textToType[cursorIndex]
  const isHit = expected === key

  updated[cursorIndex] = {
    ...updated[cursorIndex],
    typedStatus: isHit ? TypedStatus.HIT : TypedStatus.MISS,
    ...(isHit ? {} : { typedChar: key }),
  }

  return {
    newArray: updated,
    newCursor: cursorIndex + 1,
    typedStatus: updated[cursorIndex].typedStatus,
  }
}

export function applyBackspace(
  charObjArray: CharacterProps[],
  cursorIndex: number,
  ctrl: boolean,
  textToType: string
) {
  if (cursorIndex === 0) return { newArray: charObjArray, newCursor: cursorIndex }

  const prevIndex = cursorIndex - 1
  const prevChar = charObjArray[prevIndex]
  let updated = [...charObjArray]

  if (ctrl) {
    if (prevChar.typedStatus !== TypedStatus.MISS) {
      return { newArray: charObjArray, newCursor: cursorIndex }
    }

    // walk backwards until first non-miss
    let deleteFrom = prevIndex
    while (deleteFrom > 0 && updated[deleteFrom - 1].typedStatus === TypedStatus.MISS) {
      deleteFrom--
    }

    updated = updated.map((c, i) =>
      i >= deleteFrom && i <= prevIndex
        ? { ...c, char: textToType[i], typedStatus: TypedStatus.PENDING }
        : c
    )

    return { newArray: updated, newCursor: deleteFrom }
  } else {
    if (prevChar.typedStatus !== TypedStatus.MISS) {
      return { newArray: charObjArray, newCursor: cursorIndex }
    }

    updated[prevIndex] = {
      ...updated[prevIndex],
      char: textToType[prevIndex],
      typedStatus: TypedStatus.PENDING,
    }

    return { newArray: updated, newCursor: prevIndex }
  }
}
