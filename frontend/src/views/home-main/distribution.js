import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import styled from "styled-components";

const Distribution = ({ data }) => {
    // 결정 분포 계산
    const distribution = data.reduce(
        (acc, item) => {
            acc[item.decision] = (acc[item.decision] || 0) + 1;
            return acc;
        },
        { buy: 0, sell: 0, hold: 0 }
    );

    // 차트에 표시할 데이터 준비
    const chartData = [
        { name: "Buy", value: distribution.buy },
        { name: "Sell", value: distribution.sell },
        { name: "Hold", value: distribution.hold },
    ];

    // 색상 설정
    const COLORS = ["#4caf50", "#f44336", "#2196f3"];

    return (
        <StyledDistribution>
            <h1>Decision Distribution</h1>
            <PieChart width={400} height={400}>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </StyledDistribution>
    );
};

export default Distribution;

const StyledDistribution = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f7f7f7;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 10px auto 0;
`;