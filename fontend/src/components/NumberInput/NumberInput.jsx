import React, { useCallback, useState } from 'react'
export const NumberInput = ({ quantity, max = 10, min = 1, onChangeQuantity, onRemoveItem }) => {
  const [value, setValue] = useState(quantity ?? 1);
  const [message, setMessage] = useState('');

  const displayMaxStock = useCallback(() => {
    setMessage("Sorry, we have limited quantity available for this product");
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const onIncreaseQuantity = useCallback(() => {
    if (value < max) {
      const newValue = value + 1;
      setValue(newValue);
      onChangeQuantity && onChangeQuantity(newValue);
    } else {
      displayMaxStock();
    }
  }, [value, max, onChangeQuantity, displayMaxStock]);

  const onReduceQuantity = useCallback(() => {
    if (value > min) {
      const newValue = value - 1;
      setValue(newValue);
      onChangeQuantity && onChangeQuantity(newValue);
    } else if (value === min && onRemoveItem) {
      // Khi giảm từ 1 -> 0 => gọi xóa item
      onRemoveItem();
    }
  }, [value, min, onChangeQuantity, onRemoveItem]);

  return (
    <>
      <div className="flex justify-center items-center">
        <button
          type="button"
          id="decrement-button"
          onClick={onReduceQuantity}
          className="bg-gray-500 w-10 hover:bg-gray-600 border border-gray-300 rounded-s-lg p-3 h-11"
        >
          <svg className="w-3 h-3 text-gray-900 dark:text-white" viewBox="0 0 18 2">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16"/>
          </svg>
        </button>
        <input
          type="text"
          value={value}
          disabled
          className="bg-gray-200 border-x-0 w-12 text-center"
        />
        <button
          type="button"
          id="increment-button"
          onClick={onIncreaseQuantity}
          className="bg-gray-500 w-10 hover:bg-gray-600 border border-gray-300 rounded-e-lg p-3 h-11"
        >
          <svg className="w-3 h-3 text-gray-900 dark:text-white" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
          </svg>
        </button>
      </div>
      {message && <p className='text-sm text-center pt-2 text-red-600'>{message}</p>}
    </>
  );
};

