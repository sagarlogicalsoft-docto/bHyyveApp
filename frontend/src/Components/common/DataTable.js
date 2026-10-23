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
  reorderable = false,
  onReorder,
  reorderDisabled = false,
}) => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntriesPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

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
        }),
      );
    }

    // fallback: purana behavior (column.key based)
    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        return String(value ?? "")
          .toLowerCase()
          .includes(searchValue);
      }),
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

  const currentData = reorderable
    ? data
    : sortedData.slice(startIndex, endIndex);

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

  const handleDragStart = (event, row) => {
    if (!reorderable || reorderDisabled) {
      event.preventDefault();
      return;
    }

    setDraggedId(row.id);
    setDragOverId(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(row.id));

    const draggedRow = event.currentTarget.closest("tr");
    if (draggedRow) {
      draggedRow.classList.add("datatable-row-dragging");
      const bounds = draggedRow.getBoundingClientRect();
      event.dataTransfer.setDragImage(
        draggedRow,
        Math.min(32, bounds.width / 2),
        bounds.height / 2,
      );
    }
  };

  const handleDragOver = (event, row) => {
    if (!reorderable || reorderDisabled) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (draggedId == null) return;

    if (String(draggedId) !== String(row.id)) {
      setDragOverId(row.id);
    }
  };

  const handleListDragOver = (event) => {
    if (!reorderable || reorderDisabled) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const list = event.currentTarget;
    const bounds = list.getBoundingClientRect();
    const edgeSize = 64;
    const scrollStep = 18;

    if (event.clientY < bounds.top + edgeSize) {
      list.scrollTop -= scrollStep;
    } else if (event.clientY > bounds.bottom - edgeSize) {
      list.scrollTop += scrollStep;
    }
  };

  const handleDrop = async (event, targetRow) => {
    event.preventDefault();

    if (!reorderable || reorderDisabled || draggedId == null) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const sourceId = draggedId;

    setDraggedId(null);
    setDragOverId(null);

    if (String(sourceId) === String(targetRow.id)) return;

    const fromIndex = data.findIndex(
      (row) => String(row.id) === String(sourceId),
    );

    const toIndex = data.findIndex(
      (row) => String(row.id) === String(targetRow.id),
    );

    if (fromIndex < 0 || toIndex < 0) return;

    const reorderedData = [...data];
    const [movedRow] = reorderedData.splice(fromIndex, 1);

    reorderedData.splice(toIndex, 0, movedRow);

    if (onReorder) {
      try {
        await onReorder(reorderedData);
      } catch (error) {
        console.error("Failed to reorder table rows:", error);
      }
    }
  };

  const handleDragEnd = (event) => {
    event.currentTarget.classList.remove("datatable-row-dragging");
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="datatable-container">
      <div className="datatable-card">
        {/* ================================
          TOP CONTROLS
      ================================= */}

        { (
          <div className="datatable-top">
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
        )}

        {/* ================================
          TABLE
      ================================= */}

        <div
          className={`datatable-scroll${reorderable ? " datatable-scroll-reorderable" : ""}`}
          onDragOver={handleListDragOver}
        >
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
                        !reorderable &&
                        column.sortable !== false &&
                        handleSort(column.key)
                      }
                      className={
                        !reorderable && column.sortable !== false && sortable
                          ? "sortable-column"
                          : ""
                      }
                    >
                      <div className="datatable-header-content">
                        <span>{column.label}</span>

                        { 
                          column.sortable !== false &&
                          sortable && (
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
                    <tr
                      key={row.id ?? rowIndex}
                      onDragOver={(event) => handleDragOver(event, row)}
                      onDrop={(event) => handleDrop(event, row)}
                      onDragEnd={handleDragEnd}
                      className={[
                        draggedId != null &&
                        String(draggedId) === String(row.id)
                          ? "datatable-row-dragging"
                          : "",
                        dragOverId != null &&
                        String(dragOverId) === String(row.id)
                          ? "datatable-row-drag-over"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {columns.map((column) => (
                        <td key={column.key} className={column.className || ""}>
                          {column.key === "serial"
                            ? (reorderable ? rowIndex : startIndex + rowIndex) +
                              1
                            : column.render
                              ? column.render(row[column.key], row, rowIndex, {
                                  draggable: reorderable && !reorderDisabled,
                                  onDragStart: (event) =>
                                    handleDragStart(event, row),
                                })
                              : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="datatable-empty">
                      {reorderable
                        ? "No records available"
                        : "No matching records found"}
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
        {!reorderable && (
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
        )}
      </div>
    </div>
  );
};

export default DataTable;
