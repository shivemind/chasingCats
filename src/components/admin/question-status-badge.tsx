interface QuestionStatusBadgeProps {
  status: string;
}

export function QuestionStatusBadge({ status }: QuestionStatusBadgeProps) {
  const styles = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    ANSWERED: 'bg-green-500/20 text-green-400',
    ARCHIVED: 'bg-white/10 text-white/50'
  };

  const style = styles[status as keyof typeof styles] ?? styles.PENDING;

  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
