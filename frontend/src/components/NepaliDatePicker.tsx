'use client';

import React from 'react';
import { NepaliDatePicker } from 'nepali-datepicker-reactjs';
import 'nepali-datepicker-reactjs/dist/index.css';

interface Props {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
}

const NepaliDatePickerComponent: React.FC<Props> = ({ value, onChange, className, placeholder }) => {
  return (
    <div className={`relative ${className}`}>
      <NepaliDatePicker
        value={value}
        onChange={onChange}
        options={{ closeOnSelect: true }}
        inputClassName="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
    </div>
  );
};

export default NepaliDatePickerComponent;
