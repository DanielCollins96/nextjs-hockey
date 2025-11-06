import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

// Inline puck as a motion.svg so we can control its fill via `currentColor`.
// This avoids using CSS filters (invert) which can trigger expensive repaints
// during transforms. Use className to set `text-black` / `dark:text-white`.
const Puck = forwardRef(function Puck({ className = '', width = 100, height = 100, onUpdate }, ref) {
  return (
    <motion.svg
      ref={ref}
      className={className}
      width={width}
      height={height}
      viewBox="0 0 32.96 32.96"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      whileTap={{ scale: 0.9 }}
      drag={true}
      onUpdate={onUpdate}
    >
      <g>
        <g>
          <g>
            <path fill="currentColor" d="M16.48,18.084c-9.101,0-16.479-2.964-16.479-6.622v10.742h0.05c0,3.916,7.357,7.093,16.429,7.093
                c9.077,0,16.432-3.177,16.432-7.093h0.048V11.462C32.961,15.12,25.582,18.084,16.48,18.084z" />
            <ellipse fill="currentColor" cx="16.48" cy="10.285" rx="16.48" ry="6.622" />
          </g>
        </g>
      </g>
    </motion.svg>
  );
});

export default Puck;
