function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
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
          <button className="page-link" onClick={(e) => handleClick(e, currentPage - 1)}>
            «
          </button>
        </li>
        {[...Array(totalPages)].map((_, i) => (
          <li key={i} className={`page-item ${i + 1 === currentPage ? "active" : ""}`}>
            <button className="page-link" onClick={(e) => handleClick(e, i + 1)}>
              {i + 1}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={(e) => handleClick(e, currentPage + 1)}>
            »
          </button>
        </li>
      </ul>
    </nav>
  );
}