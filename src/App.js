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

// --- NOVO: função para normalizar o shape vindo do backend ---
// Mapeia campos típicos do backend para os nomes usados no front.
const normalizeClient = (c) => {
  return {
    ...c, // mantem os campos originais caso precise
    id: c.id ?? c.id_cliente ?? c._id ?? Date.now(),
    nome_cliente: c.nome_cliente ?? c.nome ?? 'Sem nome',
    descricao: c.descricao ?? c.servico ?? '',
    // data_inicio é o que calculateNextDueDate espera
    data_inicio: c.data_inicio ?? c.vencimento ?? '',
    // frequencia é o que calculateNextDueDate espera
    frequencia: c.frequencia ?? c.tipo_pagamento ?? 'mensal',
    // parcelas_pagas é o que o código usa para calcular próxima parcela
    parcelas_pagas: Number(c.parcelas_pagas ?? c.parcela_atual ?? c.parcelaAtual ?? 0),
    // total_parcelas padronizado
    total_parcelas: Number(c.total_parcelas ?? c.totalParcelas ?? 1),
    // valores opcionais
    telefone: c.telefone ?? '',
    valor: Number(c.valor ?? c.valor_parcela ?? c.valor_parcela ?? 0),
  };
};

function App() {
  const [allClients, setAllClients] = useState([]);
  const [dueClients, setDueClients] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isAllClientsVisible, setIsAllClientsVisible] = useState(false);

  const fetchCobrancas = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`);
      if (!response.ok) throw new Error('Falha ao buscar dados.');
      const data = await response.json();

      // --- ALTERAÇÃO: normaliza cada cliente recebido antes de salvar no estado ---
      const normalized = Array.isArray(data) ? data.map(normalizeClient) : [];
      setAllClients(normalized);
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
      valor_total: clientData.valor * clientData.totalParcelas,
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
      await fetchCobrancas();
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
      await fetchCobrancas();
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
    }
  };
  
  // --- Processa a lista completa (usando os campos já normalizados) ---
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

      <article className="card">
        <button className="secondary outline" onClick={() => setIsAllClientsVisible(!isAllClientsVisible)}>
          {isAllClientsVisible ? 'Esconder Lista Completa' : 'Mostrar Lista Completa de Clientes'}
        </button>

        {isAllClientsVisible && (
          <ul>
            {processedAllClients.length > 0 ? (
              processedAllClients.map(c => (
                <li key={c.id}>
                  {c.nome_cliente} - {c.descricao || 'Serviço'} (Pagas: {c.parcelas_pagas}/{c.total_parcelas})
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
