// Posts de exemplo para exibiu00e7u00e3o na aplicau00e7u00e3o
// Estes su00e3o dados tempu00f3rarios que nu00e3o dependem do banco de dados

export const examplePosts = [
  {
    id: 'ex-001',
    title: 'Projeto de Robótica Educacional com Arduino',
    caption: 'Desenvolvemos um projeto de robótica educacional utilizando Arduino para ensinar conceitos de programação e eletrônica para alunos do ensino médio.',
    subject: 'Tecnologia',
    author: 'Carlos Mendes',
    content: `# Projeto de Robótica Educacional com Arduino

Nosso grupo desenvolveu uma metodologia para ensinar conceitos de programação e eletrônica através da robótica educacional utilizando a plataforma Arduino.

## Objetivos do Projeto

- Despertar o interesse dos alunos por tecnologia e programação
- Ensinar conceitos básicos de eletrônica de forma prática
- Desenvolver o pensamento lógico e a capacidade de resolução de problemas
- Criar um ambiente colaborativo de aprendizagem

## Materiais Utilizados

- Kits Arduino Uno
- Sensores diversos (ultrassônico, temperatura, movimento)
- LEDs, motores e componentes eletrônicos
- Material didático desenvolvido especificamente para o projeto

## Resultados

Os alunos conseguiram desenvolver projetos incríveis como:

1. Robôs seguidores de linha
2. Sistemas automatizados de monitoramento ambiental
3. Braços robóticos controlados por sensores

A experiência mostrou que o aprendizado baseado em projetos práticos aumenta significativamente o engajamento dos estudantes e melhora a compreensão de conceitos complexos de física, matemática e programação.`,
    area: ['Tecnologia', 'Educação', 'Robótica'],
    author_id: 'prof_carlos',
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'],
    like_count: 7,
    comment_count: 4,
    comments: [
      { id: 'c1', user: 'Maria Silva', content: 'Fantástico projeto! Como posso implementar algo similar na minha escola?' },
      { id: 'c2', user: 'João Ferreira', content: 'Quais foram os maiores desafios na implementação deste projeto com os alunos?' }
    ],
    created_at: '2025-03-15T14:23:00Z'
  },
  {
    id: 'ex-002',
    title: 'Metodologia Ativa: Aprendizagem Baseada em Projetos',
    caption: 'Compartilhando nossa experiência com a implementação da metodologia de Aprendizagem Baseada em Projetos nas aulas de ciências.',
    subject: 'Pedagogia',
    author: 'Ana Oliveira',
    content: `# Metodologia Ativa: Aprendizagem Baseada em Projetos

Ao longo do último semestre, implementamos a metodologia de Aprendizagem Baseada em Projetos (ABP) com turmas do 9º ano nas aulas de ciências. Os resultados foram surpreendentes!

## O que é Aprendizagem Baseada em Projetos?

A ABP é uma metodologia ativa que coloca o aluno como protagonista do seu aprendizado, desenvolvendo projetos para resolver problemas reais ou simulados. Os estudantes trabalham em equipes, tomam decisões e desenvolvem habilidades como:

- Trabalho em equipe
- Comunicação
- Pensamento crítico
- Criatividade
- Resolução de problemas

## Como Implementamos

1. **Definição do problema:** Cada grupo recebeu um desafio ambiental local para resolver
2. **Pesquisa e planejamento:** Os alunos pesquisaram soluções e criaram um plano de ação
3. **Execução do projeto:** Desenvolvimento de protótipos e testes de solução
4. **Avaliação e apresentação:** Análise dos resultados e apresentação para a comunidade escolar

## Resultados Observados

- **Engajamento:** Aumento de 67% na participação ativa dos alunos
- **Aprendizado:** Melhora de notas em 78% dos estudantes
- **Desenvolvimento socioemocional:** Maior capacidade de trabalho em equipe e resolução de conflitos

A experiência demonstrou que, quando os alunos são colocados como protagonistas de seu aprendizado, os resultados vão muito além do conteúdo curricular, preparando-os verdadeiramente para os desafios do século XXI.`,
    area: ['Educação', 'Metodologias Ativas', 'Ciências'],
    author_id: 'prof_ana',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9'],
    like_count: 9,
    comment_count: 5,
    comments: [
      { id: 'c3', user: 'Pedro Costa', content: 'Implementamos algo similar em nossa escola e os resultados foram excelentes!' },
      { id: 'c4', user: 'Letícia Santos', content: 'Como vocês avaliaram os projetos? Utilizaram rubricas específicas?' }
    ],
    created_at: '2025-04-02T09:15:00Z'
  },
  {
    id: 'ex-003',
    title: 'Aplicativo de Acessibilidade Desenvolvido por Alunos',
    caption: 'Alunos do ensino técnico desenvolveram um aplicativo que auxilia pessoas com deficiência visual a navegar em ambientes urbanos.',
    subject: 'Tecnologia',
    author: 'Equipe TechInclusive',
    content: `# Aplicativo de Acessibilidade Desenvolvido por Alunos

Nosso grupo de alunos do curso técnico de desenvolvimento de sistemas criou um aplicativo inovador que auxilia pessoas com deficiência visual a navegar em ambientes urbanos.

## O Problema Identificado

Após pesquisas e entrevistas com pessoas com deficiência visual, identificamos diversos desafios enfrentados na mobilidade urbana:

- Dificuldade em identificar obstáculos temporários como obras
- Problemas para encontrar entradas acessíveis em estabelecimentos
- Ausência de informação sobre a qualidade das calçadas

## A Solução Desenvolvida

O aplicativo **Urban Guide** utiliza:

- Mapeamento colaborativo de rotas acessíveis
- Integração com APIs de mapas
- Sistema de alerta por áudio
- Comunidade que atualiza informações em tempo real

## Tecnologias Utilizadas

- React Native para desenvolvimento multiplataforma
- Firebase para backend e autenticação
- APIs de geolocalização e mapas
- Tecnologia text-to-speech para feedback por áudio

## Impacto Social

O aplicativo já está sendo testado por 50 usuários na cidade e recebeu feedback extremamente positivo. O projeto foi apresentado em uma feira de tecnologia e ganhou o prêmio de melhor iniciativa de impacto social.

Esta experiência demonstrou o potencial transformador da educação tecnológica quando aplicada a problemas reais da sociedade, permitindo que os alunos não apenas aprendam habilidades técnicas, mas desenvolvam empatia e compreensão das necessidades de diferentes grupos sociais.`,
    area: ['Tecnologia', 'Acessibilidade', 'Desenvolvimento Mobile'],
    author_id: 'tech_inclusive',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11'],
    like_count: 11,
    comment_count: 6,
    comments: [
      { id: 'c5', user: 'Roberto Almeida', content: 'Projeto incrível! O aplicativo já está disponível para download?' },
      { id: 'c6', user: 'Fernanda Lima', content: 'Como foi o processo de teste com os usuários reais? Quais foram os principais feedbacks?' }
    ],
    created_at: '2025-04-12T16:45:00Z'
  },
  {
    id: 'ex-004',
    title: 'Festival de Astronomia na Escola: Conectando Ciência e Educação',
    caption: 'Organizamos um festival de astronomia que transformou nossa escola em um observatório a céu aberto, envolvendo toda a comunidade escolar.',
    subject: 'Astronomia',
    author: 'Prof. Marcos Oliveira',
    content: `# Festival de Astronomia na Escola

Durante três noites, transformamos o pátio da nossa escola em um verdadeiro observatório astronômico, aproximando alunos, familiares e comunidade do fascinante mundo da astronomia.

## Preparação e Organização

O festival foi resultado de um projeto interdisciplinar envolvendo as disciplinas de:

- Física (conceitos de astronomia e óptica)
- Geografia (sistema solar, movimentos da Terra)
- História (evolução do conhecimento astronômico)
- Artes (representações do cosmos)
- Matemática (cálculos de distâncias astronômicas)

Os alunos foram divididos em equipes temáticas, cada uma responsável por um aspecto diferente do evento.

## Atividades Realizadas

### Observação Celeste
- Montagem de 5 telescópios para observação da Lua, planetas e constelações
- Mapeamento do céu com aplicativos específicos
- Sessões guiadas por professores e alunos previamente treinados

### Exposições Interativas
- Maquetes do sistema solar em escala
- Exposição de astrofotografia
- Relógios solares construídos pelos alunos

### Palestras e Oficinas
- Palestra com astrônomo convidado
- Oficina de construção de foguetes de garrafa PET
- Sessões no planetário inflável emprestado pela universidade local

## Impacto Educacional

O festival alcançou resultados expressivos:

- Participação de mais de 800 pessoas da comunidade
- Aumento significativo no interesse dos alunos por carreiras científicas
- Desenvolvimento de habilidades organizacionais e de comunicação nos estudantes
- Fortalecimento da relação escola-comunidade

Esta experiência mostrou como eventos imersivos podem despertar a curiosidade científica e criar memórias afetivas relacionadas ao conhecimento, muito mais eficazes que aulas tradicionais expositivas.`,
    area: ['Astronomia', 'Ciências', 'Eventos Educacionais'],
    author_id: 'prof_marcos',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'],
    like_count: 8,
    comment_count: 3,
    comments: [
      { id: 'c7', user: 'Carla Mendonça', content: 'Que iniciativa incrível! Como vocês conseguiram os telescópios?' },
      { id: 'c8', user: 'Paulo Andrade', content: 'Adoraria implementar algo assim na minha escola. Quanto tempo levou o planejamento do evento?' }
    ],
    created_at: '2025-03-28T20:10:00Z'
  },
  {
    id: 'ex-005',
    title: 'Laboratório Maker: Transformando a Biblioteca Escolar',
    caption: 'Como transformamos a antiga biblioteca em um espaço maker colaborativo que estimula a criatividade e o aprendizado prático.',
    subject: 'Educação Maker',
    author: 'Equipe Biblioteca Futuro',
    content: `# Laboratório Maker: Transformando a Biblioteca Escolar

Nosso projeto envolveu a transformação da biblioteca tradicional em um moderno espaço maker, combinando literatura e tecnologia para estimular a criatividade e o aprendizado mão na massa.

## Da Biblioteca Tradicional ao Espaço Maker

A biblioteca estava com frequência reduzida e precisava ser reinventada. Ao invés de substituir, decidimos ampliar seu papel, criando um espaço híbrido que:

- Mantém o acervo de livros em áreas repensadas
- Integra tecnologia e ferramentas de criação
- Estimula projetos colaborativos
- Serve como hub de inovação na escola

## O Processo de Transformação

### Fase 1: Planejamento Participativo
- Consulta à comunidade escolar
- Visitas a outros espaços makers
- Definição coletiva do layout e equipamentos

### Fase 2: Captação de Recursos
- Parceria com empresas de tecnologia locais
- Campanha de financiamento coletivo
- Reaproveitamento de materiais e mobiliário

### Fase 3: Implementação
- Reforma do espaço com ajuda de pais e alunos
- Capacitação da equipe da biblioteca
- Aquisição e instalação de equipamentos

## Equipamentos e Recursos

- Impressoras 3D e scanner 3D
- Kits de robótica e eletrônica
- Ferramentas de marcenaria básica
- Máquina de corte a laser (doada por empresa parceira)
- Computadores com software de design e programação
- Área de costura e trabalhos manuais

## Resultados e Impacto

Após seis meses de funcionamento, observamos:

- Aumento de 320% na frequência do espaço
- Desenvolvimento de mais de 40 projetos estudantis
- Uso interdisciplinar por 15 professores de diferentes áreas
- Melhora significativa em habilidades como resolução de problemas e trabalho em equipe

O espaço maker se tornou o coração da escola, provando que bibliotecas podem evoluir sem perder sua essência de centros de conhecimento, apenas expandindo as formas como o conhecimento é construído e compartilhado.`,
    area: ['Educação Maker', 'Biblioteca', 'Inovação Educacional'],
    author_id: 'biblioteca_futuro',
    imageUrl: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12', 'user13', 'user14'],
    like_count: 14,
    comment_count: 7,
    comments: [
      { id: 'c9', user: 'Eduarda Martins', content: 'Este projeto é revolucionário! Como foi a reação dos bibliotecários tradicionais?' },
      { id: 'c10', user: 'Renato Peixoto', content: 'Quais foram os custos aproximados para essa transformação?' }
    ],
    created_at: '2025-04-18T11:30:00Z'
  },
  {
    id: 'ex-006',
    title: 'Gamificação no Ensino de História: Viagem Virtual ao Brasil Imperial',
    caption: 'Desenvolvemos um jogo de realidade aumentada que permite aos alunos explorar o Brasil do século XIX de forma imersiva e interativa.',
    subject: 'História',
    author: 'Prof. Ricardo Almeida',
    content: `# Gamificação no Ensino de História: Viagem Virtual ao Brasil Imperial

Nossa equipe de professores de História, em colaboração com o departamento de Tecnologia, desenvolveu um jogo de realidade aumentada que transporta os alunos para o Brasil Imperial do século XIX.

## O Desafio do Ensino de História

Percebemos que muitos alunos tinham dificuldade em conectar-se emocionalmente com os conteúdos de História do Brasil, vendo-os como distantes de sua realidade. Nosso objetivo era:

- Tornar o período histórico tangível e visualmente acessível
- Criar conexões emocionais com personagens e situações históricas
- Estimular a análise crítica de diferentes perspectivas históricas
- Avaliar conhecimentos de forma dinâmica e significativa

## A Solução Gamificada

### Tecnologia Utilizada
- Aplicativo de realidade aumentada desenvolvido na plataforma Unity
- Marcadores impressos que ativam os cenários virtuais
- Sistema de QR codes espalhados pela escola que desbloqueiam missões
- Dashboard do professor para acompanhamento do progresso

### Mecânicas do Jogo
- Os alunos assumem papéis de diferentes personagens da sociedade imperial
- Cada personagem vivencia os eventos históricos de perspectivas distintas
- Missões envolvem solução de problemas baseados em dilemas históricos reais
- Sistema de pontuação e recompensas vinculado ao conteúdo curricular

### Conteúdos Abordados
- Estrutura social e econômica do Império
- Escravidão e movimentos abolicionistas
- Vida cotidiana nas cidades e fazendas
- Grandes eventos políticos do período

## Resultados Pedagógicos

A implementação do projeto trouxe resultados significativos:

- Aumento de 87% no engajamento dos alunos nas aulas de História
- Melhora de 43% nas avaliações sobre o período histórico
- Desenvolvimento de empatia histórica e pensamento crítico
- Criação de projetos complementares por iniciativa dos próprios alunos

Esta experiência demonstrou o potencial transformador da gamificação e das tecnologias imersivas no ensino de História, especialmente quando combinam rigor histórico com experiências interativas significativas.`,
    area: ['História', 'Gamificação', 'Realidade Aumentada'],
    author_id: 'prof_ricardo',
    imageUrl: 'https://images.unsplash.com/photo-1569360556894-bad778645c99',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
    like_count: 10,
    comment_count: 5,
    comments: [
      { id: 'c11', user: 'Amanda Ribeiro', content: 'Que projeto fascinante! O aplicativo está disponível para outras escolas utilizarem?' },
      { id: 'c12', user: 'Bruno Gomes', content: 'Como vocês avaliaram a aprendizagem dos alunos dentro do próprio jogo?' }
    ],
    created_at: '2025-04-05T14:50:00Z'
  },
  {
    id: 'ex-007',
    title: 'Horta Vertical Inteligente: Ciência e Sustentabilidade na Prática',
    caption: 'Projeto interdisciplinar de horta vertical automatizada que integra biologia, química, física, matemática e programação em um sistema sustentável.',
    subject: 'Ciências',
    author: 'Equipe Eco-Tech Escola',
    content: `# Horta Vertical Inteligente: Ciência e Sustentabilidade na Prática

Implementamos uma horta vertical automatizada com sistema de irrigação inteligente, monitoramento de dados e energia solar, envolvendo diversas disciplinas em um projeto prático de sustentabilidade.

## Objetivos Pedagógicos

O projeto foi concebido para integrar conhecimentos de múltiplas áreas:

- **Biologia:** Estudo de plantas, nutrição vegetal e ecossistemas
- **Química:** Análise de solo, pH e nutrientes
- **Física:** Sistemas de irrigação, energia solar e sensores
- **Matemática:** Cálculos de área, volume e análise de dados
- **Programação:** Automação e coleta de dados

## Implementação do Projeto

### Fase 1: Planejamento e Design
- Estudo do espaço disponível e condições ambientais
- Design da estrutura com material reciclado
- Seleção das espécies vegetais adequadas

### Fase 2: Construção da Estrutura
- Montagem das estruturas de suporte com paletes reutilizados
- Instalação do sistema de irrigação por gotejamento
- Montagem dos painéis solares para alimentação dos sensores

### Fase 3: Sistema de Automação
- Programação com Arduino para controle da irrigação
- Instalação de sensores de umidade, temperatura e luminosidade
- Desenvolvimento de dashboard para visualização de dados

## Componentes do Sistema

### Hardware
- Arduino Mega como controlador central
- Sensores de umidade do solo, temperatura e luminosidade
- Válvulas solenoides para controle da irrigação
- Mini painel solar e sistema de bateria
- Bomba d'água de baixo consumo

### Software
- Sistema de monitoramento em tempo real
- Algoritmo de decisão para irrigação automática
- Banco de dados para histórico de crescimento e condições
- Interface web para acompanhamento remoto

## Resultados Educacionais

- **Aprendizado Experiencial:** Aplicação prática de conceitos teóricos
- **Consciência Ambiental:** Desenvolvimento de práticas sustentáveis
- **Trabalho Colaborativo:** Integração entre turmas e disciplinas
- **Alfabetização Científica:** Coleta, análise e interpretação de dados reais

Além dos objetivos pedagógicos, o projeto resultou em uma produção de hortaliças que são utilizadas na merenda escolar, fechando um ciclo de sustentabilidade e proporcionando discussões sobre segurança alimentar e agricultura urbana.`,
    area: ['Ciências', 'Sustentabilidade', 'Tecnologia'],
    author: 'Equipe Eco-Tech Escola',
    author_id: 'eco_tech',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
    like_count: 12,
    comment_count: 6,
    comments: [
      { id: 'c13', user: 'Marcelo Santos', content: 'Projeto incrível! Vocês têm planos de compartilhar o código e esquema de montagem?' },
      { id: 'c14', user: 'Juliana Costa', content: 'Qual foi o custo aproximado de implementação? Estamos pensando em fazer algo similar.' }
    ],
    created_at: '2025-03-20T10:15:00Z'
  }
];

// Funções auxiliares para manipulação dos posts de exemplo
export const getExamplePostById = (id) => {
  return examplePosts.find(post => post.id === id);
};

export const getAllExamplePosts = () => {
  return examplePosts;
};

export const getFilteredExamplePosts = (filters) => {
  let filtered = [...examplePosts];
  
  // Implementação básica de filtros
  if (filters) {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) || 
        post.caption.toLowerCase().includes(searchLower) || 
        post.content.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.areas && filters.areas.length > 0) {
      filtered = filtered.filter(post => {
        return post.area.some(area => filters.areas.includes(area));
      });
    }
    
    if (filters.author) {
      const authorLower = filters.author.toLowerCase();
      filtered = filtered.filter(post => 
        post.author.toLowerCase().includes(authorLower)
      );
    }
  }
  
  return filtered;
};
