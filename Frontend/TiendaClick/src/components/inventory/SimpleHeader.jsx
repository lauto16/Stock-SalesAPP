import TitleDropdown from "../global/TitleDropdown.jsx";

export default function SimpleHeader({
  title,
  userRole,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center header">
      <div className="d-flex align-items-center">
        <TitleDropdown currentTitle={title} />
        <div className="user-role">&lt;{userRole}&gt;</div>
      </div>
    </div>
  );
}
