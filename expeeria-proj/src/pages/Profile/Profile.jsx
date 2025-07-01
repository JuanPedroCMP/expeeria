import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import style from "./Profile.module.css";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useParams, useNavigate } from "react-router-dom";
import { UploadImage } from "../../components/UploadImage";
import supabase from "../../services/supabase";
import { usePost } from "../../hooks/usePost";
import { Card } from "../../components/Card/Card";
import { Skeleton } from "../../components/Skeleton/Skeleton";

export function Profile() {
  const { user, logout } = useAuth();
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
  const { loadAllPosts } = usePost();

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
    user && profile && (user.id === profile.id || user.email === profile.email || user.role === "admin");

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

  // Função auxiliar para buscar posts de um usuário
  const getUserPosts = async (userId) => {
    try {
      console.log('Buscando posts para o usuário:', userId);
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_categories (
            category
          )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transformar as categorias em um array simples para compatibilidade
      const postsWithCategories = (posts || []).map(post => ({
        ...post,
        categories: post.post_categories?.map(pc => pc.category) || []
      }));
      
      return postsWithCategories;
    } catch (error) {
      console.error('Erro ao buscar posts do usuário:', error);
      return [];
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
      
      // Buscar dados do perfil - verificando se existe a tabela 'profiles' ou 'users'
      let profileResponse = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      // Se retornar erro, tentar a tabela 'users'
      if (profileResponse.error) {
        profileResponse = await supabase
          .from('users')
          .select('*')
          .eq('id', profileId)
          .single();
      }
      
      // Se ainda tiver erro, tentar buscar diretamente os dados do auth
      if (profileResponse.error && user && user.id === profileId) {
        // Criar um objeto com os dados do usuau00e1rio logado
        profileData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || '',
          avatar: user.user_metadata?.avatar_url || '',
          username: user.user_metadata?.username || user.email?.split('@')[0] || '',
          bio: user.user_metadata?.bio || '',
          interests: user.user_metadata?.interests || [],
          followers: [],
          following: []
        };
      } else if (profileResponse.data) {
        profileData = profileResponse.data;
      }
      
      if (profileData) {
        // Definir o perfil e todos os campos relacionados
        setProfile(profileData);
        setBio(profileData?.bio || "");
        setAvatar(profileData?.avatar || "");
        setInterests(toMultiArray(profileData?.interests));
        setName(profileData?.name || "");
        setEmail(profileData?.email || "");
        setUsername(profileData?.username || "");
        
        // Definir seguidores e seguindo usando a tabela user_followers
        let followersList = [];
        let followingList = [];
        
        try {
          // Buscar seguidores (quem segue este usuário)
          const { data: followersData } = await supabase
            .from('user_followers')
            .select('follower_id')
            .eq('user_id', profileData.id);
          
          // Buscar quem este usuário segue
          const { data: followingData } = await supabase
            .from('user_followers')
            .select('user_id')
            .eq('follower_id', profileData.id);
            
          followersList = followersData?.map(f => f.follower_id) || [];
          followingList = followingData?.map(f => f.user_id) || [];
        } catch (followError) {
          console.error('Erro ao buscar seguidores:', followError);
          // Fallback para arrays nos campos do usuário se a tabela user_followers não funcionar
          followersList = toMultiArray(profileData.followers);
          followingList = toMultiArray(profileData.following);
        }
        
        setFollowers(followersList);
        setFollowing(followingList);
        
        // Buscar posts do usuau00e1rio
        try {
          const userPostsData = await getUserPosts(profileData.id);
          setUserPosts(userPostsData);
        } catch (postsError) {
          console.error('Erro ao buscar posts do usuau00e1rio:', postsError);
          setUserPosts([]);
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
    if (user || id) {
      fetchProfile();
      fetchAllUsers();
    }
  }, [user, id]);

  // Função para seguir outro usuário
  const handleFollow = async (targetId) => {
    if (!user || !profile || user.id === targetId) return;
    
    try {
      setLoadingAction(true);
      setError('');
      
      // Criar o registro na tabela user_followers
      const { error: followError } = await supabase
        .from('user_followers')
        .insert({
          user_id: targetId,
          follower_id: user.id,
          created_at: new Date().toISOString()
        });
      
      if (followError) {
        // Se ocorrer erro, verificar se é por política de segurança
        // e tentar atualizar arrays na tabela de usuários
        console.log('Tentando método alternativo de follow:', followError);

        // Buscar ambos os perfis para atualizar campos de arrays
        const [userResp, targetResp] = await Promise.all([
          supabase.from('profiles').select('following').eq('id', user.id).single(),
          supabase.from('profiles').select('followers').eq('id', targetId).single()
        ]);
        
        // Verificar erros e tentar tabela 'users' se necessário
        const [userProfileData, targetProfileData] = await Promise.all([
          userResp.error ? supabase.from('users').select('following').eq('id', user.id).single() : Promise.resolve(userResp),
          targetResp.error ? supabase.from('users').select('followers').eq('id', targetId).single() : Promise.resolve(targetResp)
        ]);

        if (userProfileData.error && targetProfileData.error) {
          throw new Error('Falha ao buscar perfis para atualizar');
        }

        const userFollowing = toMultiArray(userProfileData.data?.following);
        const targetFollowers = toMultiArray(targetProfileData.data?.followers);
        
        // Verificar duplicação
        if (userFollowing.includes(targetId)) {
          throw new Error('Você já segue este usuário');
        }

        // Determinar a tabela a ser usada
        const table = userResp.error ? 'users' : 'profiles';

        // Fazer as atualizações
        await Promise.all([
          supabase
            .from(table)
            .update({ following: [...userFollowing, targetId] })
            .eq('id', user.id),
          supabase
            .from(table)
            .update({ followers: [...targetFollowers, user.id] })
            .eq('id', targetId)
        ]);
      }
      
      setSuccess(`Você agora está seguindo este usuário.`);
      
      // Atualizar perfil e lista de usuários
      await fetchProfile();
      await fetchAllUsers();
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      setError('Não foi possível seguir este usuário. Tente novamente.');
    } finally {
      setLoadingAction(false);
      // Limpar mensagem de sucesso após 3 segundos se houver
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  // Função para deixar de seguir outro usuário
  const handleUnfollow = async (targetId) => {
    if (!user || !profile || user.id === targetId) return;
    
    try {
      setLoadingAction(true);
      setError('');
      
      // Tentar remover da tabela user_followers primeiro (método preferido)
      const { error: unfollowError } = await supabase
        .from('user_followers')
        .delete()
        .match({ user_id: targetId, follower_id: user.id });
      
      if (unfollowError) {
        // Se ocorrer erro, tentar atualizar arrays na tabela de perfis
        console.log('Tentando método alternativo de unfollow:', unfollowError);

        // Buscar ambos os perfis para atualizar campos de arrays
        const [userResp, targetResp] = await Promise.all([
          supabase.from('profiles').select('following').eq('id', user.id).single(),
          supabase.from('profiles').select('followers').eq('id', targetId).single()
        ]);
        
        // Verificar erros e tentar tabela 'users' se necessário
        const [userProfileData, targetProfileData] = await Promise.all([
          userResp.error ? supabase.from('users').select('following').eq('id', user.id).single() : Promise.resolve(userResp),
          targetResp.error ? supabase.from('users').select('followers').eq('id', targetId).single() : Promise.resolve(targetResp)
        ]);

        if (userProfileData.error && targetProfileData.error) {
          throw new Error('Falha ao buscar perfis para atualizar');
        }

        const userFollowing = toMultiArray(userProfileData.data?.following);
        const targetFollowers = toMultiArray(targetProfileData.data?.followers);
        
        // Verificar se é preciso deixar de seguir
        if (!userFollowing.includes(targetId)) {
          throw new Error('Você não segue este usuário');
        }

        // Determinar a tabela a ser usada
        const table = userResp.error ? 'users' : 'profiles';

        // Fazer as atualizações
        await Promise.all([
          supabase
            .from(table)
            .update({ following: userFollowing.filter(id => id !== targetId) })
            .eq('id', user.id),
          supabase
            .from(table)
            .update({ followers: targetFollowers.filter(id => id !== user.id) })
            .eq('id', targetId)
        ]);
      }
      
      setSuccess(`Você deixou de seguir este usuário.`);
      
      // Atualizar perfil e lista de usuários
      await fetchProfile();
      await fetchAllUsers();
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      setError('Não foi possível deixar de seguir este usuário. Tente novamente.');
    } finally {
      setLoadingAction(false);
      // Limpar mensagem de sucesso após 3 segundos se houver
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
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
      if (!name || name.trim() === "") {
        setError("O nome não pode estar vazio.");
        return;
      }
      
      // Preparar dados de perfil atualizados
      const updatedProfile = {
        name: name.trim(),
        bio: bio.trim(),
        interests: interests,
        avatar: avatar,
        username: username.trim(),
        // Não permitimos atualizar o email por aqui por segurança
      };
      
      console.log("Tentando atualizar com:", updatedProfile);
      
      // Tentar atualizar na tabela 'profiles' primeiro
      let updateResponse = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', id || user.id);
      
      // Se ocorrer erro, tentar atualizar na tabela 'users'
      if (updateResponse.error) {
        console.log('Tentando atualizar na tabela users:', updateResponse.error);
        updateResponse = await supabase
          .from('users')
          .update(updatedProfile)
          .eq('id', id || user.id);
      }
      
      // Se ainda houver erro, atualizar diretamente os metadados do auth
      if (updateResponse.error) {
        console.log('Tentando atualizar metadados de auth:', updateResponse.error);
        updateResponse = await supabase.auth.updateUser({
          data: {
            name: name.trim(),
            full_name: name.trim(),
            username: username.trim(),
            bio: bio.trim(),
            interests: interests,
            avatar_url: avatar
          }
        });
      }
      
      if (updateResponse.error) {
        throw updateResponse.error;
      }
      
      console.log("Atualização bem-sucedida");
      
      setSuccess("Perfil atualizado com sucesso!");
      
      // Recarregar dados do perfil
      await fetchProfile();
      setEditing(false);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
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
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validar tipo de arquivo
                          if (!file.type.startsWith('image/')) {
                            setError('Por favor, selecione apenas arquivos de imagem.');
                            setTimeout(() => setError(''), 3000);
                            return;
                          }
                          
                          // Validar tamanho do arquivo (máximo 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setError('A imagem deve ter no máximo 5MB.');
                            setTimeout(() => setError(''), 3000);
                            return;
                          }
                          
                          try {
                            setLoadingAction(true);
                            setError('');
                            
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                            
                            const { data, error } = await supabase.storage
                              .from('avatars') // certifique-se de que esse bucket existe
                              .upload(fileName, file);

                            if (error) {
                              throw error;
                            }
                            
                            const { data: urlData } = supabase.storage
                              .from('avatars')
                              .getPublicUrl(fileName);
                              
                            if (urlData?.publicUrl) {
                              setAvatar(urlData.publicUrl);
                              setSuccess('Imagem de perfil atualizada! Lembre-se de salvar as alterações.');
                              setTimeout(() => setSuccess(''), 5000);
                            }
                          } catch (uploadError) {
                            console.error('Erro ao fazer upload do avatar:', uploadError);
                            setError('Erro ao atualizar imagem de perfil. Tente novamente.');
                            setTimeout(() => setError(''), 3000);
                          } finally {
                            setLoadingAction(false);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className={style.userDetails}>
                <h2 className={style.userName}>{profile.name || "Usuário"}</h2>
                <p className={style.userUsername}>@{profile.username || profile.email.split('@')[0]}</p>

                {editing && (
                  <div className={style.editSection}>
                    <label htmlFor="edit-name" className={style.editLabel}>Nome</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={style.editInput}
                      placeholder="Digite seu nome"
                    />

                    <label htmlFor="edit-username" className={style.editLabel}>Nome de usuário</label>
                    <input
                      id="edit-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={style.editInput}
                      placeholder="Digite seu nome de usuário"
                    />

                    <label htmlFor="edit-bio" className={style.editLabel}>Bio</label>
                    <textarea
                      id="edit-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={style.editTextarea}
                      placeholder="Conte um pouco sobre você"
                      maxLength={500}
                    />

                    <label htmlFor="edit-interests" className={style.editLabel}>
                      Interesses
                      <span className={style.helpText}> (selecione até 5)</span>
                    </label>
                    <div className={style.interestsGrid}>
                      {categoriasPadrao.map((categoria) => (
                        <label key={categoria} className={style.interestCheckbox}>
                          <input
                            type="checkbox"
                            checked={interests.includes(categoria)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (interests.length < 5) {
                                  setInterests([...interests, categoria]);
                                }
                              } else {
                                setInterests(interests.filter(i => i !== categoria));
                              }
                            }}
                            disabled={!interests.includes(categoria) && interests.length >= 5}
                          />
                          <span>{categoria}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
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
                            onClick={() => {
                              setName(profile.name || "");
                              setBio(profile.bio || "");
                              setUsername(profile.username || "");
                              setInterests(toMultiArray(profile.interests));
                              setEditing(true);
                            }}
                          >
                            Editar Perfil
                          </button>
                          <button 
                            className={`${style.actionButton} ${style.logoutButton}`}
                            onClick={async () => {
                              try {
                                const { error } = await logout();
                                if (!error) {
                                  navigate("/login"); // Redireciona para a página de login
                                } else {
                                  console.error("Erro ao sair:", error);
                                  setError("Erro ao sair. Tente novamente.");
                                }
                              } catch (err) {
                                console.error("Erro ao fazer logout:", err);
                                setError("Erro ao sair. Tente novamente.");
                              }
                            }}
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
                Posts ({loading ? '...' : userPosts.length})
              </h3>
              
              {loading ? (
                <div className={style.userPostsGrid}>
                  {/* Exibe skeletons durante o carregamento */}
                  {[1, 2, 3].map(index => (
                    <div key={index} className={style.skeletonCard}>
                      <Skeleton type="card" height="280px" />
                    </div>
                  ))}
                </div>
              ) : userPosts.length > 0 ? (
                <div className={style.userPostsGrid}>
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className={style.postCard}
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <Card
                        TituloCard={post.title}
                        SubTitulo={post.categories?.length > 0 ? post.categories.join(", ") : (post.area ? (Array.isArray(post.area) ? post.area.join(", ") : post.area) : "Geral")}
                        Descricao={post.caption}
                        likes={post.like_count || post.likeCount || 0}
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
                <span className={style.sectionIcon}>👤</span>
                Seguidores ({loading ? '...' : followers.length})
              </h3>
              
              <div className={style.followSection}>
                {loading ? (
                  <div className={style.skeletonFollowers}>
                    {[1, 2, 3].map(index => (
                      <div key={index} className={style.userItemSkeleton}>
                        <Skeleton type="avatar" width="40px" height="40px" />
                        <div className={style.userInfoSkeleton}>
                          <Skeleton type="text" width="120px" height="18px" />
                          <Skeleton type="text" width="80px" height="14px" />
                        </div>
                        <Skeleton type="button" width="100px" height="30px" />
                      </div>
                    ))}
                  </div>
                ) : followers.length > 0 ? (
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
                              className={`${style.followButton} ${following.includes(follower.id) ? style.unfollowButton : style.followButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (following.includes(follower.id)) {
                                  handleUnfollow(follower.id);
                                } else {
                                  handleFollow(follower.id);
                                }
                              }}
                              disabled={loadingAction}
                            >
                              {following.includes(follower.id) ? 'Seguindo' : 'Seguir'}
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
                <span className={style.sectionIcon}>👥</span>
                Seguindo ({loading ? '...' : following.length})
              </h3>
              
              <div className={style.followSection}>
                {loading ? (
                  <div className={style.skeletonFollowers}>
                    {[1, 2, 3].map(index => (
                      <div key={index} className={style.userItemSkeleton}>
                        <Skeleton type="avatar" width="40px" height="40px" />
                        <div className={style.userInfoSkeleton}>
                          <Skeleton type="text" width="120px" height="18px" />
                          <Skeleton type="text" width="80px" height="14px" />
                        </div>
                        <Skeleton type="button" width="100px" height="30px" />
                      </div>
                    ))}
                  </div>
                ) : following.length > 0 ? (
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
                              disabled={loadingAction}
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
