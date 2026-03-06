interface MissionStatementProps {
  tagline: string;
  description: string;
}

export default function MissionStatement({ tagline, description }: MissionStatementProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-gray-900">{tagline}</h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
