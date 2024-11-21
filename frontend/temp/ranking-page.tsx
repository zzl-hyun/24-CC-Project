import React, { useState } from 'react';
import { Search, Calendar, TrendingUp, Award, User, ArrowUp, ArrowDown } from 'lucide-react';

const RankingPage = () => {
  const [period, setPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 샘플 랭킹 데이터
  const rankings = [
    { 
      id: 1,
      rank: 1,
      name: "트레이딩마스터",
      profit: 156.7,
      winRate: 78.5,
      totalTrades: 245,
      monthlyProfit: 32.4,
      weeklyProfit: 12.3,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      rank: 2,
      name: "코인고수123",
      profit: 128.4,
      winRate: 72.1,
      totalTrades: 189,
      monthlyProfit: 28.7,
      weeklyProfit: 8.9,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      rank: 3,
      name: "비트맨",
      profit: 98.2,
      winRate: 68.4,
      totalTrades: 156,
      monthlyProfit: 22.1,
      weeklyProfit: 6.7,
      avatar: "/api/placeholder/40/40"
    },
    // ... 더 많은 랭킹 데이터
  ];

  const filteredRankings = rankings.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">전체 트레이더</p>
              <h3 className="text-2xl font-bold">1,234명</h3>
            </div>
            <User className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">평균 수익률</p>
              <h3 className="text-2xl font-bold text-green-500">+42.8%</h3>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">이번 달 최고 수익률</p>
              <h3 className="text-2xl font-bold text-blue-500">+156.7%</h3>
            </div>
            <Award className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 rounded-full ${
                  period === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-full ${
                  period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-full ${
                  period === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                주간
              </button>
            </div>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="트레이더 검색..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 랭킹 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">트레이더</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">승률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래횟수</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRankings.map((trader) => (
                <tr key={trader.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {trader.rank <= 3 ? (
                        <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full">
                          <Award className={`w-5 h-5 ${
                            trader.rank === 1 ? 'text-yellow-500' :
                            trader.rank === 2 ? 'text-gray-400' : 'text-orange-500'
                          }`} />
                        </div>
                      ) : (
                        <span className="text-gray-500 font-medium">{trader.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={trader.avatar} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{trader.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">{trader.profit}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900">{trader.winRate}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trader.totalTrades.toLocaleString()}회
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
