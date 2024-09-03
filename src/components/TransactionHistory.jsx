import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all"); // Estado para el filtro
  const { currentUser } = useAuth();

  const db = getFirestore(app);

  useEffect(() => {
    // Construir la consulta basada en el filtro seleccionado
    let q = query(
      collection(db, "transactions"),
      where("account_id", "==", `account_${currentUser.uid}`)
    );

    if (filter !== "all") {
      q = query(
        collection(db, "transactions"),
        where("account_id", "==", `account_${currentUser.uid}`),
        where("status", "==", filter)
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push(doc.data());
      });

      // Ordenar por fecha de transacción (más reciente primero)
      transactionsData.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());

      setTransactions(transactionsData);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser.uid, db, filter]); // Se añade 'filter' como dependencia

  return (
    <div className="container text-center">
      <h2>Historial de Transacciones</h2>

      {/* Menú de selección de filtro */}
      <div className="filter-menu">
        <label htmlFor="filter">Filtrar por tipo: </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="sent">Realizadas</option>
          <option value="received">Recibidas</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <p>No se encontraron transacciones.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID de Transacción</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.transaction_id}>
                <td>{transaction.transaction_id}</td>
                <td>{transaction.status}</td> {/* Mostrar el tipo de transacción */}
                <td>${transaction.amount}</td>
                <td>{transaction.transaction_date.toDate().toLocaleString()}</td>
                <td>{transaction.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}; 