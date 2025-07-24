export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
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