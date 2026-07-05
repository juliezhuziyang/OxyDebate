-- Insert diverse debate topics for practice sessions
INSERT INTO public.topics (title, description, category, difficulty) VALUES
-- Technology
('Should artificial intelligence be regulated by government?', 'Debate the role of government in regulating AI development and deployment', 'technology', 'intermediate'),
('Social media platforms should be held liable for user-generated content', 'Examine platform responsibility for content moderation and free speech', 'technology', 'advanced'),
('Cryptocurrency should replace traditional banking', 'Analyze the future of digital currency versus traditional financial systems', 'technology', 'intermediate'),
('Gene editing should be banned in humans', 'Explore the ethics and risks of genetic modification in people', 'technology', 'advanced'),
('Internet access is a human right', 'Debate whether governments should guarantee universal internet access', 'technology', 'beginner'),

-- Environment
('Nuclear energy is essential for fighting climate change', 'Weigh nuclear power against renewable alternatives for carbon reduction', 'environment', 'intermediate'),
('Plastic bags should be banned worldwide', 'Examine environmental impact versus economic and practical concerns', 'environment', 'beginner'),
('Carbon taxes are the best solution to climate change', 'Debate market-based approaches to reducing greenhouse gas emissions', 'environment', 'advanced'),
('Veganism should be mandatory to save the planet', 'Explore dietary choices and their environmental impact', 'environment', 'intermediate'),
('Geoengineering is necessary to prevent climate disaster', 'Discuss technological interventions to modify Earth''s climate', 'environment', 'advanced'),

-- Education
('Standardized testing should be eliminated', 'Examine the role of standardized tests in measuring educational achievement', 'education', 'intermediate'),
('College education should be free for everyone', 'Debate public funding of higher education and its economic implications', 'education', 'intermediate'),
('Homeschooling produces better educated children', 'Compare homeschooling effectiveness with traditional schooling', 'education', 'beginner'),
('Schools should teach coding from elementary level', 'Discuss the importance of programming skills in modern education', 'education', 'beginner'),
('Grade inflation is harming student preparation', 'Examine the effects of easier grading on student readiness', 'education', 'intermediate'),

-- Healthcare
('Healthcare is a human right', 'Debate universal healthcare access and government responsibility', 'healthcare', 'intermediate'),
('Vaccines should be mandatory for all children', 'Examine public health versus individual choice in vaccination policy', 'healthcare', 'advanced'),
('Mental health days should be treated like sick days', 'Discuss workplace and school policies for mental health support', 'healthcare', 'beginner'),
('Alternative medicine should be regulated like pharmaceuticals', 'Explore standards and safety in non-traditional medical treatments', 'healthcare', 'intermediate'),
('Euthanasia should be legal everywhere', 'Debate end-of-life choices and medical ethics', 'healthcare', 'advanced'),

-- Economics
('Universal Basic Income will solve poverty', 'Analyze UBI as a solution to economic inequality and unemployment', 'economics', 'advanced'),
('Minimum wage should be $25 per hour', 'Examine the economic effects of significant minimum wage increases', 'economics', 'intermediate'),
('Billionaires should not exist', 'Debate wealth inequality and progressive taxation policies', 'economics', 'intermediate'),
('Capitalism is incompatible with environmental protection', 'Explore tensions between economic growth and environmental sustainability', 'economics', 'advanced'),
('Student loan debt should be forgiven', 'Discuss higher education financing and debt relief policies', 'economics', 'intermediate'),

-- Social Issues
('Social media is destroying democracy', 'Examine the impact of digital platforms on political discourse', 'social', 'intermediate'),
('Cultural appropriation is always harmful', 'Debate the boundaries between appreciation and appropriation of cultures', 'social', 'advanced'),
('Professional sports leagues should pay college athletes', 'Explore amateurism versus commercialization in college sports', 'social', 'intermediate'),
('Cancel culture protects marginalized communities', 'Examine accountability culture and its effects on society', 'social', 'advanced'),
('Reality TV shows exploit participants', 'Discuss ethics in entertainment and participant consent', 'social', 'beginner'),

-- General/Current Events
('Space exploration is a waste of money', 'Debate priorities between space programs and Earth-based problems', 'general', 'beginner'),
('Violent video games cause real-world violence', 'Examine the relationship between media consumption and behavior', 'general', 'intermediate'),
('The death penalty should be abolished worldwide', 'Explore justice, deterrence, and human rights in capital punishment', 'general', 'advanced'),
('Zoos should be banned as animal cruelty', 'Debate conservation versus animal welfare in zoological institutions', 'general', 'intermediate'),
('Social credit systems improve society', 'Examine government monitoring and behavioral incentives', 'general', 'advanced');