import { useState, useRef, useEffect, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ChatMessage } from '../types'

export default function TrainingPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 加载历史消息
  useEffect(() => {
    if (sessionId) {
      fetch(`/api/training/history/${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.messages) setMessages(data.messages)
        })
        .catch(() => {})
    }
  }, [sessionId])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading || !sessionId) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/training/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ sessionId, message: userMsg }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${data.message}` }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ 网络错误，请检查后端服务' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-sm">
      {/* 顶栏 */}
      <div className="flex items-center px-4 py-3 border-b bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 mr-3 text-xl"
        >
          ←
        </button>
        <div>
          <h1 className="font-semibold text-gray-800 text-sm">🦐 销冠AI教练</h1>
          <p className="text-xs text-gray-400">模拟训练中</p>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-3">🦐</p>
            <p className="text-sm">教练已就位，开始对话吧！</p>
            <p className="text-xs mt-1">AI会模拟客户与你对话，每次回答后点评指导</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'coach' : ''}`}
          >
            {msg.role === 'assistant' && (
              <span className="text-xs text-blue-500 font-medium block mb-1">🏆 AI教练</span>
            )}
            {msg.role === 'user' && (
              <span className="text-xs text-blue-200 block mb-1">你</span>
            )}
            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-message coach">
            <span className="text-xs text-blue-500 font-medium block mb-1">🏆 AI教练</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSend} className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入你的销售话术..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl transition text-sm font-medium"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  )
}
