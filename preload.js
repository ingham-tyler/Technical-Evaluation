const { ipcRenderer } = require('electron')

const { redact } = require('./redactor')

window.addEventListener('DOMContentLoaded', () => {
  const quitBtn = document.getElementById('quit-btn')

  if (quitBtn) {
    quitBtn.addEventListener('click', () => ipcRenderer.send('app-quit'))
  }

  const progressBar = document.getElementById('progress-bar')
  const startBtn = document.getElementById('start-btn')
  const errorModalCloseBtn = document.getElementById('error-modal-close-btn')
  const errorModal = document.getElementById('error-modal')

  if (errorModalCloseBtn && errorModal) {
    errorModalCloseBtn.addEventListener('click', () => { errorModal.classList.remove('is-active') })
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      let wordList, filePath

      wordList = document.getElementById('key-words-input')
      filePath = document.getElementById('file-path-input')
      

      if (!wordList || !filePath) {
        // do something
        console.log(':(')
      } else {
        if (!(wordList.value) || !(filePath.value)) {
          // do something

          errorModal.classList.add('is-active')
        } else {
          redact(wordList.value, filePath.value)
        }
      }
    })
  }
})
