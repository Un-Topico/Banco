import { PaymentHistory } from "../components/transactionComponents/PaymentHistory"
import { useAuth } from "../auth/authContext";

export const PaymentDetails = () => {
    const {currentUser} = useAuth();
    return(
        <PaymentHistory currentUser={currentUser}/>

    )
 
}