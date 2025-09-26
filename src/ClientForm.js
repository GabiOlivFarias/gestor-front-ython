// src/ClientForm.js
import React, { useState } from 'react';

function ClientForm({ onAddClient, onCancel }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [valor, setValor] = useState('');
  const [totalParcelas, setTotalParcelas] = useState('');
  const [parcelasPagas, setParcelasPagas] = useState('');
  const [frequencia, setFrequencia] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddClient({ 
      nome, 
      telefone, 
      descricao, 
      dataInicio, 
      valor: parseFloat(valor), 
      totalParcelas: parseInt(totalParcelas) || 1, 
      frequencia,
      parcelas_pagas: parseInt(parcelasPagas) || 0 
    });
  };

  return (
    <article className="card">
      <h3>Adicionar Novo Cliente</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <input type="text" placeholder="Nome do Cliente" required onChange={(e) => setNome(e.target.value)} />
          <input type="text" placeholder="Telefone" onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <input type="text" placeholder="Descrição do Serviço" id='descricao' required onChange={(e) => setDescricao(e.target.value)} />
        <div className="grid">
           <input 
            type="date" 
            value={dataInicio} 
            required 
            onChange={(e) => setDataInicio(e.target.value)}
            data-placeholder="Data do 1º Vencimento"
          />
          <input type="number" step="0.01" placeholder="Valor da Parcela" required onChange={(e) => setValor(e.target.value)} />
        </div>
        <div className="grid">
          <input type="number" placeholder="Parcelas Pagas (Inicial)" value={parcelasPagas} onChange={(e) => setParcelasPagas(e.target.value)} />
          <input type="number" placeholder="Total de Parcelas" value={totalParcelas} required onChange={(e) => setTotalParcelas(e.target.value)} />
        </div>
        <select value={frequencia} required onChange={(e) => setFrequencia(e.target.value)}>
          <option value="mensal">Mensal</option>
          <option value="semanal">Semanal</option>
          <option value="unica">Pagamento Único</option>
        </select>
        <button type="submit">Adicionar Cliente</button>
      </form>
    </article>
  );
}

export default ClientForm;
