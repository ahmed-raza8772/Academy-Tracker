const Table = ({ children, className }) => {
  return <table className={`min-w-full ${className}`}>{children}</table>;
};

const TableHeader = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

const TableBody = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

const TableRow = ({ children, className, onClick }) => {
  return (
    <tr className={className} onClick={onClick}>
      {children}
    </tr>
  );
};

const TableCell = ({ children, isHeader = false, className, onClick }) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag className={className} onClick={onClick}>
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
