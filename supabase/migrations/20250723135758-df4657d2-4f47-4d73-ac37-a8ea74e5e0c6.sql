-- Add more diverse debate topics to the topics table
INSERT INTO public.topics (title, description, category, difficulty) VALUES
-- Education Topics
('Should standardized testing be abolished?', 'Examine the effectiveness and fairness of standardized educational assessments', 'education', 'beginner'),
('Is homeschooling better than traditional schooling?', 'Compare educational outcomes and social development in different learning environments', 'education', 'intermediate'),
('Should students be required to learn coding?', 'Debate the necessity of programming skills in modern education', 'education', 'beginner'),

-- Technology Topics  
('Should we regulate artificial intelligence development?', 'Discuss government oversight and safety measures for AI advancement', 'technology', 'advanced'),
('Is privacy dead in the digital age?', 'Examine personal data protection and surveillance in modern society', 'technology', 'intermediate'),
('Should children have access to smartphones?', 'Debate the impact of mobile technology on child development', 'technology', 'beginner'),
('Is automation killing jobs or creating opportunities?', 'Analyze the economic impact of technological automation', 'technology', 'intermediate'),

-- Society Topics
('Should the death penalty be abolished worldwide?', 'Examine capital punishment from moral, legal, and practical perspectives', 'society', 'advanced'),
('Is social media making us more lonely?', 'Analyze the psychological impact of digital communication platforms', 'society', 'beginner'),
('Should we have universal basic income?', 'Debate unconditional financial support systems for all citizens', 'society', 'intermediate'),
('Is cancel culture beneficial or harmful?', 'Examine accountability versus freedom of expression in modern society', 'society', 'intermediate'),

-- Environment Topics
('Should we ban single-use plastics globally?', 'Debate environmental protection versus economic and practical considerations', 'environment', 'beginner'),
('Is nuclear energy the solution to climate change?', 'Examine nuclear power as a clean energy alternative', 'environment', 'intermediate'),
('Should meat consumption be restricted to save the planet?', 'Debate dietary choices and their environmental impact', 'environment', 'intermediate'),

-- Politics Topics
('Should the voting age be lowered to 16?', 'Examine political participation and representation of young people', 'politics', 'beginner'),
('Is democracy the best form of government?', 'Compare democratic systems with alternative governance models', 'politics', 'advanced'),
('Should political campaigns have spending limits?', 'Debate money in politics and electoral fairness', 'politics', 'intermediate'),

-- Economics Topics
('Should there be a maximum wage limit?', 'Examine income inequality and wealth distribution policies', 'economics', 'intermediate'),
('Is capitalism the best economic system?', 'Compare capitalist and alternative economic models', 'economics', 'advanced'),
('Should we tax robots to fund human welfare?', 'Debate automation taxation and social support systems', 'economics', 'intermediate'),

-- Science Topics
('Should we pursue immortality through technology?', 'Examine life extension and its societal implications', 'science', 'advanced'),
('Is animal testing necessary for medical research?', 'Debate ethics versus scientific advancement in research', 'science', 'intermediate'),

-- Health Topics
('Should vaccination be mandatory?', 'Examine public health policy and individual choice', 'health', 'intermediate'),
('Should healthcare be completely free?', 'Debate universal healthcare systems and funding models', 'health', 'beginner'),

-- Culture Topics
('Should cultural appropriation be banned?', 'Examine cultural exchange versus exploitation', 'culture', 'intermediate'),
('Is globalization destroying local cultures?', 'Debate cultural preservation in an interconnected world', 'culture', 'intermediate');