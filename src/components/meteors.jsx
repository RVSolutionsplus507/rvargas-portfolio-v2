import { cn } from "@/lib/utils";
import PropTypes from 'prop-types';

export const Meteors = ({
    number,
    className
}) => {
    const meteors = new Array(number || 10).fill(true); // Reduje el número de meteoros a 10
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ height: '100%', maxHeight: '600px', zIndex: 0 }}>
            {meteors.map((_, idx) => (
                <span
                    key={"meteor" + idx}
                    className={cn(
                        "animate-meteor-effect absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
                        "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
                        className
                    )}
                    style={{
                        top: Math.floor(Math.random() * 200) + "px",
                        left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
                        animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
                        animationDuration: Math.floor(Math.random() * (8 - 2) + 2) + "s",
                        zIndex: 0,
                    }}
                ></span>
            ))}
        </div>
    );
};

Meteors.propTypes = {
    number: PropTypes.number,
    className: PropTypes.string,
};
