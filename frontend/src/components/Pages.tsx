const PageAction = {
  Previous: -1,
  First: -2,
  Next: -3,
  Last: -4,
} as const;

export default function Pages({
  currPage,
  totalPages,
  handleClick,
}: {
  currPage: number;
  totalPages: number;
  handleClick: (x: number) => void;
}) {
  const pages = getPageNumbers(currPage, totalPages);

  return (
    <div>
      <button
        name="first"
        disabled={currPage === 1}
        onClick={() => handleClick(PageAction.First)}
      >
        First
      </button>

      <button
        name="previous"
        disabled={currPage === 1}
        onClick={() => handleClick(PageAction.Previous)}
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          name={`page-${page}`}
          disabled={page === currPage}
          style={page === currPage ? { fontWeight: "bold" } : undefined}
          onClick={() => handleClick(page)}
        >
          {page}
        </button>
      ))}

      <button
        name="next"
        disabled={currPage === totalPages}
        onClick={() => handleClick(PageAction.Next)}
      >
        Next
      </button>

      <button
        name="last"
        disabled={currPage === totalPages}
        onClick={() => handleClick(PageAction.Last)}
      >
        Last
      </button>
    </div>
  );
}

export function getPageNumbers(currPage: number, totalPages: number): number[] {
  let firstPage = 1;
  let lastPage = totalPages;

  if (totalPages > 5) {
    if (currPage < 3) {
      lastPage = 5;
    } else if (currPage <= totalPages - 2) {
      firstPage = currPage - 2;
      lastPage = currPage + 2;
    } else {
      firstPage = totalPages - 4;
    }
  }

  return Array.from(
    { length: lastPage - firstPage + 1 },
    (_, i) => firstPage + i
  );
}