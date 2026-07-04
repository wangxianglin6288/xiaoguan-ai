import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AnalysisPage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ score: number; analysis: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function submitForAnalysis(textToSubmit: string) {
    if (!textToSubmit.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/analysis/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user.id || '1',
          text: textToSubmit,
          duration: 0,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ score: data.score, analysis: data.analysis })
        loadHistory()
      } else {
        alert(data.message || '分析失败')
      }
    } catch {
      alert('网络错误，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch(`/api/analysis/history/${user.id || '1'}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (res.ok) setHistory(data.analyses || [])
    } catch {}
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 语音转文字需要对接 STT API（如 Whisper 或阿里云语音识别）
    // MVP: 提示用户手动输入文字
    alert('🎙️ 语音文件已接收！\n\n语音转文字功能需要对接 STT 服务（如 Whisper API）。\n当前版本可以先输入文字内容进行分析。')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function toggleHistory() {
    if (!showHistory) loadHistory()
    setShowHistory(!showHistory)
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">🎙️ 销售语音分析</h1>
            <p className="text-sm text-gray-400">上传销售对话，AI教练分析评分</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 输入区 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 语音上传 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">📁 上传录音文件</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mt-2">
              ⚡ 支持 mp3/wav/m4a 格式，语音自动转文字分析（需配置语音识别服务）
            </p>
          </div>

          {/* 文字输入 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">📝 或输入对话内容</h2>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="粘贴你的销售对话内容，AI教练会从5个维度评分并给出改进建议&#10;&#10;示例：&#10;销售：王总您好，我是XX公司的李明，之前跟您联系过的。&#10;客户：嗯，我记得。&#10;销售：关于我们那套CRM系统，您这边有什么使用上的反馈吗？"
            />
            <button
              onClick={() => submitForAnalysis(text)}
              disabled={loading || !text.trim()}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl transition font-medium"
            >
              {loading ? '🔄 AI分析中...' : '🚀 提交分析'}
            </button>
          </div>
        </div>

        {/* 右侧：分析结果 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 实时结果 */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-4xl mb-3 animate-pulse">🤔</p>
              <p className="text-gray-500 text-sm">AI教练正在分析你的销售对话...</p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-1">综合评分</p>
                <p className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </p>
                <p className="text-sm text-gray-400">/ 100</p>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {result.analysis.split('\n').map((line, i) => (
                  <p key={i} className="my-1">{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          )}

          {/* 历史记录 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <button
              onClick={toggleHistory}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition flex justify-between"
            >
              <span>📋 分析历史</span>
              <span>{showHistory ? '▲' : '▼'}</span>
            </button>
            {showHistory && (
              <div className="px-4 pb-4 max-h-60 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">暂无分析记录</p>
                ) : (
                  history.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 px-2 rounded"
                      onClick={() => setResult({ score: item.score, analysis: item.analysis })}
                    >
                      <span className="text-sm text-gray-600 truncate max-w-[70%]">
                        {item.text.slice(0, 30)}...
                      </span>
                      <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                        {item.score}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
