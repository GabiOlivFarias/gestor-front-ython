// src/ClientForm.js
import React, { useState } from 'react';

function ClientForm({ onAddClient }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [valor, setValor] = useState('');
  const [totalParcelas, setTotalParcelas] = useState(1);
  const [frequencia, setFrequencia] = useState('mensal');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddClient({ nome, telefone, descricao, dataInicio, valor: parseFloat(valor), totalParcelas: parseInt(totalParcelas), frequencia });
    e.target.reset(); // Limpa o formulário
    setTotalParcelas(1);
    setFrequencia('mensal');
  };

  return (
    <article className="card">
      <h3>Adicionar Novo Serviço</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <input type="text" placeholder="Nome do Cliente" required onChange={(e) => setNome(e.target.value)} />
          <input type="text" placeholder="Telefone" onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <input type="text" placeholder="Descrição do Serviço" id='descricao' required onChange={(e) => setDescricao(e.target.value)} />
        <div className="grid">
          <input type="date" title="Data do 1º Vencimento" required onChange={(e) => setDataInicio(e.target.value)} />
          <input type="number" step="0.01" placeholder="Valor da Parcela" required onChange={(e) => setValor(e.target.value)} />
        </div>
        <div className="grid">
          <input type="number" placeholder="Total de Parcelas" value={totalParcelas} required onChange={(e) => setTotalParcelas(e.target.value)} />
          <select value={frequencia} required onChange={(e) => setFrequencia(e.target.value)}>
            <option value="mensal">Mensal</option>
            <option value="semanal">Semanal</option>
            <option value="unica">Pagamento Único</option>
          </select>
        </div>
        <button type="submit">Adicionar Cliente</button>
      </form>
    </article>
  );
}

export default ClientForm;
