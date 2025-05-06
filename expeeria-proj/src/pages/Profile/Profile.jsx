import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import style from "./Profile.module.css";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useParams, useNavigate } from "react-router-dom";
import { UploadImage } from "../../components/UploadImage";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function toMultiArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string") {
      try {
        const arr = JSON.parse(val);
        if (Array.isArray(arr)) return arr.filter(Boolean);
      } catch {
        return [val];
      }
    }
    return [];
  }

  const isOwnerOrAdmin =
    user && profile && (user.email === profile.email || user.role === "admin");

  // Função para buscar todos os usuários
  const fetchAllUsers = async () => {
    const res = await api.get("/users");
    setAllUsers(res.data);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      let res;
      if (id) {
        res = await api.get(`/users?id=${id}`);
      } else if (user) {
        res = await api.get(`/users?email=${user.email}`);
      }
      if (res && res.data && res.data[0]) {
        setProfile(res.data[0]);
        setBio(res.data[0]?.bio || "");
        setAvatar(res.data[0]?.avatar || "");
        setInterests(toMultiArray(res.data[0]?.interests));
        setName(res.data[0]?.name || "");
        setEmail(res.data[0]?.email || "");
        // Busca posts do usuário
        const postsRes = await api.get(`/posts?userId=${res.data[0].id}`);
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
    const userRes = await api.get(`/users/${user.id}`);
    const userFollowing = userRes.data.following || [];
    if (!userFollowing.includes(targetId)) {
      await api.patch(`/users/${user.id}`, {
        following: [...userFollowing, targetId],
      });
    }

    // Atualiza o perfil visitado (followers)
    const profileRes = await api.get(`/users/${targetId}`);
    const profileFollowers = profileRes.data.followers || [];
    if (!profileFollowers.includes(user.id)) {
      await api.patch(`/users/${targetId}`, {
        followers: [...profileFollowers, user.id],
      });
    }

    // Atualiza estados locais
    if (profile.id === targetId) {
      const res = await api.get(`/users?id=${targetId}`);
      setProfile(res.data[0]);
    }
    await fetchAllUsers();
    // Atualiza usuário logado no localStorage/contexto
    const updatedUserRes = await api.get(`/users/${user.id}`);
    localStorage.setItem("user", JSON.stringify(updatedUserRes.data));
    if (typeof setUser === "function") setUser(updatedUserRes.data);
  };

  // Função para parar de seguir outro usuário
  const handleUnfollow = async (targetId) => {
    if (!user || !profile || user.id === targetId) return;

    // Atualiza o usuário logado (following)
    const userRes = await api.get(`/users/${user.id}`);
    const userFollowing = userRes.data.following || [];
    if (userFollowing.includes(targetId)) {
      await api.patch(`/users/${user.id}`, {
        following: userFollowing.filter((id) => id !== targetId),
      });
    }

    // Atualiza o perfil visitado (followers)
    const profileRes = await api.get(`/users/${targetId}`);
    const profileFollowers = profileRes.data.followers || [];
    if (profileFollowers.includes(user.id)) {
      await api.patch(`/users/${targetId}`, {
        followers: profileFollowers.filter((id) => id !== user.id),
      });
    }

    // Atualiza estados locais
    if (profile.id === targetId) {
      const res = await api.get(`/users?id=${targetId}`);
      setProfile(res.data[0]);
    }
    await fetchAllUsers();
    // Atualiza usuário logado no localStorage/contexto
    const updatedUserRes = await api.get(`/users/${user.id}`);
    localStorage.setItem("user", JSON.stringify(updatedUserRes.data));
    if (typeof setUser === "function") setUser(updatedUserRes.data);
  };

  // Função para salvar edição do perfil
  const handleSave = async () => {
    await api.patch(`/users/${profile.id}`, {
      name,
      email,
      bio,
      avatar,
      interests,
    });
    setEditing(false);
    // Atualiza perfil
    const res = await api.get(`/users?id=${profile.id}`);
    setProfile(res.data[0]);
    // Se o usuário editou o próprio perfil, atualize o contexto/localStorage
    if (user && user.id === profile.id) {
      setUser({
        ...user,
        name,
        email,
        bio,
        avatar,
        interests,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name,
          email,
          bio,
          avatar,
          interests,
        })
      );
    }
  };

  if (!profile) return <p>Carregando perfil...</p>;

  return (
    <div className={style.profileBox}>
      <h2>
        {profile.name || profile.email}{" "}
        <span style={{ color: "#8ecae6", fontSize: 16 }}>
          @{profile.username}
        </span>
      </h2>
      <img
        src={avatar || "https://i.pravatar.cc/150?u=" + profile.email}
        alt="Avatar"
        className={style.avatar}
      />
      {editing && isOwnerOrAdmin ? (
        <>
          <label>
            Nome:
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ marginLeft: 8, marginBottom: 8 }}
            />
          </label>
          <label>
            E-mail:
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ marginLeft: 8, marginBottom: 8 }}
            />
          </label>
          <label>
            Nome de usuário:
            <input
              type="text"
              value={profile.username}
              disabled
              style={{
                background: "#222",
                color: "#aaa",
                fontStyle: "italic",
                marginLeft: 8,
                marginBottom: 8,
              }}
            />
          </label>
          <UploadImage
            onUpload={setAvatar}
            preset="expeeria_avatar"
            previewStyle={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              marginTop: 8,
            }}
          />
          <textarea
            placeholder="Sua bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
          <div>
            <label>Interesses:</label>
            <div className={style["interesses-checkboxes"]}>
              {categoriasPadrao.map((cat) => (
                <label key={cat} className={style["interesse-label"]}>
                  <input
                    type="checkbox"
                    value={cat}
                    checked={interests.includes(cat)}
                    disabled={!interests.includes(cat) && interests.length >= 3}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (interests.length < 3)
                          setInterests([...interests, cat]);
                      } else {
                        setInterests(interests.filter((i) => i !== cat));
                      }
                    }}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#aaa" }}>
              Selecione até 3 interesses
            </p>
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
            <b>Nome:</b> {profile.name}
          </p>
          <p>
            <b>Nome de usuário:</b>{" "}
            <span style={{ color: "#8ecae6" }}>@{profile.username}</span>
          </p>
          <p>
            <b>Bio:</b> {profile.bio || "Adicione uma bio!"}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              margin: "8px 0",
            }}
          >
            {toMultiArray(profile.interests).length === 0 ? (
              <span style={{ color: "#aaa" }}>
                Nenhum interesse selecionado
              </span>
            ) : (
              toMultiArray(profile.interests).map((cat) => (
                <span
                  key={cat}
                  style={{
                    background: "#8ecae6",
                    color: "#23283a",
                    borderRadius: 12,
                    padding: "2px 12px",
                    fontSize: 14,
                    marginRight: 4,
                  }}
                >
                  {cat}
                </span>
              ))
            )}
          </div>
          <p style={{ fontSize: 12, color: "#aaa" }}>
            Principais interesses
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