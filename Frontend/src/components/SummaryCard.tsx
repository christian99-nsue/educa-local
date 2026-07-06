import { Link } from "react-router-dom";

interface Props {
  icon: React.ReactNode;
  title: string;
  path: string;
}

const SummaryCard = ({ icon, title, path }: Props) => {
  return (
    <Link to={path} className="summary-card">
      <span className="icon">{icon}</span>
      <span className="icon-title">{title}</span>
    </Link>
  );
};

export default SummaryCard;
