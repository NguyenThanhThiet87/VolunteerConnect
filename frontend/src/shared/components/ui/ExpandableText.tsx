import React, { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  limit?: number;
  className?: string;
  buttonClassName?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  limit = 50,
  className = '',
  buttonClassName = ''
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.length <= limit) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {expanded ? text : `${text.slice(0, limit)}...`}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`text-[#006d37] hover:underline font-bold ml-1.5 focus:outline-none inline-block text-[11px] cursor-pointer ${buttonClassName}`}
      >
        {expanded ? 'Thu gọn' : 'Xem thêm'}
      </button>
    </span>
  );
};

export default ExpandableText;
