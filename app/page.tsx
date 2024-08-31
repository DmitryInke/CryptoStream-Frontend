"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [cryptos, setCryptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("api/crypto/assets");
    eventSource.onmessage = ({ data }) => {
      try {
        const updatedCryptos = JSON.parse(data).data;
        setCryptos(updatedCryptos);
        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };
    return () => eventSource.close();
  }, []);

  const sortedCryptos = [...cryptos];

  if (sortConfig !== null) {
    sortedCryptos.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // If the key is a number, convert the value to float
      if (
        sortConfig.key === "priceUsd" ||
        sortConfig.key === "changePercent24Hr"
      ) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Cryptocurrency Prices</h1>
      <div className="overflow-x-auto max-h-[75%] overflow-y-auto w-full sm:w-3/4 md:w-2/3 lg:w-1/2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        <table className="table-auto border-collapse border border-gray-700 bg-gray-800 w-full">
          <thead className="bg-gray-700 sticky top-0 shadow-md transition-shadow duration-300 ease-in-out">
            <tr>
              <th
                className="px-4 py-3 border border-gray-700 text-left cursor-pointer"
                onClick={() => requestSort("name")}
              >
                Name{" "}
                {sortConfig?.key === "name"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="px-4 py-3 border border-gray-700 text-left cursor-pointer"
                onClick={() => requestSort("changePercent24Hr")}
              >
                Change 24h (%){" "}
                {sortConfig?.key === "changePercent24Hr"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="px-4 py-3 border border-gray-700 text-left cursor-pointer"
                onClick={() => requestSort("priceUsd")}
              >
                Price USD{" "}
                {sortConfig?.key === "priceUsd"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCryptos.map((crypto, index) => (
              <tr
                key={crypto.name}
                className={`${
                  index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                } hover:bg-gray-600 transition-colors duration-200 ease-in-out`}
              >
                <td className="px-4 py-2 border border-gray-700">
                  {crypto.name}
                </td>
                <td
                  className="px-4 py-2 border border-gray-700"
                  style={{
                    color:
                      parseFloat(crypto.changePercent24Hr) > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {parseFloat(crypto.changePercent24Hr).toFixed(5)}
                </td>
                <td className="px-4 py-2 border border-gray-700">
                  {parseFloat(crypto.priceUsd).toFixed(5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
