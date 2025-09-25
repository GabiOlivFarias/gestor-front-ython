// src/DueClientsList.js
import React from 'react';

function DueClientsList({ clients, onMarkAsPaid }) {
  const handleCopy = (client) => {
    const parcelaAtual = client.parcelas_pagas + 1;
    const descricaoCompleta = `${client.descricao} (${parcelaAtual}/${client.total_parcelas})`;
    const valorFormatado = client.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const mensagem = `Olá, ${client.nome_cliente}! Lembrete de pagamento para hoje: ${descricaoCompleta}, no valor de ${valorFormatado}. Obrigado!`;

    navigator.clipboard.writeText(mensagem);
    alert(`Mensagem para ${client.nome_cliente} copiada!`);
  };

  return (
    <article className="card">
      <h3>⚠️ Cobranças Pendentes de Hoje</h3>
      <div className="overflow-auto">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan="4" style={{textAlign: 'center'}}>Nenhuma cobrança para hoje! 🎉</td></tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td><strong>{client.nome_cliente}</strong></td>
                  <td>{client.descricao} ({client.parcelas_pagas + 1}/{client.total_parcelas})</td>
                  <td>{client.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="actions-cell">
                    <button className="secondary outline" onClick={() => handleCopy(client)}>Copiar</button>
                    <button onClick={() => onMarkAsPaid(client.id)}>Pago</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default DueClientsList;
