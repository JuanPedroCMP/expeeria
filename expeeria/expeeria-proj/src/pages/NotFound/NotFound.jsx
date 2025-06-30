import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <div style={{textAlign: "center"}}>
        <h1>Erro <b>404</b> </h1>
        <br />
        <p>Página não encontrada. Tente voltar à <Link to="/">página Inicial</Link></p>
        </div>
    )
}

export {NotFound};