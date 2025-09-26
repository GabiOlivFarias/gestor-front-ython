// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { add, isToday, isPast, parseISO } from 'date-fns';
import ClientForm from './ClientForm';
import DueClientsList from './DueClientsList';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

const calculateNextDueDate = (client) => {
  if (!client.data_inicio) return null;
  const startDate = parseISO(client.data_inicio);
  if (isNaN(startDate)) return null;

  let nextDueDate;
  if (client.frequencia === 'mensal') {
    nextDueDate = add(startDate, { months: client.parcelas_pagas });
  } else if (client.frequencia === 'semanal') {
    nextDueDate = add(startDate, { weeks: client.parcelas_pagas });
  } else {
    nextDueDate = startDate;
  }
  return nextDueDate;
};

function App() {
  const [allClients, setAllClients] = useState([]);
  const [dueClients, setDueClients] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  // --- MUDANÇA: Estado para mostrar a lista completa ---
  const [isAllClientsVisible, setIsAllClientsVisible] = useState(false);

  const fetchCobrancas = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`);
      if (!response.ok) throw new Error('Falha ao buscar dados.');
      const data = await response.json();
      setAllClients(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  }, []);

  useEffect(() => {
    fetchCobrancas();
  }, [fetchCobrancas]);

  useEffect(() => {
    const clientsForList = allClients
      .filter(client => {
        if (!client.data_inicio || client.parcelas_pagas >= client.total_parcelas) {
          return false;
        }
        const nextDueDate = calculateNextDueDate(client);
        return nextDueDate && (isToday(nextDueDate) || isPast(nextDueDate));
      })
      .map(client => {
        const nextDueDate = calculateNextDueDate(client);
        const overdue = nextDueDate && !isToday(nextDueDate) && isPast(nextDueDate);
        return { ...client, isOverdue: overdue };
      })
      .sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));

    setDueClients(clientsForList);
  }, [allClients]);

  const handleAddClient = async (clientData) => {
    // Renomeia os campos para corresponder ao backend
    const dataToSend = {
      nome_cliente: clientData.nome,
      telefone: clientData.telefone,
      valor_parcela: clientData.valor,
      valor_total: clientData.valor * clientData.totalParcelas, // Exemplo de cálculo
      vencimento: clientData.dataInicio,
      tipo_pagamento: clientData.frequencia,
      parcela_atual: clientData.parcelas_pagas,
      total_parcelas: clientData.totalParcelas,
    };

    try {
      await fetch(`${API_URL}/adicionar_cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      fetchCobrancas();
      setIsFormVisible(false);
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  const handleMarkAsPaid = async (clientId) => {
    try {
      await fetch(`${API_URL}/marcar_pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_cliente: clientId }),
      });
      fetchCobrancas();
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
    }
  };
  
  // --- MUDANÇA: Processa a lista completa para adicionar a flag ---
  const processedAllClients = allClients.map(client => {
    if (!client.data_inicio || client.parcelas_pagas >= client.total_parcelas) {
      return { ...client, isOverdue: false };
    }
    const nextDueDate = calculateNextDueDate(client);
    const overdue = nextDueDate && !isToday(nextDueDate) && isPast(nextDueDate);
    return { ...client, isOverdue: overdue };
  });

  return (
    <main className="container">
      <header>
        <h1>Gestor de Cobranças</h1>
      </header>
      
      <DueClientsList clients={dueClients} onMarkAsPaid={handleMarkAsPaid} />
      
      <article className="card">
        {isFormVisible ? (
          <ClientForm onAddClient={handleAddClient} onCancel={() => setIsFormVisible(false)} />
        ) : (
          <button onClick={() => setIsFormVisible(true)}>Adicionar Novo Serviço</button>
        )}
      </article>

      {/* --- MUDANÇA: Botão e lista completa condicional --- */}
      <article className="card">
        <button className="secondary outline" onClick={() => setIsAllClientsVisible(!isAllClientsVisible)}>
          {isAllClientsVisible ? 'Esconder Lista Completa' : 'Mostrar Lista Completa de Clientes'}
        </button>

        {isAllClientsVisible && (
          <ul>
            {processedAllClients.length > 0 ? (
              processedAllClients.map(c => (
                <li key={c.id}>
                  {c.nome_cliente} - {c.descricao || 'Serviço'} (Pagas: {c.parcela_atual || c.parcelas_pagas}/{c.total_parcelas})
                  {c.isOverdue && <span className="tag-atrasado"> ATRASADO</span>}
                </li>
              ))
            ) : (
              <p>Nenhum cliente cadastrado ainda.</p>
            )}
          </ul>
        )}
      </article>
    </main>
  );
}

export default App;
