import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function PollChart({ options }) {

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const data = options.map((opt) => ({
    name: opt.text,
    votes: opt.votes,
    percentage: totalVotes
      ? ((opt.votes / totalVotes) * 100).toFixed(1)
      : 0
  }));

  return (
    <div style={{ width: "100%", height: 250 }}>

      <p>Total Votes: {totalVotes}</p>

      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />

          <Tooltip
            formatter={(value, name, props) => [
              `${value} votes (${props.payload.percentage}%)`
            ]}
          />

          <Bar dataKey="votes" />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PollChart;