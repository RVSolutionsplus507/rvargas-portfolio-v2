
import { Button } from "@/components/ui/button";
import type { MouseEventHandler } from "react";

interface MoreButtonProps {
  click: MouseEventHandler<HTMLButtonElement>;
}

const MoreButton = ({ click }: MoreButtonProps) => {
  return (
    <Button variant="default" size="lg" onClick={click}>
      Load More
    </Button>
  );
};

export default MoreButton;