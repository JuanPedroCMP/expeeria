-- Script para carregar dados de exemplo no banco de dados Supabase Expeeria

-- Inserir usuários de exemplo
INSERT INTO users (id, email, password, name, username, bio, avatar, role, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@expeeria.com', 'senha_hash_ficticia', 'Administrador', 'admin', 'Administrador do Expeeria', 'https://i.pravatar.cc/150?img=1', 'admin', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'maria@expeeria.com', 'senha_hash_ficticia', 'Maria Silva', 'mariasilva', 'Professora de História e entusiasta de tecnologia educacional', 'https://i.pravatar.cc/150?img=5', 'user', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'joao@expeeria.com', 'senha_hash_ficticia', 'João Santos', 'joaosantos', 'Desenvolvedor web e apaixonado por compartilhar conhecimento', 'https://i.pravatar.cc/150?img=8', 'user', 'active'),
  ('44444444-4444-4444-4444-444444444444', 'ana@expeeria.com', 'senha_hash_ficticia', 'Ana Oliveira', 'anaoliveira', 'Estudante de Ciência da Computação e artista digital', 'https://i.pravatar.cc/150?img=9', 'user', 'active'),
  ('55555555-5555-5555-5555-555555555555', 'pedro@expeeria.com', 'senha_hash_ficticia', 'Pedro Costa', 'pedrocosta', 'Engenheiro de Software e entusiasta de IA', 'https://i.pravatar.cc/150?img=3', 'user', 'active');

-- Inserir interesses dos usuários
INSERT INTO user_interests (user_id, interest)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Educação'),
  ('22222222-2222-2222-2222-222222222222', 'História'),
  ('22222222-2222-2222-2222-222222222222', 'Tecnologia'),
  ('33333333-3333-3333-3333-333333333333', 'Programação'),
  ('33333333-3333-3333-3333-333333333333', 'Web Development'),
  ('33333333-3333-3333-3333-333333333333', 'JavaScript'),
  ('44444444-4444-4444-4444-444444444444', 'Arte Digital'),
  ('44444444-4444-4444-4444-444444444444', 'Computação'),
  ('44444444-4444-4444-4444-444444444444', 'Design'),
  ('55555555-5555-5555-5555-555555555555', 'Inteligência Artificial'),
  ('55555555-5555-5555-5555-555555555555', 'Engenharia de Software');

-- Inserir relações de seguidores
INSERT INTO user_followers (user_id, follower_id)
VALUES
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333');

-- Inserir posts de exemplo
INSERT INTO posts (id, title, caption, content, image_url, author_id, status, published_at, metadata)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
   'Introdução ao React: Primeiros passos', 
   'Um guia completo para quem está começando com React', 
   'Conteúdo de introdução ao React com exemplos de código e explicações',
   'https://example.com/images/react-intro.jpg',
   '33333333-3333-3333-3333-333333333333',
   'published',
   CURRENT_TIMESTAMP - INTERVAL '7 days',
   '{"readTime": 5}'),
  
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'A história da computação moderna',
   'Uma jornada pelas principais inovações que moldaram a era digital',
   'Conteúdo sobre a história da computação desde os primórdios até a era atual',
   'https://example.com/images/computer-history.jpg',
   '22222222-2222-2222-2222-222222222222',
   'published',
   CURRENT_TIMESTAMP - INTERVAL '14 days',
   '{"readTime": 8}'),

  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Arte Digital: Quebrando Barreiras Criativas',
   'Como a tecnologia está transformando a expressão artística no século XXI',
   'Conteúdo sobre arte digital, diferentes formas de expressão e ferramentas',
   'https://example.com/images/digital-art.jpg',
   '44444444-4444-4444-4444-444444444444',
   'published',
   CURRENT_TIMESTAMP - INTERVAL '5 days',
   '{"readTime": 6}'),

  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
   'Inteligência Artificial: Presente e Futuro',
   'Uma análise das tecnologias de IA que estão transformando nossa sociedade',
   'Conteúdo sobre o estado atual da IA, aplicações e desafios éticos',
   'https://example.com/images/ai-future.jpg',
   '55555555-5555-5555-5555-555555555555',
   'published',
   CURRENT_TIMESTAMP - INTERVAL '2 days',
   '{"readTime": 7}'),

  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   'Metodologias Ágeis: Além do Scrum',
   'Explorando diferentes abordagens ágeis para desenvolvimento de software',
   'Conteúdo sobre Kanban, XP, Lean Software Development e outras metodologias ágeis',
   'https://example.com/images/agile-methods.jpg',
   '33333333-3333-3333-3333-333333333333',
   'published',
   CURRENT_TIMESTAMP - INTERVAL '10 days',
   '{"readTime": 6}');

-- Inserir categorias dos posts
INSERT INTO post_categories (post_id, category)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Programação'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Web Development'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'JavaScript'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'História'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tecnologia'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Arte Digital'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Design'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Inteligência Artificial'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tecnologia'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Desenvolvimento'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Metodologias');

-- Inserir tags dos posts
INSERT INTO post_tags (post_id, tag)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'react'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frontend'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'javascript'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'história'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'computação'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tecnologia'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'arte'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'digital'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'criatividade'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ia'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'machine-learning'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'futuro'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'agile'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'kanban'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'desenvolvimento');

-- Inserir likes nos posts
INSERT INTO post_likes (post_id, user_id)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555');

-- Inserir comentários em posts
INSERT INTO comments (id, post_id, user_id, content, created_at)
VALUES
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Excelente artigo! Aprendi muito sobre React.', CURRENT_TIMESTAMP - INTERVAL '6 days'),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Poderia falar mais sobre hooks em um próximo post?', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('33333333-aaaa-aaaa-aaaa-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Fascinante como a computação evoluiu tão rapidamente!', CURRENT_TIMESTAMP - INTERVAL '13 days'),
  ('44444444-aaaa-aaaa-aaaa-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'A arte digital realmente quebrou muitas barreiras tradicionais.', CURRENT_TIMESTAMP - INTERVAL '4 days'),
  ('55555555-aaaa-aaaa-aaaa-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Interessante perspectiva sobre os desafios éticos da IA!', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('66666666-aaaa-aaaa-aaaa-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'Tenho usado Kanban com muito sucesso em projetos menores.', CURRENT_TIMESTAMP - INTERVAL '9 days');

-- Inserir notificações
INSERT INTO notifications (id, user_id, type, content, reference_id, sender_id, read)
VALUES
  ('aaaaaaaa-notification-1111-1111-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'like', 'Maria Silva curtiu seu post', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', false),
  ('bbbbbbbb-notification-2222-2222-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'comment', 'Ana Oliveira comentou em seu post', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', true),
  ('cccccccc-notification-3333-3333-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'follow', 'João Santos começou a seguir você', null, '33333333-3333-3333-3333-333333333333', false),
  ('dddddddd-notification-4444-4444-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'like', 'Maria Silva curtiu seu post', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', true);
