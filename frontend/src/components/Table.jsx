const Table = ({ columns, data, loading, emptyMessage = 'No data found' }) => {
  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                  ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-4 text-gray-700
                    ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;