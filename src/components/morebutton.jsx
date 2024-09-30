
import { Button } from "@/components/ui/button";
import PropTypes from 'prop-types';

const MoreButton = ({ click }) => {
  return (
    <Button variant="default" size="lg" onClick={click}>
      Load More
    </Button>
  );
};

MoreButton.propTypes = {
  click: PropTypes.func.isRequired,
};

export default MoreButton;