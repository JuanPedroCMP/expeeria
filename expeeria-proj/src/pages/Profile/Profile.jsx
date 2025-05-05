import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import style from "./Profile.module.css";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useParams, useNavigate } from "react-router-dom";

export function Profile() {
  const { user, signOut, setUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [interests, setInterests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userPosts, setUserPosts] = useState([]);

  const isOwnerOrAdmin =
    user && profile && (user.email === profile.email || user.role === "admin");

  // Função para buscar todos os usuários
  const fetchAllUsers = async () => {
    const res = await axios.get("http://localhost:5000/users");
    setAllUsers(res.data);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      let res;
      if (id) {
        res = await axios.get(`http://localhost:5000/users?id=${id}`);
      } else if (user) {
        res = await axios.get(
          `http://localhost:5000/users?email=${user.email}`
        );
      }
      if (res && res.data && res.data[0]) {
        setProfile(res.data[0]);
        setBio(res.data[0]?.bio || "");
        setAvatar(res.data[0]?.avatar || "");
        setInterests(res.data[0]?.interests || []);
        // Busca posts do usuário
        const postsRes = await axios.get(
          `http://localhost:5000/posts?userId=${res.data[0].id}`
        );
        setUserPosts(postsRes.data);
      }
    };
    fetchProfile();
    fetchAllUsers();
  }, [user, id]);

  // Função para seguir outro usuário
  const handleFollow = async (targetId) => {
    if (!user || !profile || user.id === targetId) return;

    // Atualiza o usuário logado (following)
    const userRes = await axios.get(`http://localhost:5000/users/${user.id}`);
    const userFollowing = userRes.data.following || [];
    if (!userFollowing.includes(targetId)) {
      await axios.patch(`http://localhost:5000/users/${user.id}`, {
        following: [...userFollowing, targetId],
      });
    }

    // Atualiza o perfil visitado (followers)
    const profileRes = await axios.get(
      `http://localhost:5000/users/${targetId}`
    );
    const profileFollowers = profileRes.data.followers || [];
    if (!profileFollowers.includes(user.id)) {
      await axios.patch(`http://localhost:5000/users/${targetId}`, {
        followers: [...profileFollowers, user.id],
      });
    }

    // Atualiza estados locais
    if (profile.id === targetId) {
      const res = await axios.get(`http://localhost:5000/users?id=${targetId}`);
      setProfile(res.data[0]);
    }
    await fetchAllUsers();
    // Atualiza usuário logado no localStorage/contexto
    const updatedUserRes = await axios.get(
      `http://localhost:5000/users/${user.id}`
    );
    localStorage.setItem("user", JSON.stringify(updatedUserRes.data));
    if (typeof setUser === "function") setUser(updatedUserRes.data);
  };

  // Função para parar de seguir outro usuário
  const handleUnfollow = async (targetId) => {
    if (!user || !profile || user.id === targetId) return;

    // Atualiza o usuário logado (following)
    const userRes = await axios.get(`http://localhost:5000/users/${user.id}`);
    const userFollowing = userRes.data.following || [];
    if (userFollowing.includes(targetId)) {
      await axios.patch(`http://localhost:5000/users/${user.id}`, {
        following: userFollowing.filter((id) => id !== targetId),
      });
    }

    // Atualiza o perfil visitado (followers)
    const profileRes = await axios.get(
      `http://localhost:5000/users/${targetId}`
    );
    const profileFollowers = profileRes.data.followers || [];
    if (profileFollowers.includes(user.id)) {
      await axios.patch(`http://localhost:5000/users/${targetId}`, {
        followers: profileFollowers.filter((id) => id !== user.id),
      });
    }

    // Atualiza estados locais
    if (profile.id === targetId) {
      const res = await axios.get(`http://localhost:5000/users?id=${targetId}`);
      setProfile(res.data[0]);
    }
    await fetchAllUsers();
    // Atualiza usuário logado no localStorage/contexto
    const updatedUserRes = await axios.get(
      `http://localhost:5000/users/${user.id}`
    );
    localStorage.setItem("user", JSON.stringify(updatedUserRes.data));
    if (typeof setUser === "function") setUser(updatedUserRes.data);
  };

  // Função para salvar edição do perfil
  const handleSave = async () => {
    await axios.patch(`http://localhost:5000/users/${profile.id}`, {
      bio,
      avatar,
      interests,
    });
    setEditing(false);
    // Atualiza perfil
    const res = await axios.get(`http://localhost:5000/users?id=${profile.id}`);
    setProfile(res.data[0]);
  };

  if (!profile) return <p>Carregando perfil...</p>;

  return (
    <div className={style.profileBox}>
      <h2>Perfil de {profile.name || profile.email}</h2>
      <img
        src={avatar || "https://i.pravatar.cc/150?u=" + profile.email}
        alt="Avatar"
        className={style.avatar}
      />
      {editing && isOwnerOrAdmin ? (
        <>
          <input
            type="text"
            placeholder="URL da foto de perfil"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
          <textarea
            placeholder="Sua bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
          <div>
            <label>Interesses:</label>
            <select
              multiple
              value={interests}
              onChange={(e) =>
                setInterests(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
            >
              {categoriasPadrao.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={() => setEditing(false)}>Cancelar</button>
        </>
      ) : (
        <>
          <p>
            <b>Email:</b> {profile.email}
          </p>
          <p>
            <b>Bio:</b> {profile.bio || "Adicione uma bio!"}
          </p>
          <p>
            <select
              multiple
              value={interests}
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (o) => o.value
                );
                if (values.length <= 3) setInterests(values);
              }}
            >
              {categoriasPadrao.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: "#aaa" }}>
              Selecione até 3 interesses
            </p>
          </p>
          {isOwnerOrAdmin && (
            <button onClick={() => setEditing(true)}>Editar perfil</button>
          )}
          {isOwnerOrAdmin && <button onClick={signOut}>Sair</button>}
          {/* Botão seguir/parar de seguir só aparece se não for o próprio perfil */}
          {!isOwnerOrAdmin &&
            user &&
            profile.id !== user.id &&
            (profile.followers?.includes(user.id) ? (
              <button
                style={{ color: "#fff", background: "#e74c3c", marginLeft: 8 }}
                onClick={() => handleUnfollow(profile.id)}
              >
                Parar de seguir
              </button>
            ) : (
              <button
                style={{ marginLeft: 8 }}
                onClick={() => handleFollow(profile.id)}
              >
                Seguir
              </button>
            ))}
        </>
      )}

      <hr />
      <h3>Posts deste usuário</h3>
      <ul>
        {userPosts.length === 0 && <li>Nenhum post ainda.</li>}
        {userPosts.map((post) => (
          <li key={post.id}>
            <b>{post.title}</b> - {post.caption}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => navigate(`/post/${post.id}`)}
            >
              Ver post
            </button>
          </li>
        ))}
      </ul>

      <hr />
      <h3>Outros usuários</h3>
      <ul>
        {allUsers
          .filter((u) => u.id !== profile.id)
          .map((u) => (
            <li key={u.id}>
              <img
                src={u.avatar || "https://i.pravatar.cc/50?u=" + u.email}
                alt="avatar"
                style={{ width: 32, borderRadius: "50%", marginRight: 8 }}
              />
              <span
                style={{ cursor: "pointer", color: "#8ecae6" }}
                onClick={() => navigate(`/perfil/${u.id}`)}
              >
                {u.email}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
