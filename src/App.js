import React, { useState, useEffect, useCallback } from 'react';
import ClientForm from './ClientForm';
import DueClientsList from './DueClientsList';
import './App.css';

// A URL do seu backend será lida da variável de ambiente
const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [dueClients, setDueClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Função para buscar os dados do backend
  const fetchCobrancas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/cobrancas`);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados da API.');
      }
      const data = await response.json();
      // O backend agora faz o filtro, então só recebemos os clientes pendentes
      setDueClients(data); 
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar cobranças:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect para buscar os dados iniciais quando o app carrega
  useEffect(() => {
    fetchCobrancas();
  }, [fetchCobrancas]);

  // Função para adicionar um novo cliente via API
  const handleAddClient = async (clientData) => {
    try {
      const response = await fetch(`${API_URL}/cobrancas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) {
        throw new Error('Falha ao adicionar cliente.');
      }
      setIsFormVisible(false); // Esconde o formulário
      fetchCobrancas();     // Atualiza a lista buscando os dados novamente
    } catch (err) {
      setError(err.message);
      console.error("Erro ao adicionar cliente:", err);
    }
  };

  // Função para marcar uma parcela como paga via API
  const handleMarkAsPaid = async (clientId) => {
    try {
      const response = await fetch(`${API_URL}/cobrancas/${clientId}/pagar`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Falha ao registrar pagamento.');
      }
      fetchCobrancas(); // Atualiza a lista buscando os dados novamente
    } catch (err) {
      setError(err.message);
      console.error("Erro ao marcar como pago:", err);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Gestor de Cobranças</h1>
      </header>
      
      {isLoading && <p>Carregando cobranças...</p>}
      {error && <p style={{color: 'red'}}>Erro: {error}</p>}
      {!isLoading && !error && (
        <DueClientsList clients={dueClients} onMarkAsPaid={handleMarkAsPaid} />
      )}
      
      <article className="card">
        {isFormVisible ? (
          <ClientForm 
            onAddClient={handleAddClient} 
            onCancel={() => setIsFormVisible(false)}
          />
        ) : (
          <button onClick={() => setIsFormVisible(true)}>Adicionar Novo Serviço</button>
        )}
      </article>
    </main>
  );
}

export default App;