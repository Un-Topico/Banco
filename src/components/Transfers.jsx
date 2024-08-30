import { useState } from "react"
export const Transfers=()=>{
    const [transferAccount,setTransferAccount] = useState('')
    const handleSubmit=()=>{

    }
    return (
        <div className="container text-center">
            <h1>Transferencia</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="transferAccount">Selecciona el tipo de transferencia</label>
                <select name="" id="">
                    <option value="Deposito">Deposito</option>
                    <option value="Retiro">Retiro</option>
                    <option value="Transferencia">Transferencia</option>
                </select>
            </form>
        </div>
    )
}