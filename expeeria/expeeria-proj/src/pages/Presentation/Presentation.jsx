import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Presentation.module.css';

// Posts de exemplo diretamente incorporados no componente
const examplePosts = [
  {
    id: 'ex-001',
    title: 'Projeto de Robótica Educacional com Arduino',
    caption: 'Desenvolvemos um projeto de robótica educacional utilizando Arduino para ensinar conceitos de programação e eletrônica.',
    subject: 'Tecnologia',
    author: 'Carlos Mendes',
    likes: 156
  },
  {
    id: 'ex-002',
    title: 'Metodologia Ativa: Aprendizagem Baseada em Projetos',
    caption: 'Compartilhando nossa experiência com a implementação da metodologia de Aprendizagem Baseada em Projetos.',
    subject: 'Pedagogia',
    author: 'Ana Oliveira',
    likes: 89
  },
  {
    id: 'ex-003',
    title: 'Clube de Astronomia: Explorando o Céu Noturno',
    caption: 'Como criamos um clube de astronomia na escola e engajamos os alunos em atividades práticas de observação celeste.',
    subject: 'Ciências',
    author: 'Ricardo Santos',
    likes: 112
  }
];

export function Presentation() {
  const [loading, setLoading] = useState(true);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);
  const observerRef = useRef(null);

  // Carregar posts de exemplo diretamente do array incorporado
  useEffect(() => {
    // Simular um tempo de carregamento para mostrar o loader
    const timer = setTimeout(() => {
      setFeaturedPosts(examplePosts);
      setLoading(false);
      console.log('Posts de exemplo carregados:', examplePosts);
    }, 500);
    
    // Limpar o timer quando o componente for desmontado
    return () => clearTimeout(timer);
  }, []);
  
  // Configurar o observer para as seções
  useEffect(() => {
    // Inicializar o array de refs
    sectionRefs.current = Array(5).fill(null);
    
    // Inicializa o observer para detectar qual seção está visível
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Encontrar o índice da seção atual
          sectionRefs.current.forEach((section, index) => {
            if (section === entry.target) {
              setActiveSection(index);
            }
          });
        }
      });
    }, { threshold: 0.5 });
    
    // Observar cada seção depois que os refs forem configurados
    setTimeout(() => {
      sectionRefs.current.forEach(section => {
        if (section) {
          observerRef.current.observe(section);
        }
      });
    }, 100);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Scroll para a próxima seção
  const scrollToNextSection = () => {
    const nextIndex = Math.min(activeSection + 1, sectionRefs.current.length - 1);
    sectionRefs.current[nextIndex].scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.presentationContainer}>
      {/* Hero Section */}
      <section className={`${styles.section} ${styles.heroSection}`} ref={el => sectionRefs.current[0] = el}>
        <div className={styles.heroContent}>
          <div className={styles.glowCircle}></div>
          <h1 className={styles.heroTitle}>
            <span className={styles.gradientText}>Expeeria</span>
            <span className={styles.subtitle}>Compartilhe experiências, inspire pessoas</span>
          </h1>
          <p className={styles.heroParagraph}>
            Descubra, compartilhe e participe de uma comunidade vibrante focada em experiências educacionais, projetos inovadores e conhecimento colaborativo.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/signup" className={`${styles.ctaButton} ${styles.primaryButton}`}>
              Criar conta gratuitamente
            </Link>
            <Link to="/login" className={`${styles.ctaButton} ${styles.secondaryButton}`}>
              Entrar
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.imageContainer}>
            <div className={styles.mainImage}><img src="https://s1.static.brasilescola.uol.com.br/be/conteudo/images/para-conseguir-um-bom-rendimento-nos-estudos-sao-necessarios-foco-concentracao-organizacao-5bf68360e4b3c.jpg" alt="Pessoa estudando" /></div>
            <div className={styles.floatingCard} style={{top: '20%', right: '-10%'}}>
              <div className={styles.cardIcon}>🚀</div>
              <div className={styles.cardText}>Projetos Inovadores</div>
            </div>
            <div className={styles.floatingCard} style={{bottom: '15%', left: '-5%'}}>
              <div className={styles.cardIcon}>💡</div>
              <div className={styles.cardText}>Ideias Criativas</div>
            </div>
          </div>
        </div>
        <button className={styles.scrollDownButton} onClick={scrollToNextSection}>
          <span>Descubra mais</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5"></path>
            <path d="M7 6l5 5 5-5"></path>
          </svg>
        </button>
      </section>

      {/* Features Section */}
      <section className={`${styles.section} ${styles.featuresSection}`} ref={el => sectionRefs.current[1] = el}>
        <h2 className={styles.sectionTitle}>Por que escolher a <span className={styles.gradientText}>Expeeria</span>?</h2>
        <div className={styles.featuresContainer}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🧠</div>
            <h3>Aprendizado Colaborativo</h3>
            <p>Conecte-se com outros estudantes e educadores, participando de discussões enriquecedoras e projetos coletivos.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3>Projetos Práticos</h3>
            <p>Aplique o conhecimento teórico em projetos reais, desenvolvendo habilidades técnicas e criativas.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌟</div>
            <h3>Feedback Construtivo</h3>
            <p>Receba comentários valiosos sobre seus trabalhos e evolua continuamente com as sugestões da comunidade.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>Conteúdos Personalizados</h3>
            <p>Encontre materiais relevantes para seus interesses e objetivos educacionais através de recomendações inteligentes.</p>
          </div>
        </div>
        <button className={styles.scrollDownButton} onClick={scrollToNextSection}>
          <span>Continue explorando</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5"></path>
          </svg>
        </button>
      </section>

      {/* Popular Content Section */}
      <section className={`${styles.section} ${styles.contentSection}`} ref={el => sectionRefs.current[2] = el}>
        <h2 className={styles.sectionTitle}>Conteúdos <span className={styles.gradientText}>Populares</span></h2>
        {loading ? (
          <div className={styles.loadingContainer}>Carregando conteúdos...</div>
        ) : (
          <div className={styles.contentCards}>
            {featuredPosts.length > 0 ? (
              featuredPosts.map((post) => (
                <div key={post.id} className={styles.contentCard}>
                  <div 
                    className={styles.contentImage} 
                    style={{
                      backgroundColor: '#3498db'
                    }}
                  ></div>
                  <div className={styles.contentCategory}>
                    {post.subject}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.caption}...</p>
                  <div className={styles.contentMeta}>
                    <span>Por {post.author}</span>
                    <span>{post.likes} curtidas</span>
                  </div>
                  <Link to='/explore' className={styles.contentLink}>Ler mais</Link>
                </div>
              ))
            ) : (
              <div className={styles.contentCard}>
                <h3>Nenhum post encontrado</h3>
                <p>Não foi possível carregar os posts de exemplo.</p>
              </div>
            )}
          </div>
        )}
        <button className={styles.scrollDownButton} onClick={scrollToNextSection}>
          <span>Ver mais</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5"></path>
          </svg>
        </button>
      </section>

      {/* How It Works */}
      <section className={`${styles.section} ${styles.howSection}`} ref={el => sectionRefs.current[3] = el}>
        <h2 className={styles.sectionTitle}>Como funciona a <span className={styles.gradientText}>Expeeria</span></h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Crie sua conta</h3>
              <p>Registre-se gratuitamente e personalize seu perfil com seus interesses e áreas de conhecimento.</p>
            </div>
          </div>
          <div className={styles.stepArrow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Explore conteúdos</h3>
              <p>Descubra projetos, experiências e ideias compartilhadas por outros membros da comunidade.</p>
            </div>
          </div>
          <div className={styles.stepArrow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Compartilhe experiências</h3>
              <p>Publique seus próprios projetos, histórias e experiências educacionais para inspirar outros usuários.</p>
            </div>
          </div>
          <div className={styles.stepArrow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Conecte-se</h3>
              <p>Interaja com outros membros, troque experiências e construa sua rede de conhecimento colaborativo.</p>
            </div>
          </div>
        </div>
        <button className={styles.scrollDownButton} onClick={scrollToNextSection}>
          <span>Ver mais</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5"></path>
          </svg>
        </button>
      </section>

      {/* Testimonials */}
      <section className={`${styles.section} ${styles.testimonialsSection}`} ref={el => sectionRefs.current[3] = el}>
        <h2 className={styles.sectionTitle}>O que dizem sobre a <span className={styles.gradientText}>Expeeria</span></h2>
        <div className={styles.testimonials}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>"A Expeeria revolucionou a forma como compartilho meus projetos educacionais. A comunidade é extremamente acolhedora e os feedbacks têm sido fundamentais para o desenvolvimento do meu trabalho."</p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}></div>
              <div className={styles.authorInfo}>
                <h4>Maria Silva</h4>
                <p>Professora de Ciências</p>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>"Como estudante, encontrei na Expeeria um espaço onde posso aprender com as experiências de outros e também compartilhar minhas descobertas. É uma plataforma que realmente valoriza o conhecimento colaborativo."</p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}></div>
              <div className={styles.authorInfo}>
                <h4>Pedro Santos</h4>
                <p>Estudante de Engenharia</p>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>"A diversidade de conteúdos e a facilidade de navegação fazem da Expeeria uma ferramenta indispensável para quem busca inovação educacional. Recomendo a todos os educadores!"</p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}></div>
              <div className={styles.authorInfo}>
                <h4>Ana Oliveira</h4>
                <p>Coordenadora Pedagógica</p>
              </div>
            </div>
          </div>
        </div>
        <button className={styles.scrollDownButton} onClick={scrollToNextSection}>
          <span>Quase lá</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5"></path>
          </svg>
        </button>
      </section>

      {/* CTA Section */}
      <section className={`${styles.section} ${styles.ctaSection}`} ref={el => sectionRefs.current[4] = el}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Pronto para começar sua jornada na <span className={styles.gradientText}>Expeeria</span>?</h2>
          <p className={styles.ctaParagraph}>Junte-se à nossa comunidade de inovadores, educadores e entusiastas. Compartilhe suas experiências e descubra um mundo de possibilidades educacionais.</p>
          <div className={styles.ctaButtonsLarge}>
            <Link to="/signup" className={`${styles.ctaButton} ${styles.primaryButtonLarge}`}>
              Criar minha conta
            </Link>
            <Link to="/login" className={`${styles.ctaButton} ${styles.secondaryButtonLarge}`}>
              Já tenho uma conta
            </Link>
          </div>
          <div className={styles.ctaFeatures}>
            <div className={styles.ctaFeature}>
              <div className={styles.ctaFeatureIcon}>✓</div>
              <p>100% Gratuito</p>
            </div>
            <div className={styles.ctaFeature}>
              <div className={styles.ctaFeatureIcon}>✓</div>
              <p>Comunidade Ativa</p>
            </div>
            <div className={styles.ctaFeature}>
              <div className={styles.ctaFeatureIcon}>✓</div>
              <p>Conteúdo Exclusivo</p>
            </div>
          </div>
        </div>
        <div className={styles.ctaBackground}></div>
      </section>
    </div>
  );
}
