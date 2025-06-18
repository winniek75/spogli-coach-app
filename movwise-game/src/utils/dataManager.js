export const exportLearningData = (data) => {
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `movwise_grammar_data_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export const importLearningData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('データの取り込みに失敗しました'))
      }
    }
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'))
    }
    reader.readAsText(file)
  })
}

export const validateData = (data) => {
  const requiredFields = ['progress', 'settings', 'achievements', 'gameState']
  return requiredFields.every(field => data.hasOwnProperty(field))
}

export const showFeedback = (message, type = 'success') => {
  const feedbackElement = document.createElement('div')
  feedbackElement.className = `feedback ${type}-feedback`
  feedbackElement.textContent = message
  document.body.appendChild(feedbackElement)

  setTimeout(() => {
    document.body.removeChild(feedbackElement)
  }, 3000)
} 