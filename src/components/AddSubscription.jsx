import React, { useState, useMemo, useEffect } from 'react';
import * as simpleIcons from 'simple-icons';
import axios from 'axios';

const presetSubscriptions = [
  { name: 'YouTube Premium', price: 11.99, currency: 'USD', period: 'monthly', firstBillDate: '2023-01-01', icon: 'youtube' },
  { name: 'Spotify', price: 9.99, currency: 'USD', period: 'monthly', firstBillDate: '2023-02-15', icon: 'spotify' },
  { name: 'ChatGPT', price: 20, currency: 'USD', period: 'monthly', firstBillDate: '2023-03-01', icon: 'openai' },
  { name: 'Netflix', price: 15.49, currency: 'USD', period: 'monthly', firstBillDate: '2023-04-01', icon: 'netflix' },
  { name: 'Amazon Prime', price: 14.99, currency: 'USD', period: 'monthly', firstBillDate: '2023-05-01', icon: 'amazon' },
  { name: 'Disney+', price: 7.99, currency: 'USD', period: 'monthly', firstBillDate: '2023-06-01', icon: 'disney' },
  { name: 'Apple Music', price: 9.99, currency: 'USD', period: 'monthly', firstBillDate: '2023-07-01', icon: 'applemusic' },
  { name: 'HBO Max', price: 14.99, currency: 'USD', period: 'monthly', firstBillDate: '2023-10-01', icon: 'hbomax' },
  { name: 'Adobe CC', price: 52.99, currency: 'USD', period: 'monthly', firstBillDate: '2023-09-01', icon: 'adobe' },
  { name: 'Microsoft 365', price: 69.99, currency: 'USD', period: 'yearly', firstBillDate: '2023-10-01', icon: 'microsoft' },
];

// All available icons, unlimited
const allIcons = Object.keys(simpleIcons)
  .filter(key => key.startsWith('si'))
  .map(key => ({
    value: key.replace('si', '').toLowerCase(),
    label: key.replace('si', '').toLowerCase(),
  }));

const AddSubscription = ({ onAdd, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [period, setPeriod] = useState(initialData?.period || 'monthly');
  const [firstBillDate, setFirstBillDate] = useState(initialData?.firstBillDate || new Date().toISOString().split('T')[0]); // Default to today
  const [selectedIcon, setSelectedIcon] = useState(
    initialData?.icon ? initialData.icon.split('/').pop().replace('.svg', '') : 'default'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [iconSearchTerm, setIconSearchTerm] = useState('');
  const [showIconSuggestions, setShowIconSuggestions] = useState(false);
  const [errors, setErrors] = useState({}); // Initially empty

  useEffect(() => {
    // Only validate when input changes, not on initial render
  }, [name, price, currency, period, firstBillDate]);

  const handlePresetSelect = (sub) => {
    setName(sub.name);
    setPrice(sub.price.toString()); // Ensure price is a string
    setCurrency(sub.currency);
    setPeriod(sub.period);
    setFirstBillDate(sub.firstBillDate);
    setSelectedIcon(sub.icon || 'default');
    setSearchTerm('');
    setShowSuggestions(false);
    setErrors({}); // Clear error messages
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name cannot be empty';
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!currency) newErrors.currency = 'Currency cannot be empty';
    if (!period) newErrors.period = 'Period cannot be empty';
    if (!firstBillDate) newErrors.firstBillDate = 'First bill date cannot be empty';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const iconUrl = simpleIcons[`si${selectedIcon.charAt(0).toUpperCase() + selectedIcon.slice(1)}`]
      ? `https://simpleicons.org/icons/${selectedIcon}.svg`
      : 'https://via.placeholder.com/40?text=' + (name[0] || 'X');
    const newSub = {
      ...initialData,
      name: name.trim(),
      price: parseFloat(price),
      currency,
      period,
      firstBillDate,
      icon: iconUrl,
    };
    onAdd(newSub);
  };

  const filteredSubscriptions = useMemo(() => {
    return presetSubscriptions.filter(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredIcons = useMemo(() => {
    return allIcons
      .filter(option => option.value.toLowerCase().includes(iconSearchTerm.toLowerCase()))
      .slice(0, 20);
  }, [iconSearchTerm]);

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Search Preset Subscriptions</label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full p-2 border rounded text-sm"
            placeholder="Enter subscription name..."
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
          {showSuggestions && searchTerm && filteredSubscriptions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full border rounded shadow-lg max-h-40 overflow-y-auto bg-white">
              {filteredSubscriptions.map(sub => {
                const iconKey = `si${sub.icon.charAt(0).toUpperCase() + sub.icon.slice(1)}`;
                const Icon = simpleIcons[iconKey];
                return (
                  <div
                    key={sub.name}
                    onClick={() => handlePresetSelect(sub)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {Icon ? (
                      <svg
                        className="w-5 h-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        dangerouslySetInnerHTML={{ __html: Icon.svg }}
                      />
                    ) : (
                      <span className="w-5 h-5 mr-2 inline-block bg-gray-200 rounded" />
                    )}
                    <span className="text-sm">{sub.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            validateForm();
          }}
          className={`w-full p-2 border rounded text-sm ${errors.name ? 'border-red-500' : ''}`}
          required
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            validateForm(); 
          }}
          className={`w-full p-2 border rounded text-sm ${errors.price ? 'border-red-500' : ''}`}
          step="0.01"
          required
        />
        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Currency</label>
        <select
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
            validateForm(); 
          }}
          className={`w-full p-2 border rounded text-sm ${errors.currency ? 'border-red-500' : ''}`}
        >
          <option value="USD">USD</option>
          <option value="CNY">CNY</option>
        </select>
        {errors.currency && <p className="text-xs text-red-500 mt-1">{errors.currency}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Period</label>
        <select
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            validateForm(); 
          }}
          className={`w-full p-2 border rounded text-sm ${errors.period ? 'border-red-500' : ''}`}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        {errors.period && <p className="text-xs text-red-500 mt-1">{errors.period}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">First Bill Date</label>
        <input
          type="date"
          value={firstBillDate}
          onChange={(e) => {
            setFirstBillDate(e.target.value);
            validateForm(); // Real-time validation
          }}
          className={`w-full p-2 border rounded text-sm ${errors.firstBillDate ? 'border-red-500' : ''}`}
          required
        />
        {errors.firstBillDate && <p className="text-xs text-red-500 mt-1">{errors.firstBillDate}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Icon</label>
        <div className="relative">
          <input
            type="text"
            value={iconSearchTerm}
            onChange={(e) => {
              setIconSearchTerm(e.target.value);
              setShowIconSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowIconSuggestions(false), 200)}
            onFocus={() => setShowIconSuggestions(true)}
            className="w-full p-2 border rounded text-sm"
            placeholder="Enter icon name (e.g. youtube)..."
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
          {showIconSuggestions && iconSearchTerm && filteredIcons.length > 0 && (
            <div className="absolute z-10 mt-1 w-full border rounded shadow-lg max-h-40 overflow-y-auto bg-white">
              {filteredIcons.map(option => {
                const iconKey = `si${option.label.charAt(0).toUpperCase() + option.label.slice(1)}`;
                const Icon = simpleIcons[iconKey];
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      setSelectedIcon(option.value);
                      setIconSearchTerm('');
                      setShowIconSuggestions(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {Icon ? (
                      <svg
                        className="w-5 h-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        dangerouslySetInnerHTML={{ __html: Icon.svg }}
                      />
                    ) : (
                      <span className="w-5 h-5 mr-2 inline-block bg-gray-200 rounded" />
                    )}
                    <span className="text-sm">{option.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Icon preview */}
        {selectedIcon && (
          <div className="mt-2 flex items-center">
            <label className="text-gray-700 text-sm mr-2">Preview:</label>
            {simpleIcons[`si${selectedIcon.charAt(0).toUpperCase() + selectedIcon.slice(1)}`] ? (
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="currentColor"
                dangerouslySetInnerHTML={{
                  __html: simpleIcons[`si${selectedIcon.charAt(0).toUpperCase() + selectedIcon.slice(1)}`].svg,
                }}
              />
            ) : (
              <span className="w-8 h-8 inline-block bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                Default
              </span>
            )}
          </div>
        )}
        {selectedIcon && !simpleIcons[`si${selectedIcon.charAt(0).toUpperCase() + selectedIcon.slice(1)}`] && (
          <p className="text-xs text-red-500">Invalid icon name, will use default placeholder</p>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onAdd(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {initialData ? 'Save' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default AddSubscription;