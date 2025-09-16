import React, { useRef, useState } from 'react'
import { Bold, Italic, Type, Smile } from 'lucide-react'

const RichTextEditor = ({ value, onChange, placeholder = "What's on your mind?" }) => {
  const textareaRef = useRef(null)
  const [showEmojis, setShowEmojis] = useState(false)

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
    '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '👏',
    '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '👎', '👍', '👌',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
    '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
    '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
    '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
    '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
    '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
    'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂',
    '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶',
    '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒',
    '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣',
    '8️⃣', '9️⃣', '🔟'
  ]

  const insertText = (text) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + text + value.substring(end)
    onChange(newValue)
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const formatText = (format) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let formattedText = ''
    let newCursorStart = start
    let newCursorEnd = end
    
    // Check if text is already formatted
    const isAlreadyFormatted = (tag) => {
      const beforeText = value.substring(Math.max(0, start - tag.length - 1), start)
      const afterText = value.substring(end, Math.min(value.length, end + tag.length + 2))
      return beforeText.endsWith(`<${tag}>`) && afterText.startsWith(`</${tag}>`)
    }
    
    switch (format) {
      case 'bold':
        if (isAlreadyFormatted('b')) {
          // Remove formatting
          const beforeTag = value.substring(0, start - 3)
          const afterTag = value.substring(end + 4)
          formattedText = selectedText
          newCursorStart = start - 3
          newCursorEnd = end - 3
          const newValue = beforeTag + formattedText + afterTag
          onChange(newValue)
        } else {
          // Add formatting
          formattedText = `<b>${selectedText || 'bold text'}</b>`
          newCursorStart = start + 3
          newCursorEnd = start + 3 + (selectedText || 'bold text').length
          const newValue = value.substring(0, start) + formattedText + value.substring(end)
          onChange(newValue)
        }
        break
      case 'italic':
        if (isAlreadyFormatted('i')) {
          // Remove formatting
          const beforeTag = value.substring(0, start - 3)
          const afterTag = value.substring(end + 4)
          formattedText = selectedText
          newCursorStart = start - 3
          newCursorEnd = end - 3
          const newValue = beforeTag + formattedText + afterTag
          onChange(newValue)
        } else {
          // Add formatting
          formattedText = `<i>${selectedText || 'italic text'}</i>`
          newCursorStart = start + 3
          newCursorEnd = start + 3 + (selectedText || 'italic text').length
          const newValue = value.substring(0, start) + formattedText + value.substring(end)
          onChange(newValue)
        }
        break
      case 'header':
        if (isAlreadyFormatted('strong')) {
          // Remove formatting
          const beforeTag = value.substring(0, start - 8)
          const afterTag = value.substring(end + 9)
          formattedText = selectedText
          newCursorStart = start - 8
          newCursorEnd = end - 8
          const newValue = beforeTag + formattedText + afterTag
          onChange(newValue)
        } else {
          // Add formatting
          formattedText = `<strong>${selectedText || 'Header Text'}</strong>`
          newCursorStart = start + 8
          newCursorEnd = start + 8 + (selectedText || 'Header Text').length
          const newValue = value.substring(0, start) + formattedText + value.substring(end)
          onChange(newValue)
        }
        break
      default:
        return
    }
    
    // Set cursor position after formatted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
    }, 0)
  }

  const insertEmoji = (emoji) => {
    insertText(emoji)
    setShowEmojis(false)
  }

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex items-center space-x-1 p-2 bg-dark-800/50 rounded-lg border border-dark-600">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 hover:bg-primary-500/20 hover:text-primary-400 rounded transition-all duration-200 group"
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} className="text-gray-300 group-hover:text-primary-400" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 hover:bg-primary-500/20 hover:text-primary-400 rounded transition-all duration-200 group"
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} className="text-gray-300 group-hover:text-primary-400" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('header')}
          className="p-2 hover:bg-primary-500/20 hover:text-primary-400 rounded transition-all duration-200 group"
          title="Header (Ctrl+H)"
        >
          <Type size={16} className="text-gray-300 group-hover:text-primary-400" />
        </button>
        
        <div className="w-px h-6 bg-dark-600 mx-2"></div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-2 hover:bg-primary-500/20 hover:text-primary-400 rounded transition-all duration-200 group"
            title="Emojis"
          >
            <Smile size={16} className="text-gray-300 group-hover:text-primary-400" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojis && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto w-80">
              <div className="grid grid-cols-10 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-primary-500/20 rounded text-lg transition-colors hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 ml-auto">
          Select text and click buttons to format
        </div>
      </div>
      
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="input-field resize-none"
      />
    </div>
  )
}

export default RichTextEditor
