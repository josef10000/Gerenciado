import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { CreditCard, User, Plus, Trash2, Copy, Check, Edit2, X } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { settings, updateSettings } = useData();
  
  const [pixKeys, setPixKeys] = useState(settings.pixKeys || []);
  const [paymentLinks, setPaymentLinks] = useState(settings.paymentLinks || []);
  
  const [newPixKey, setNewPixKey] = useState('');
  const [editingPixKeyId, setEditingPixKeyId] = useState<string | null>(null);
  
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddOrUpdatePixKey = () => {
    if (!newPixKey) return;
    
    let updatedKeys;
    if (editingPixKeyId) {
      updatedKeys = pixKeys.map(k => k.id === editingPixKeyId ? { ...k, key: newPixKey } : k);
      setEditingPixKeyId(null);
    } else {
      const newKey = { id: Math.random().toString(36).substr(2, 9), key: newPixKey };
      updatedKeys = [...pixKeys, newKey];
    }
    
    setPixKeys(updatedKeys);
    updateSettings({ ...settings, pixKeys: updatedKeys });
    setNewPixKey('');
  };

  const handleEditPixKey = (id: string, key: string) => {
    setEditingPixKeyId(id);
    setNewPixKey(key);
  };

  const handleCancelEditPixKey = () => {
    setEditingPixKeyId(null);
    setNewPixKey('');
  };

  const handleRemovePixKey = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta chave Pix?')) {
      const updatedKeys = pixKeys.filter(k => k.id !== id);
      setPixKeys(updatedKeys);
      updateSettings({ ...settings, pixKeys: updatedKeys });
      if (editingPixKeyId === id) handleCancelEditPixKey();
    }
  };

  const handleAddOrUpdateLink = () => {
    if (!newLinkName || !newLinkUrl) return;
    
    let updatedLinks;
    if (editingLinkId) {
      updatedLinks = paymentLinks.map(l => l.id === editingLinkId ? { ...l, name: newLinkName, url: newLinkUrl } : l);
      setEditingLinkId(null);
    } else {
      const newLink = { id: Math.random().toString(36).substr(2, 9), name: newLinkName, url: newLinkUrl };
      updatedLinks = [...paymentLinks, newLink];
    }
    
    setPaymentLinks(updatedLinks);
    updateSettings({ ...settings, paymentLinks: updatedLinks });
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleEditLink = (id: string, name: string, url: string) => {
    setEditingLinkId(id);
    setNewLinkName(name);
    setNewLinkUrl(url);
  };

  const handleCancelEditLink = () => {
    setEditingLinkId(null);
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este link?')) {
      const updatedLinks = paymentLinks.filter(l => l.id !== id);
      setPaymentLinks(updatedLinks);
      updateSettings({ ...settings, paymentLinks: updatedLinks });
      if (editingLinkId === id) handleCancelEditLink();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Configurações</h1>
          <p className="mt-2 text-sm text-gray-400">
            Gerencie seu perfil e métodos de pagamento para enviar aos clientes.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 shadow-sm ring-1 ring-white/10 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-700">
          {/* Profile Section */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-100">Informações do Perfil</h2>
            </div>
            <div className="mt-4 flex items-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-gray-600" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold text-xl border-2 border-gray-600">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
              <div className="ml-6">
                <p className="text-lg font-medium text-gray-100">{user?.displayName || 'Administrador'}</p>
                <p className="text-sm text-gray-400">{user?.email || 'admin@gerenciador.com'}</p>
                <p className="text-xs text-gray-500 mt-1">A foto do perfil é sincronizada com sua conta do Google.</p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-100">Métodos de Pagamento</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Configure suas chaves Pix e links de pagamento (Infinite Pay, Mercado Pago, etc.) para facilitar o envio aos clientes.
            </p>

            {/* Pix Configuration */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-200 mb-3">Chaves Pix</h3>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  className="flex-1 rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  placeholder="Sua chave Pix (CPF, E-mail, Telefone ou Aleatória)"
                  value={newPixKey}
                  onChange={(e) => setNewPixKey(e.target.value)}
                />
                {editingPixKeyId && (
                  <button
                    onClick={handleCancelEditPixKey}
                    className="inline-flex items-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 shadow-sm hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleAddOrUpdatePixKey}
                  disabled={!newPixKey}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingPixKeyId ? <Check className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  {editingPixKeyId ? 'Salvar' : 'Adicionar'}
                </button>
              </div>

              {pixKeys.length > 0 ? (
                <ul className="space-y-3">
                  {pixKeys.map((k) => (
                    <li key={k.id} className="flex items-center justify-between bg-gray-700/50 px-4 py-3 rounded-md border border-gray-600">
                      <div className="flex-1 truncate mr-4">
                        <p className="text-sm font-medium text-gray-200 truncate">{k.key}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(k.key, k.id)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                          title="Copiar Chave"
                        >
                          {copiedId === k.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditPixKey(k.id, k.key)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                          title="Editar Chave"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemovePixKey(k.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-gray-600"
                          title="Remover Chave"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhuma chave Pix cadastrada.</p>
              )}
            </div>

            {/* Payment Links Configuration */}
            <div>
              <h3 className="text-md font-medium text-gray-200 mb-3">Links de Pagamento</h3>
              
              <div className="bg-gray-700/30 rounded-lg p-4 mb-4 border border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nome (Ex: Infinite Pay)</label>
                    <input
                      type="text"
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                      value={newLinkName}
                      onChange={(e) => setNewLinkName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">URL do Link</label>
                    <input
                      type="url"
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddOrUpdateLink}
                    disabled={!newLinkName || !newLinkUrl}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingLinkId ? <Check className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    {editingLinkId ? 'Salvar Link' : 'Adicionar Link'}
                  </button>
                  {editingLinkId && (
                    <button
                      onClick={handleCancelEditLink}
                      className="inline-flex items-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-300 shadow-sm hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {paymentLinks.length > 0 ? (
                <ul className="space-y-3">
                  {paymentLinks.map((link) => (
                    <li key={link.id} className="flex items-center justify-between bg-gray-700/50 px-4 py-3 rounded-md border border-gray-600">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{link.name}</p>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 truncate block max-w-xs sm:max-w-md">
                          {link.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(link.url);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                          title="Copiar Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditLink(link.id, link.name, link.url)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                          title="Editar Link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveLink(link.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-gray-600"
                          title="Remover Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhum link de pagamento cadastrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
