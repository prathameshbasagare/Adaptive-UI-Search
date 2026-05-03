// File: ./src/components/adaptive/TableBlock.tsx

"use client";

interface TableBlockProps {
  headers: string[];
  rows: string[][];
}

export default function TableBlock({ headers, rows }: TableBlockProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 font-semibold text-slate-200 whitespace-nowrap first:pl-5 last:pr-5"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="hover:bg-slate-800/40 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 text-slate-300 first:pl-5 last:pr-5 first:font-medium first:text-white"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-2 bg-slate-900/40 border-t border-slate-800 text-xs text-slate-600">
        {rows.length} row{rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
