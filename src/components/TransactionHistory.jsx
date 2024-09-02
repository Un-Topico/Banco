import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const { currentUser } = useAuth();

  const db = getFirestore(app);

  useEffect(() => {
    const q = query(
      collection(db, "transactions"),
      where("account_id", "==", `account_${currentUser.uid}`)
    );

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
  }, [currentUser.uid, db]);

  return (
    <div className="container text-center">
      <h2>Historial de Transacciones</h2>
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
                <td>{transaction.transaction_type}</td>
                <td>{transaction.amount}</td>
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
