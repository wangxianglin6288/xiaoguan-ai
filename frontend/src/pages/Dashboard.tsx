import { useNavigate } from 'react-router-dom'
import { useState, FormEvent } from 'react'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [industry, setIndustry] = useState('科技产品销售')
  const [scenario, setScenario] = useState('初次接触客户')
  const [difficulty, setDifficulty] = useState('beginner')

  async function startTraining(e: FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/training/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user.id || '1',
          industry,
          scenario,
          difficulty,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        navigate(`/training/${data.sessionId}`)
      }
    } catch (err) {
      alert('启动训练失败，请检查后端服务是否运行')
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🦐 销冠AI训练</h1>
          <p className="text-gray-500 text-sm mt-1">欢迎回来，{user.name || '销售人员'}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate('/analysis')}
            className="text-sm text-blue-600 hover:bg-blue-50 transition px-4 py-2 rounded-lg"
          >
            🎙️ 语音分析
          </button>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500 transition px-4 py-2 rounded-lg hover:bg-red-50"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 设置训练 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 开始训练</h2>
        <form onSubmit={startTraining} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">行业</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>科技产品销售</option>
                <option>金融保险</option>
                <option>房地产</option>
                <option>教育培训</option>
                <option>医疗健康</option>
                <option>企业服务SaaS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">场景</label>
              <select
                value={scenario}
                onChange={e => setScenario(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>初次接触客户</option>
                <option>产品介绍与演示</option>
                <option>异议处理</option>
                <option>价格谈判</option>
                <option>促成成交</option>
                <option>老客户维护</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">难度</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">初级 - 新人入门</option>
                <option value="intermediate">中级 - 进阶提升</option>
                <option value="advanced">高级 - 销售冠军</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition text-lg"
          >
            🚀 开始训练
          </button>
        </form>
      </div>

      {/* 规则说明 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-3">💡 训练说明</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• AI教练会模拟真实客户与你对话</li>
          <li>• 每次回答后教练会点评并给出改进建议</li>
          <li>• 选择不同的行业和场景进行针对性训练</li>
          <li>• 从初级到高级逐步提升销售技巧</li>
        </ul>
      </div>
    </div>
  )
}
