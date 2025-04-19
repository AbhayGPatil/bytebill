import React from 'react';

const Predicted = ({ predicted }) => {
  return (
    <section>
      <h2>🔮 Predicted Next Month</h2>
      <p>Estimated: ₹{predicted?.predicted_total}</p>
    </section>
  );
};

export default Predicted;
