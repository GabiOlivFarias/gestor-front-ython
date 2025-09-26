// src/DueClientsList.js
import React from 'react';

function DueClientsList({ clients, onMarkAsPaid }) {
  const handleCopy = (client) => {
    // ... (função de copiar continua igual)
  };

  return (
    <article className="card">
      {/* O título já é genérico, perfeito! */}
      <h3>⚠️ Cobranças Pendentes</h3>
      <div className="overflow-auto">
        <table>
          {/* ... (o resto da tabela continua igual) ... */}
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan="4" style={{textAlign: 'center'}}>Nenhuma cobrança pendente! 🎉</td></tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <strong>{client.nome_cliente}</strong>
                    {/* A lógica da tag de atraso já está aqui! */}
                    {client.isOverdue && <span className="tag-atrasado"> ATRASADO</span>}
                  </td>
                  <td>{client.descricao || 'Serviço'} ({client.parcela_atual || client.parcelas_pagas + 1}/{client.total_parcelas})</td>
                  <td>{client.valor_parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="actions-cell">
                    <button className="secondary outline" onClick={() => handleCopy(client)}>Copiar</button>
                    {/* --- MUDANÇA: Passa o ID correto para a função --- */}
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
