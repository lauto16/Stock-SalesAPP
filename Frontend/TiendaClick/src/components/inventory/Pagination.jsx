export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const maxPagesToShow = 5;
  
  let startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
  let endPage = startPage + maxPagesToShow - 1;
  
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPagesToShow + 1, 1);
  }
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handleClick = (event, page) => {
    event.preventDefault();
    onPageChange(page);
  };

  return (
    <nav>
      <ul className="pagination mt-3">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={(e) => handleClick(e, 1)}>Primera</button>
        </li>

        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={(e) => handleClick(e, currentPage - 1)}>‹</button>
        </li>

        {startPage > 1 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}

        {pages.map((page) => (
          <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
            <button className="page-link" onClick={(e) => handleClick(e, page)}>{page}</button>
          </li>
        ))}

        {endPage < totalPages && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={(e) => handleClick(e, currentPage + 1)}>›</button>
        </li>

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={(e) => handleClick(e, totalPages)}>Última</button>
        </li>
      </ul>
    </nav>
  );
}