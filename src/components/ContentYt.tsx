import React, { useEffect } from 'react';

const ContentYt: React.FC = () => {
  useEffect(() => {
    const handleElementRemoval = () => {
      try {
        // Always check if element exists before removing
        const element = document.getElementById('your-element-id');
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (error) {
        console.error('Error removing element:', error);
      }
    };
    
    // Add proper cleanup
    return () => {
      handleElementRemoval();
    };
  }, []);

  return (
    // Rest of the component code
  );
};

export default ContentYt; 