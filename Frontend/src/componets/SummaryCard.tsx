interface Props {
  icon: React.ReactNode;
  title: string;
}

const SummaryCard = ({ icon, title }: Props) => {
  return (
    <div className="summary-card">
      <span className="icon">{icon}</span>
      <span className="icon-title">{title}</span>
    </div>
  );
};

export default SummaryCard;
