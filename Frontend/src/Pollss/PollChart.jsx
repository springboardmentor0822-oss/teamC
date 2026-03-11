import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import "./Pollchart.css";

function PollChart({ options }) {
  const data = options.map((opt) => ({
    name: opt.text,
    votes: opt.votes
  }));

  return (
    <div className="poll-chart-container">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={26}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(148,163,184,0.28)"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(15,23,42,0.65)" }}
            contentStyle={{
              background: "rgba(15,23,42,0.96)",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.5)",
              boxShadow: "0 12px 30px rgba(15,23,42,0.75)",
              padding: "8px 10px"
            }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#93c5fd", fontSize: 12 }}
          />
          <Bar
            dataKey="votes"
            radius={[7, 7, 0, 0]}
            fill="url(#pollBarGradient)"
          />
          <defs>
            <linearGradient id="pollBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PollChart;
