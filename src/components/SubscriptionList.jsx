import React, { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const SubscriptionList = ({ subscriptions, onEdit, onDelete, onAdd }) => {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Subscriptions</h2>
        <div className="flex items-center gap-4">
          {subscriptions.length > 0 && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {editMode ? 'Edit' : 'Edit'}
              </span>
            </label>
          )}
          <button
            onClick={onAdd}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Subscription
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscriptions.map(sub => (
          <div
            key={sub.id}
            className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <img src={sub.icon} alt={sub.name} className="w-12 h-12 mr-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{sub.name}</h3>
                <p className="text-sm text-gray-600">
                  {sub.price} {sub.currency}/{sub.period === 'monthly' ? 'mo' : 'yr'}
                </p>
              </div>
            </div>
            
            {editMode && (
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => onEdit(sub)}
                  className="bg-blue-100 text-blue-600 p-1.5 rounded-full hover:bg-blue-200 transition-colors flex items-center justify-center"
                  title="Edit"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(sub.id)}
                  className="bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {subscriptions.length === 0 && (
        <p className="text-gray-500 text-center mt-4">No subscriptions yet</p>
      )}
    </div>
  );
};

export default SubscriptionList;