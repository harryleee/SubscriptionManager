import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import SubscriptionList from './components/SubscriptionList';
import AddSubscription from './components/AddSubscription';
import DataAnalysis from './components/DataAnalysis';

const App = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editSub, setEditSub] = useState(null);
  const [token, setToken] = useState('');
  const [newToken, setNewToken] = useState('');
  const [loading, setLoading] = useState(false);
  const lastSyncSubscriptions = useRef([]); 

  const API_URL = 'http://127.0.0.1:8082';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('k');
    
    if (urlToken) {
      setToken(urlToken);
      setNewToken(urlToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchSubscriptions(token);
    } else {
      setSubscriptions([]); 
    }
  }, [token]); 

  const fetchSubscriptions = async (tokenValue) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sub?token=${encodeURIComponent(tokenValue)}`);
      const newSubscriptions = response.data.subscriptions || [];
      setSubscriptions(newSubscriptions);
      lastSyncSubscriptions.current = [...newSubscriptions];
      toast.success('Subscriptions loaded successfully', { duration: 3000 });
    } catch (err) {
      toast.error('Failed to load subscriptions: ' + (err.response?.data || err.message), { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleTokenConfirm = async () => {
    const trimmedToken = newToken.trim();
    setToken(trimmedToken);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('k', trimmedToken);
    window.history.pushState({}, '', newUrl);
    await fetchSubscriptions(trimmedToken);
  };

  const createNewToken = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/sub/new_token`);
      const newToken = response.data.token;
      setNewToken(newToken);
      setToken(newToken);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('k', newToken);
      window.history.pushState({}, '', newUrl);
      setSubscriptions([]);
      lastSyncSubscriptions.current = [];
      toast.success('New token created successfully', { duration: 3000 });
    } catch (err) {
      toast.error('Failed to create new token: ' + (err.response?.data || err.message), { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const hasSubscriptionsChanged = () => {
    if (subscriptions.length === 0) return false; 
    return JSON.stringify(subscriptions) !== JSON.stringify(lastSyncSubscriptions.current);
  };

  const syncSubscriptions = async () => {
    if (!hasSubscriptionsChanged()) {
      toast.info('No changes to sync', { duration: 3000 });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/sub/sync?token=${encodeURIComponent(token)}`, {
        subscriptions: subscriptions.map(sub => ({
          name: sub.name,
          price: sub.price,
          currency: sub.currency,
          period: sub.period,
          firstBillDate: sub.firstBillDate,
          icon: sub.icon,
        })),
      });
      toast.success('Sync successful', { duration: 3000 });
      lastSyncSubscriptions.current = [...subscriptions]; 
      await fetchSubscriptions(token); 
    } catch (err) {
      toast.error('Sync failed: ' + (err.response?.data || err.message), { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = (newSub) => {
    if (newSub === null) {
      setIsModalOpen(false);
      setModalType(null);
      setEditSub(null);
      return;
    }
    if (modalType === 'add') {
      setSubscriptions([...subscriptions, { ...newSub, id: subscriptions.length + 1 }]);
    } else if (modalType === 'edit' && editSub) {
      setSubscriptions(subscriptions.map(sub => (sub.id === editSub.id ? newSub : sub)));
    }
    setIsModalOpen(false);
    setModalType(null);
    setEditSub(null);
  };

  const handleEditSubscription = (sub) => {
    setEditSub(sub);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div className="w-full md:w-2/3">
              <label className="block text-lg font-semibold mb-2 text-gray-800">Token</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter or paste token (e.g. ABCDEF)..."
                  disabled={loading}
                />
                <button
                  onClick={handleTokenConfirm}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Go
                </button>
                <button
                  onClick={createNewToken}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Create New Token
                </button>
              </div>
            </div>
            <button
              onClick={syncSubscriptions}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
              disabled={loading || !token}
            >
              Sync
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500 mb-4 text-center">Loading...</p>}
        <Toaster position="top-right" /> {/* Toast */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <SubscriptionList
              subscriptions={subscriptions}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
              onAdd={() => {
                setModalType('add');
                setIsModalOpen(true);
              }}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <DataAnalysis subscriptions={subscriptions} />
          </div>
        </div>
      </div>

      {(isModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{modalType === 'add' ? 'Add Subscription' : 'Edit Subscription'}</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalType(null);
                  setEditSub(null);
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <AddSubscription 
              onAdd={handleAddSubscription} 
              initialData={modalType === 'edit' ? editSub : null} 
              subscriptions={subscriptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;