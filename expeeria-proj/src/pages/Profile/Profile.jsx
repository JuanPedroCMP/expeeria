import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import style from "./Profile.module.css";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useParams, useNavigate } from "react-router-dom";
import { UploadImage } from "../../components/UploadImage";
import supabase from "../../services/supabase";
import { usePost } from "../../hooks/usePost";
import { Card } from "../../components/Card/Card";

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
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState('posts');
  const [loadingAction, setLoadingAction] = useState(false);
  const avatarInputRef = useRef(null);
  const { getPostsByUser } = usePost();

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

  // Busca todos os usuários
  const fetchAllUsers = async () => {
    try {
      setLoadingAction(true);
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, username, email, avatar, followers, following')
        .order('name', { ascending: true })
        .limit(20); // Limitando a 20 usuários por performance
        
      if (error) throw error;
      
      setAllUsers(users || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setAllUsers([]);
    } finally {
      setLoadingAction(false);
    }
  };

  // Método para buscar detalhes do perfil de um usuário
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      let profileData;
      let profileId = id || (user ? user.id : null);
      
      if (!profileId) {
        setError("Você precisa estar logado para acessar o perfil.");
        setLoading(false);
        return;
      }
      
      // Buscar dados do perfil
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (profileError) throw profileError;
      profileData = data;
      
      if (profileData) {
        // Definir o perfil e todos os campos relacionados
        setProfile(profileData);
        setBio(profileData?.bio || "");
        setAvatar(profileData?.avatar || "");
        setInterests(toMultiArray(profileData?.interests));
        setName(profileData?.name || "");
        setEmail(profileData?.email || "");
        setUsername(profileData?.username || "");
        
        // Definir seguidores e seguindo
        const followersList = toMultiArray(profileData.followers);
        const followingList = toMultiArray(profileData.following);
        setFollowers(followersList);
        setFollowing(followingList);
        
        // Buscar posts do usuário usando o hook usePost
        try {
          const userPostsData = await getPostsByUser(profileData.id);
          setUserPosts(userPostsData || []);
        } catch (postsError) {
          console.error('Erro ao buscar posts do usuário:', postsError);
          // Não interrompemos o fluxo principal se falhar ao buscar posts
        }
      } else {
        setError("Perfil não encontrado.");
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError("Erro ao carregar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAllUsers();
  }, [user, id]);

  // Função para seguir outro usuário
  const handleFollow = async (targetId) => {
    if (!user || !profile || user.id === targetId) return;
    
    try {
      setLoadingAction(true);
      setError('');
      
      // Buscar dados atuais do usuário logado
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('following')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      
      // Buscar dados atuais do perfil alvo
      const { data: targetData, error: targetError } = await supabase
        .from('users')
        .select('followers')
        .eq('id', targetId)
        .single();
      
      if (targetError) throw targetError;
      
      // Preparar arrays de seguidores/seguindo
      const userFollowing = toMultiArray(userData.following);
      const targetFollowers = toMultiArray(targetData.followers);
      
      // Verificar se já está seguindo para evitar duplicações
      if (!userFollowing.includes(targetId)) {
        // Atualizar o usuário logado (seguindo)
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ following: [...userFollowing, targetId] })
          .eq('id', user.id);
          
        if (updateUserError) throw updateUserError;
        
        // Atualizar o perfil alvo (seguidores)
        const { error: updateTargetError } = await supabase
          .from('users')
          .update({ followers: [...targetFollowers, user.id] })
          .eq('id', targetId);
          
        if (updateTargetError) throw updateTargetError;
        
        setSuccess(`Você agora está seguindo este usuário.`);
        
        // Atualizar perfil e lista de usuários
        fetchProfile();
        fetchAllUsers();
      }
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      setError('Não foi possível seguir este usuário. Tente novamente.');
    } finally {
      setLoadingAction(false);
      
      // Limpar mensagem de sucesso após 3 segundos
      if (success) {
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  // Função para parar de seguir outro usuário
  const handleUnfollow = async (targetId) => {
    if (!user || !profile || user.id === targetId) return;
    
    try {
      setLoadingAction(true);
      setError('');
      
      // Buscar dados atuais do usuário logado
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('following')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      
      // Buscar dados atuais do perfil alvo
      const { data: targetData, error: targetError } = await supabase
        .from('users')
        .select('followers')
        .eq('id', targetId)
        .single();
      
      if (targetError) throw targetError;
      
      // Preparar arrays de seguidores/seguindo
      const userFollowing = toMultiArray(userData.following);
      const targetFollowers = toMultiArray(targetData.followers);
      
      // Verificar se já está seguindo
      if (userFollowing.includes(targetId)) {
        // Atualizar o usuário logado (seguindo)
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ following: userFollowing.filter(id => id !== targetId) })
          .eq('id', user.id);
          
        if (updateUserError) throw updateUserError;
        
        // Atualizar o perfil alvo (seguidores)
        const { error: updateTargetError } = await supabase
          .from('users')
          .update({ followers: targetFollowers.filter(id => id !== user.id) })
          .eq('id', targetId);
          
        if (updateTargetError) throw updateTargetError;
        
        setSuccess(`Você deixou de seguir este usuário.`);
        
        // Atualizar perfil e lista de usuários
        fetchProfile();
        fetchAllUsers();
      }
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      setError('Não foi possível deixar de seguir este usuário. Tente novamente.');
    } finally {
      setLoadingAction(false);
      
      // Limpar mensagem de sucesso após 3 segundos
      if (success) {
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  // Função para salvar edição do perfil
  const handleSave = async () => {
    if (!isOwnerOrAdmin) return;
    
    try {
      setLoadingAction(true);
      setError("");
      setSuccess("");
      
      // Validação básica dos campos
      if (!name.trim()) {
        setError("O nome não pode estar vazio");
        setLoadingAction(false);
        return;
      }
      
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        setError("E-mail inválido");
        setLoadingAction(false);
        return;
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name,
          email,
          bio,
          avatar,
          interests
        })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      setEditing(false);
      setSuccess("Perfil salvo com sucesso!");
      
      // Atualiza os dados do perfil na tela
      fetchProfile();
      
      // Se o usuário editou o próprio perfil, atualize o contexto
      if (user && user.id === profile.id && setUser) {
        setUser(prev => ({
          ...prev,
          name,
          email,
          bio,
          avatar,
          interests
        }));
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setError("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Função para alternar entre as abas
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Função para abrir o seletor de avatar
  const handleAvatarClick = () => {
    if (isOwnerOrAdmin && editing) {
      avatarInputRef.current?.click();
    }
  };

  return (
    <div className={style.profileContainer}>
      {loading ? (
        <div className={style.loadingContainer}>
          <div className={style.spinner}></div>
          <p>Carregando perfil...</p>
        </div>
      ) : error ? (
        <div className={style.errorMessage}>
          <p>{error}</p>
        </div>
      ) : profile ? (
        <>
          <div className={style.profileHeader}>
            <div className={style.profileInfo}>
              <div className={style.avatarContainer}>
                <img
                  src={profile.avatar || `https://i.pravatar.cc/150?u=${profile.email}`}
                  alt={`Avatar de ${profile.name || 'usuário'}`}
                  className={style.profileAvatar}
                  onClick={handleAvatarClick}
                />
                {isOwnerOrAdmin && editing && (
                  <div className={style.editOverlay}>
                    <span className={style.editIcon}>📷</span>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
              
              <div className={style.userDetails}>
                <h2 className={style.userName}>{profile.name || "Usuário"}</h2>
                <p className={style.userUsername}>@{profile.username || profile.email.split('@')[0]}</p>
                
                <div className={style.userStats}>
                  <div className={style.statItem}>
                    <span className={style.statCount}>{userPosts.length}</span>
                    <span className={style.statLabel}>Posts</span>
                  </div>
                  <div 
                    className={style.statItem} 
                    onClick={() => handleTabChange('seguidores')}
                  >
                    <span className={style.statCount}>{followers.length}</span>
                    <span className={style.statLabel}>Seguidores</span>
                  </div>
                  <div 
                    className={style.statItem}
                    onClick={() => handleTabChange('seguindo')}
                  >
                    <span className={style.statCount}>{following.length}</span>
                    <span className={style.statLabel}>Seguindo</span>
                  </div>
                </div>
                
                <div className={style.actionButtons}>
                  {isOwnerOrAdmin ? (
                    <>
                      {editing ? (
                        <>
                          <button 
                            className={`${style.actionButton} ${style.saveButton}`}
                            onClick={handleSave}
                          >
                            Salvar
                          </button>
                          <button 
                            className={style.actionButton}
                            onClick={() => setEditing(false)}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className={style.actionButton}
                            onClick={() => setEditing(true)}
                          >
                            Editar Perfil
                          </button>
                          <button 
                            className={`${style.actionButton} ${style.logoutButton}`}
                            onClick={signOut}
                          >
                            Sair
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    user && (
                      <button 
                        className={`${style.actionButton} ${followers.includes(user.id) ? style.unfollowButton : style.followButton}`}
                        onClick={() => followers.includes(user.id) ? handleUnfollow(profile.id) : handleFollow(profile.id)}
                        disabled={loadingAction}
                      >
                        {followers.includes(user.id) ? 'Deixar de seguir' : 'Seguir'}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
            
            {success && (
              <div className={style.successMessage}>
                <p>{success}</p>
              </div>
            )}
            
            {error && (
              <div className={style.errorMessage}>
                <p>{error}</p>
              </div>
            )}
          </div>
          
          <div className={style.profileTabs}>
            <div
              className={`${style.profileTab} ${activeTab === 'posts' ? style.active : ''}`}
              onClick={() => handleTabChange('posts')}
            >
              Posts
            </div>
            <div
              className={`${style.profileTab} ${activeTab === 'sobre' ? style.active : ''}`}
              onClick={() => handleTabChange('sobre')}
            >
              Sobre
            </div>
            <div
              className={`${style.profileTab} ${activeTab === 'seguidores' ? style.active : ''}`}
              onClick={() => handleTabChange('seguidores')}
            >
              Seguidores
            </div>
            <div
              className={`${style.profileTab} ${activeTab === 'seguindo' ? style.active : ''}`}
              onClick={() => handleTabChange('seguindo')}
            >
              Seguindo
            </div>
          </div>
          
          {/* Conteúdo da aba Posts */}
          {activeTab === 'posts' && (
            <div className={style.tabContent}>
              <h3 className={style.sectionHeading}>
                <span className={style.sectionIcon}>📝</span>
                Posts publicados
              </h3>
              
              {userPosts.length > 0 ? (
                <div className={style.userPostsGrid}>
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className={style.postCard}
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <Card
                        TituloCard={post.title}
                        SubTitulo={post.categories?.length > 0 ? post.categories.join(", ") : "Geral"}
                        Descricao={post.caption}
                        likes={post.likeCount || 0}
                        id={post.id}
                        imageUrl={post.imageUrl}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={style.emptyStateMessage}>
                  <p>Nenhum post publicado ainda.</p>
                  {isOwnerOrAdmin && (
                    <button 
                      className={style.actionButton}
                      onClick={() => navigate('/criar_post')}
                    >
                      Criar seu primeiro post
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Conteúdo da aba Sobre */}
          {activeTab === 'sobre' && (
            <div className={style.tabContent}>
              <h3 className={style.sectionHeading}>
                <span className={style.sectionIcon}>👤</span>
                Sobre {profile.name}
              </h3>
              
              <p className={style.bioInfo}>
                {profile.bio || "Este usuário ainda não adicionou uma bio."}
              </p>
              
              <h4>Interesses</h4>
              <div style={{ marginTop: '0.75rem' }}>
                {toMultiArray(profile.interests).length > 0 ? (
                  toMultiArray(profile.interests).map((cat) => (
                    <span key={cat} className={style.badgeItem}>
                      {cat}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "#94a3b8" }}>
                    Nenhum interesse selecionado ainda.
                  </p>
                )}
              </div>
              
              <h4 style={{ marginTop: '1.5rem' }}>Informações de contato</h4>
              <p className={style.contactInfo}>
                <strong>Email:</strong> {profile.email}
              </p>
            </div>
          )}
          
          {/* Conteúdo da aba Seguidores */}
          {activeTab === 'seguidores' && (
            <div className={style.tabContent}>
              <h3 className={style.sectionHeading}>
                <span className={style.sectionIcon}>👥</span>
                Seguidores ({followers.length})
              </h3>
              
              <div className={style.followSection}>
                {followers.length > 0 ? (
                  <div>
                    {allUsers
                      .filter(u => followers.includes(u.id))
                      .map(follower => (
                        <div key={follower.id} className={style.userItem}>
                          <img
                            src={follower.avatar || `https://i.pravatar.cc/80?u=${follower.email}`}
                            alt={`Avatar de ${follower.name}`}
                            className={style.userAvatar}
                          />
                          <div>
                            <div className={style.userName} onClick={() => navigate(`/perfil/${follower.id}`)}>
                              {follower.name || "Usuário"}
                            </div>
                            <div className={style.userUsername}>
                              @{follower.username || follower.email.split('@')[0]}
                            </div>
                          </div>
                          {user && user.id !== follower.id && (
                            <button 
                              className={`${style.followButton} ${user.following?.includes(follower.id) ? style.unfollowButton : style.followButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (user.following?.includes(follower.id)) {
                                  handleUnfollow(follower.id);
                                } else {
                                  handleFollow(follower.id);
                                }
                              }}
                            >
                              {user.following?.includes(follower.id) ? 'Seguindo' : 'Seguir'}
                            </button>
                          )}
                        </div>
                      ))}
                      
                    {followers.length > allUsers.filter(u => followers.includes(u.id)).length && (
                      <p className={style.viewAllUsers}>
                        Alguns seguidores não puderam ser carregados
                      </p>
                    )}
                  </div>
                ) : (
                  <div className={style.emptyStateMessage}>
                    <p>Este usuário ainda não tem seguidores.</p>
                    {user && profile.id !== user.id && !followers.includes(user.id) && (
                      <button 
                        className={style.actionButton}
                        onClick={() => handleFollow(profile.id)}
                      >
                        Seja o primeiro a seguir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Conteúdo da aba Seguindo */}
          {activeTab === 'seguindo' && (
            <div className={style.tabContent}>
              <h3 className={style.sectionHeading}>
                <span className={style.sectionIcon}>👤</span>
                Seguindo ({following.length})
              </h3>
              
              <div className={style.followSection}>
                {following.length > 0 ? (
                  <div>
                    {allUsers
                      .filter(u => following.includes(u.id))
                      .map(followedUser => (
                        <div key={followedUser.id} className={style.userItem}>
                          <img
                            src={followedUser.avatar || `https://i.pravatar.cc/80?u=${followedUser.email}`}
                            alt={`Avatar de ${followedUser.name}`}
                            className={style.userAvatar}
                          />
                          <div>
                            <div className={style.userName} onClick={() => navigate(`/perfil/${followedUser.id}`)}>
                              {followedUser.name || "Usuário"}
                            </div>
                            <div className={style.userUsername}>
                              @{followedUser.username || followedUser.email.split('@')[0]}
                            </div>
                          </div>
                          {user && user.id === profile.id && (
                            <button 
                              className={`${style.followButton} ${style.unfollowButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnfollow(followedUser.id);
                              }}
                            >
                              Deixar de seguir
                            </button>
                          )}
                        </div>
                      ))}
                      
                    {following.length > allUsers.filter(u => following.includes(u.id)).length && (
                      <p className={style.viewAllUsers}>
                        Alguns usuários seguidos não puderam ser carregados
                      </p>
                    )}
                  </div>
                ) : (
                  <div className={style.emptyStateMessage}>
                    <p>Este usuário ainda não segue ninguém.</p>
                    {isOwnerOrAdmin && (
                      <button 
                        className={style.actionButton}
                        onClick={() => navigate('/explorar')}
                      >
                        Explorar usuários
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
