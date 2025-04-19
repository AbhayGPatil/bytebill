import React from 'react';

const DataList = ({ title, data, type }) => {
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {data.map((item, index) => {
          if (type === 'trend') {
            return <li key={index}>{item.month}: ₹{item.total.toFixed(2)}</li>;
          } else if (type === 'pie') {
            return <li key={index}>{item.category}: ₹{item.total.toFixed(2)}</li>;
          } else if (type === 'anomaly') {
            return (
              <li key={index}>
                {item.date} | {item.recipient} | {item.category} | ₹{item.amount}
              </li>
            );
          } else {
            return <li key={index}>{JSON.stringify(item)}</li>;
          }
        })}
      </ul>
    </section>
  );
};

export default DataList;
