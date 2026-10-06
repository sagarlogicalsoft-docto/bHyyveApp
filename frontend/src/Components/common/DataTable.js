import React, { useMemo, useState } from "react";
import "./dataTable.css";

const DataTable = ({
  columns = [],
  data = [],
  entriesPerPageOptions = [5, 10, 25, 50, 100],
  defaultEntriesPerPage = 10,
  searchable = true,
  sortable = true,
  searchKeys = null, 
}) => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntriesPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

 const filteredData = useMemo(() => {
  if (!search.trim()) {
    return data;
  }

  const searchValue = search.toLowerCase();

  // agar searchKeys diya hai to row ke actual fields pe search karo
  if (searchKeys && searchKeys.length > 0) {
    return data.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        return String(value ?? "")
          .toLowerCase()
          .includes(searchValue);
      })
    );
  }

  // fallback: purana behavior (column.key based)
  return data.filter((row) =>
    columns.some((column) => {
      const value = row[column.key];
      return String(value ?? "")
        .toLowerCase()
        .includes(searchValue);
    })
  );
}, [data, search, columns, searchKeys]);

  // -----------------------------------------
  // SORT
  // -----------------------------------------

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) {
      return filteredData;
    }

    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const first = String(aValue).toLowerCase();
      const second = String(bValue).toLowerCase();

      if (first < second) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (first > second) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig, sortable]);

  // -----------------------------------------
  // PAGINATION
  // -----------------------------------------

  const totalEntries = sortedData.length;

  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * entriesPerPage;

  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);

  const currentData = sortedData.slice(startIndex, endIndex);

  // -----------------------------------------
  // SORT HANDLER
  // -----------------------------------------

  const handleSort = (key) => {
    if (!sortable) return;

    setCurrentPage(1);

    setSortConfig((previous) => {
      if (previous.key === key) {
        return {
          key,
          direction: previous.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  };

  // -----------------------------------------
  // SEARCH HANDLER
  // -----------------------------------------

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  // -----------------------------------------
  // ENTRIES HANDLER
  // -----------------------------------------

  const handleEntriesChange = (event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  // -----------------------------------------
  // PAGE CHANGE
  // -----------------------------------------

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  // -----------------------------------------
  // PAGE NUMBERS
  // -----------------------------------------

  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="datatable-container">
      <div className="datatable-card">
        {/* ================================
          TOP CONTROLS
      ================================= */}

        <div className="datatable-top">
          {/* ENTRIES */}

          <div className="datatable-length">
            <label>
              Show{" "}
              <select value={entriesPerPage} onChange={handleEntriesChange}>
                {entriesPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>{" "}
              entries
            </label>
          </div>

          {/* SEARCH */}

          {searchable && (
            <div className="datatable-search">
              <label>
                Search:
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search..."
                />
              </label>
            </div>
          )}
        </div>

        {/* ================================
          TABLE
      ================================= */}

        <div className="datatable-scroll">
          <div className="datatable-table-wrapper">
            <table className="datatable-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      style={{
                        width: column.width || "auto",
                      }}
                      onClick={() =>
                        column.sortable !== false && handleSort(column.key)
                      }
                      className={
                        column.sortable !== false && sortable
                          ? "sortable-column"
                          : ""
                      }
                    >
                      <div className="datatable-header-content">
                        <span>{column.label}</span>

                        {column.sortable !== false && sortable && (
                          <span className="sort-icon">
                            {sortConfig.key === column.key
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((row, rowIndex) => (
                    <tr key={row.id ?? rowIndex}>
                      {columns.map((column) => (
                        <td key={column.key} className={column.className || ""}>
                          {column.key === "serial"
                            ? startIndex + rowIndex + 1
                            : column.render
                              ? column.render(row[column.key], row, rowIndex)
                              : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="datatable-empty">
                      No matching records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================
          BOTTOM
      ================================= */}

        <div className="datatable-bottom">
          {/* INFO */}

          <div className="datatable-info">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
            {totalEntries} entries
          </div>

          {/* PAGINATION */}

          <div className="datatable-pagination">
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => goToPage(safeCurrentPage - 1)}
            >
              Previous
            </button>

            {pageNumbers.map((page) => (
              <button
                type="button"
                key={page}
                className={page === safeCurrentPage ? "active" : ""}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() => goToPage(safeCurrentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
