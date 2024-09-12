import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

export const useUserData = (currentUser, selectedCard) => {
  const [userRole, setUserRole] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      const db = getFirestore(app);

      // Obtener rol del usuario
      const rolesCollection = collection(db, "roles");
      const roleQuery = query(rolesCollection, where("email", "==", currentUser.email));
      const rolesSnapshot = await getDocs(roleQuery);

      if (!rolesSnapshot.empty) {
        const userRoleData = rolesSnapshot.docs[0].data();
        setUserRole(userRoleData.role);
      }

      // Obtener datos de la cuenta
      const accountsCollection = collection(db, "accounts");
      const accountQuery = query(
        accountsCollection,
        where("ownerId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(accountQuery);

      if (!querySnapshot.empty) {
        const accountInfo = querySnapshot.docs[0].data();
        setAccountData(accountInfo);

        // Obtener transacciones
        const transactionsRef = collection(db, "transactions");
        const transactionsQuery = query(
          transactionsRef,
          where("card_id", "==", selectedCard?.cardId || accountInfo.cardId)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        const transactionsData = transactionsSnapshot.docs.map((doc) => doc.data());
        transactionsData.sort(
          (a, b) => b.transaction_date.toDate() - a.transaction_date.toDate()
        );
        setTransactions(transactionsData);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, selectedCard]);

  return { userRole, accountData, transactions, loading };
};
