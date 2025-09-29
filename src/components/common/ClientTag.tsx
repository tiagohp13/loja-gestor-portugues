import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ClientTag as ClientTagType, getTagColor, getTagDescription } from '@/utils/clientTags';

interface ClientTagProps {
  tag: ClientTagType;
  showTooltip?: boolean;
}

const ClientTag: React.FC<ClientTagProps> = ({ tag, showTooltip = true }) => {
  const tagElement = (
    <Badge 
      variant="outline" 
      className={`${getTagColor(tag)} text-xs font-medium border`}
    >
      {tag}
    </Badge>
  );

  if (!showTooltip) {
    return tagElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {tagElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTagDescription(tag)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClientTag;