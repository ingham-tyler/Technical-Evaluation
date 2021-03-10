const fs = require('fs')
const os = require('os')
const path = require('path')

const processWordList = (wordList) => {
  let trimmedWordList = wordList.replace(/[\s,]+/g, ' ').trim()
  let list = trimmedWordList.split(/\s/)
  let indicesOfPhraseParts = []
  let firstChar, lastChar, lastQuote

  // Grab index of an element that starts or ends with a quote
  list.forEach((element, index) => {
    if (element.length > 1) {
      firstChar = element.slice(0, 1)
      lastChar = element.slice(-1)
    } else {
      firstChar = element
      lastChar = undefined
    }

    if (firstChar === '\'' || firstChar === '\"') {
      // Only add if paired
      if (!lastQuote) {
        indicesOfPhraseParts.push(index)
        lastQuote = firstChar
      } else if (lastQuote === firstChar) {
        indicesOfPhraseParts.push(index)
        lastQuote = undefined
      }
    } else if (lastChar && (lastChar === '\'' || lastChar === '\"')) {
      // Only add if paired
      if (lastChar === lastQuote) {
        indicesOfPhraseParts.push(index)
        lastQuote = undefined
      }
    }
  })

  // Trim index of any trailing quotes
  if (indicesOfPhraseParts.length % 2 !== 0) {
    indicesOfPhraseParts.pop()
  }

  // Only if there were any phrases do we require more processing
  if (indicesOfPhraseParts.length > 0) {
    const numPairs = indicesOfPhraseParts.length / 2
    let phrase = ''
    let phraseList = []
    let start, end, numBetween, bShouldTrimEndingSpace

    // Concatenate phrases
    for(var i = 0; i < numPairs; i++) {
      start = indicesOfPhraseParts[i * 2]
      end = indicesOfPhraseParts[(i * 2) + 1]
      numBetween = end - start + 1

      bShouldTrimEndingSpace = (list[end] === '\'' || list[end] === '\"')

      phraseList = list.splice(start, numBetween)
      phrase = phraseList.join(' ')

      // Remove quotes from phrase
      phrase = phrase.substring(1, phrase.length - 1)

      if (bShouldTrimEndingSpace) {
        phraseList = phrase.split(' ')
        phraseList.pop()
        phrase = phraseList.join(' ')
      }

      list.push(phrase)

      // Correct for changing list size
      for (var j = 0; j < indicesOfPhraseParts.length; j++) {
        indicesOfPhraseParts[j] -= numBetween
      }
    }
  }

  // Remove single/unpaired quotes from list
  let indicesOfUnpairedQuotes = []

  list.forEach((element, index) => {
    if (element === '\'' || element === '\"') {
      indicesOfUnpairedQuotes.push(index)
    }
  })

  for (var i = 0; i < indicesOfUnpairedQuotes.length; i++) {
    list.splice(indicesOfUnpairedQuotes[i], 1)
    // Correct for changing list size
    for (var j = i + 1; j < indicesOfUnpairedQuotes.length; j++) {
      indicesOfUnpairedQuotes[j] -= 1
    } 
  }

  return list
}

exports.redact = (wordList, filePath) => {
  let phrasesToRedact = processWordList(wordList)

  // Find file to redact
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.log('Error reading file:\n', err)
      throw err
    }

    phrasesToRedact.forEach(element => {
      let regex = new RegExp(`(\\b)${element}(\\b)`, 'ig')
      let replaceStr = ''
      
      for (var i = 0; i < element.length; i++) {
        element[i] === ' ' ? replaceStr += ' ' : replaceStr += 'X'
      }

      data = data.replaceAll(regex, replaceStr)
    })

    let filePathToRedactedText = path.join(os.homedir(), 'Desktop/redacted.txt')
    fs.writeFile(filePathToRedactedText, data, 'utf-8', err => {
      if (err) {
        console.log('Error writing to file:\n', err)
        throw err
      }
    })
  })
}
