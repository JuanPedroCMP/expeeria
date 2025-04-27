import { Button, TIPO_BOTAO } from "../../components/Button";

const Inicial = () => {
  return (
    <>
      <h1>Teste</h1>
      <h3>Pequeno texto</h3>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem nobis
        architecto, asperiores voluptas quasi autem adipisci aperiam obcaecati
        magni atque, tenetur quae iure aspernatur neque sequi blanditiis placeat
        eligendi? Debitis.
      </p>
      <Button destino="des" texto="Página inesistente" />
      <Button destino="tes" texto="Página inesistente" tipo={TIPO_BOTAO.DESTAQUE}/>
    </>
  );
};

export { Inicial };
