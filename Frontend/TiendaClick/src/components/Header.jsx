export default function Header({ userRole, onGoToSales }) {
    return (
      <div className="d-flex justify-content-between align-items-center header">
        <div>
          <h1>INVENTARIO</h1>
          <div className="user-role">&lt;{userRole}&gt;</div>
        </div>
      </div>
    );
  }